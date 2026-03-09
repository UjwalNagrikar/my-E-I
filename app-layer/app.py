from flask import (
    Flask, render_template, request, redirect,
    url_for, send_from_directory, session, jsonify
)
from functools import wraps
import mysql.connector
from mysql.connector import Error, pooling
import os
import time
from datetime import timedelta

# ══════════════════════════════════════════════════════
#  APP SETUP
# ══════════════════════════════════════════════════════
app = Flask(__name__, static_folder='static', template_folder='Template')

app.secret_key = os.getenv('FLASK_SECRET_KEY', 'transolux-enterprises-secret-key-2024')
app.permanent_session_lifetime = timedelta(hours=3)

ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'ujwal')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'ujwal9494')

DB_HOST     = os.getenv('DB_HOST',     'mysql')
DB_USER     = os.getenv('DB_USER',     'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'rootpassword')
DB_NAME     = os.getenv('DB_NAME',     'mywebsite')

print("=" * 50)
print(" TRANSOLUX — STARTING")
print(f" DB: {DB_USER}@{DB_HOST}/{DB_NAME}")
print("=" * 50)

# ══════════════════════════════════════════════════════
#  DATABASE POOL
# ══════════════════════════════════════════════════════
connection_pool = None


def init_pool(max_retries=10, retry_delay=5):
    global connection_pool
    for attempt in range(max_retries):
        try:
            print(f"[DB] Attempt {attempt + 1}/{max_retries} ...")

            # 1. Ensure the database exists
            bootstrap = mysql.connector.connect(
                host=DB_HOST, user=DB_USER, password=DB_PASSWORD,
                connect_timeout=30, autocommit=True
            )
            cur = bootstrap.cursor()
            cur.execute(
                f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
            cur.close()
            bootstrap.close()

            # 2. Create tables
            setup = mysql.connector.connect(
                host=DB_HOST, user=DB_USER, password=DB_PASSWORD,
                database=DB_NAME, connect_timeout=30, autocommit=True
            )
            cur = setup.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS contact_queries (
                    id         INT AUTO_INCREMENT PRIMARY KEY,
                    name       VARCHAR(255) NOT NULL,
                    email      VARCHAR(255) NOT NULL,
                    phone      VARCHAR(100),
                    message    TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            cur.close()
            setup.close()
            print("[DB] Tables ready")

            # 3. Build pool
            connection_pool = pooling.MySQLConnectionPool(
                pool_name="transolux_pool",
                pool_size=5,
                host=DB_HOST, user=DB_USER,
                password=DB_PASSWORD, database=DB_NAME,
                connect_timeout=30, autocommit=True
            )
            print("[DB] Pool ready (size=5)")
            print("=" * 50)
            return True

        except Error as e:
            print(f"[DB] Error: {e}")
            if attempt < max_retries - 1:
                print(f"[DB] Retrying in {retry_delay}s ...")
                time.sleep(retry_delay)

    print("[DB] All attempts exhausted")
    return False


def get_db():
    if connection_pool is None:
        raise RuntimeError("Database pool not initialised")
    return connection_pool.get_connection()


if not init_pool():
    print("\nWARNING: DB unavailable — form submissions will not save.\n")
else:
    print("\nApplication ready!\n")


# ══════════════════════════════════════════════════════
#  AUTH DECORATOR
# ══════════════════════════════════════════════════════
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'admin_logged_in' not in session:
            if request.path.startswith('/admin/api/'):
                return jsonify({
                    "error": "Session expired. Please log in again.",
                    "redirect": "/admin/login"
                }), 401
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated


# ══════════════════════════════════════════════════════
#  PUBLIC ROUTES
# ══════════════════════════════════════════════════════
@app.route('/')
def index():
    try:
        return send_from_directory(app.static_folder, 'index.html')
    except Exception as e:
        return str(e), 500


@app.route('/health')
def health():
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM contact_queries")
        count = cur.fetchone()[0]
        cur.close()
        conn.close()
        return jsonify({"status": "healthy", "database": "connected", "submissions": count}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 503


@app.route('/submit', methods=['POST'])
def submit():
    name    = request.form.get('name',    '').strip()
    email   = request.form.get('email',   '').strip()
    phone   = request.form.get('phone',   '').strip()
    message = request.form.get('message', '').strip()

    is_fetch = request.headers.get('X-Requested-With') == 'fetch'

    # Validate
    if not name or not email or not message:
        err = 'Please fill in all required fields.'
        return (jsonify({"success": False, "message": err}), 400) if is_fetch \
               else redirect(f'/?error={err}')
    if '@' not in email or '.' not in email:
        err = 'Please enter a valid email address.'
        return (jsonify({"success": False, "message": err}), 400) if is_fetch \
               else redirect(f'/?error={err}')

    # Save to database
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(
            "INSERT INTO contact_queries (name, email, phone, message) VALUES (%s,%s,%s,%s)",
            (name, email, phone, message)
        )
        new_id = cur.lastrowid
        cur.close()
        conn.close()
        print(f"[SUBMIT] Saved enquiry #{new_id} from {name} ({email})")

        ok_msg = 'Thank you! Your enquiry has been received. We will contact you within 24 hours.'
        return jsonify({"success": True, "message": ok_msg}) if is_fetch \
               else redirect(f'/?success={ok_msg}')

    except RuntimeError as e:
        print(f"[SUBMIT] Pool error: {e}")
        err = 'Service temporarily unavailable. Please try again later.'
        return (jsonify({"success": False, "message": err}), 503) if is_fetch \
               else redirect(f'/?error={err}')

    except Error as e:
        print(f"[SUBMIT] DB error: {e}")
        err = 'Error saving your enquiry. Please try again.'
        return (jsonify({"success": False, "message": err}), 500) if is_fetch \
               else redirect(f'/?error={err}')

    except Exception as e:
        print(f"[SUBMIT] Unexpected error: {e}")
        err = 'An unexpected error occurred. Please try again.'
        return (jsonify({"success": False, "message": err}), 500) if is_fetch \
               else redirect(f'/?error={err}')


# ══════════════════════════════════════════════════════
#  ADMIN ROUTES
# ══════════════════════════════════════════════════════
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if 'admin_logged_in' in session:
        return redirect(url_for('admin'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session.permanent = True
            session['admin_logged_in'] = True
            session['admin_username']  = username
            print(f"[ADMIN] Login: {username}")
            return redirect(url_for('admin'))
        print(f"[ADMIN] Failed login for '{username}'")
        return render_template('admin_login.html', error=True)

    return render_template('admin_login.html', error=False)


@app.route('/admin')
@login_required
def admin():
    return render_template('admin.html', admin_username=session.get('admin_username', 'Admin'))


@app.route('/admin/api/data')
@login_required
def admin_api_data():
    try:
        conn = get_db()
        cur  = conn.cursor()

        cur.execute("SELECT COUNT(*) FROM contact_queries")
        total = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM contact_queries WHERE DATE(created_at) = CURDATE()")
        today = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM contact_queries WHERE YEARWEEK(created_at,1) = YEARWEEK(CURDATE(),1)")
        week = cur.fetchone()[0]

        cur.execute(
            "SELECT COUNT(*) FROM contact_queries "
            "WHERE YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE())"
        )
        month = cur.fetchone()[0]

        cur.execute(
            "SELECT id, name, email, phone, message, created_at "
            "FROM contact_queries ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()

        queries = [
            {
                "id":         r[0],
                "name":       r[1],
                "email":      r[2],
                "phone":      r[3] or "—",
                "message":    r[4],
                "created_at": r[5].strftime('%d %b %Y, %I:%M %p')
            }
            for r in rows
        ]

        return jsonify({
            "stats":   {"total": total, "today": today, "week": week, "month": month},
            "queries": queries
        })

    except Exception as e:
        print(f"[ADMIN DATA] Error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/admin/api/delete/<int:record_id>', methods=['POST'])
@login_required
def api_delete(record_id):
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("DELETE FROM contact_queries WHERE id = %s", (record_id,))
        affected = cur.rowcount
        cur.close()
        conn.close()
        if affected == 0:
            return jsonify({"success": False, "error": "Record not found"}), 404
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/logout')
def admin_logout():
    session.clear()
    return redirect(url_for('admin_login'))


# ══════════════════════════════════════════════════════
#  ERROR HANDLERS
# ══════════════════════════════════════════════════════
@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/admin/api/') or request.path.startswith('/api/'):
        return jsonify({"error": "Not found"}), 404
    try:
        return send_from_directory(app.static_folder, 'index.html'), 404
    except Exception:
        return "Not found", 404


@app.errorhandler(500)
def server_error(e):
    print(f"[ERROR] 500: {e}")
    return jsonify({"error": "Internal server error"}), 500


# ══════════════════════════════════════════════════════
#  ENTRY POINT
# ══════════════════════════════════════════════════════
if __name__ == '__main__':
    print("\nStarting on http://0.0.0.0:5000")
    print("Admin:  http://localhost:5000/admin")
    print("Health: http://localhost:5000/health\n")
    app.run(host='0.0.0.0', port=5000, debug=True)