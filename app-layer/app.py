from flask import Flask, render_template, request, redirect, flash, url_for, send_from_directory, session, jsonify
from urllib.parse import quote
from functools import wraps
import mysql.connector
from mysql.connector import Error, pooling
import os
import time
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='static', template_folder='Template')
app.secret_key = 'transolux-enterprises-secret-key-2024'
app.permanent_session_lifetime = timedelta(hours=3)

# Admin credentials``
ADMIN_USERNAME = "ujwal"
ADMIN_PASSWORD = "ujwal9494"

# Database Configuration for Docker

db_host     = os.getenv("DB_HOST",     "mysql")
db_user     = os.getenv("DB_USER",     "root")
db_password = os.getenv("DB_PASSWORD", "rootpassword")
db_name     = os.getenv("DB_NAME",     "mywebsite")

print("=" * 50)
print(" DATABASE CONFIGURATION")
print("=" * 50)
print(f"Host: {db_host}")
print(f"User: {db_user}")
print(f"Database: {db_name}")
print("=" * 50)


connection_pool = None


def init_pool(max_retries=10, retry_delay=5):
    global connection_pool

    for attempt in range(max_retries):
        try:
            print(f"DB Attempt {attempt + 1}/{max_retries}")

            #  Bootstrap: create the database if it doesn't exist
            bootstrap = mysql.connector.connect(
                host=db_host, user=db_user, password=db_password,
                connect_timeout=30, autocommit=True
            )
            cur = bootstrap.cursor()
            cur.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`")
            cur.close()
            bootstrap.close()
            print(f" Database '{db_name}' created/verified")

            #  Create the table
            setup = mysql.connector.connect(
                host=db_host, user=db_user, password=db_password,
                database=db_name, connect_timeout=30, autocommit=True
            )
            cur = setup.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS contact_queries (
                    id         INT AUTO_INCREMENT PRIMARY KEY,
                    name       VARCHAR(255) NOT NULL,
                    email      VARCHAR(255) NOT NULL,
                    phone      VARCHAR(50),
                    message    TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            cur.close()
            setup.close()
            print(" Table 'contact_queries' created/verified")

            #  Build the pool
            connection_pool = pooling.MySQLConnectionPool(
                pool_name="transolux_pool",
                pool_size=5,
                host=db_host,
                user=db_user,
                password=db_password,
                database=db_name,
                connect_timeout=30,
                autocommit=True
            )
            print(" Connection pool created (size=5)")
            print("=" * 50)
            return True

        except Error as e:
            print(f" DB error: {e}")
            if attempt < max_retries - 1:
                print(f" Retry in {retry_delay}s …")
                time.sleep(retry_delay)

    print(" All DB attempts exhausted!")
    return False


def get_db():
    if connection_pool is None:
        raise RuntimeError("Database pool not initialised")
    return connection_pool.get_connection()


print("\n Starting Flask Application…")
if not init_pool():
    print("\n WARNING: DB init failed — DB features won't work.")
else:
    print("\n Application started successfully!")


#  AUTH DECORATOR 
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'admin_logged_in' not in session:
            if request.path.startswith('/admin/api/'):
                return jsonify({"error": "Session expired. Please log in again.", "redirect": "/admin/login"}), 401
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated


#  PUBLIC ROUTES 

@app.route('/')
def index():
    try:
        return send_from_directory(app.static_folder, 'index.html')
    except Exception as e:
        print(f" Error serving index.html: {e}")
        return f"Error: {e}", 500


@app.route('/health')
def health():
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM contact_queries")
        count = cur.fetchone()[0]
        cur.close()
        conn.close()
        return {"status": "healthy", "database": "connected", "submissions": count}, 200
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}, 503


@app.route('/submit', methods=['POST'])
def submit():
    try:
        name    = request.form.get('name',    '').strip()
        email   = request.form.get('email',   '').strip()
        phone   = request.form.get('phone',   '').strip()
        message = request.form.get('message', '').strip()

        print(f"New submission: {name} ({email})")

        if not name or not email or not message:
            return redirect('/?error=' + quote('Please fill in all required fields.'))
        if '@' not in email or '.' not in email:
            return redirect('/?error=' + quote('Please enter a valid email address.'))

        conn = get_db()
        cur  = conn.cursor()
        cur.execute(
            "INSERT INTO contact_queries (name, email, phone, message) VALUES (%s, %s, %s, %s)",
            (name, email, phone, message)
        )
        print(f" Saved! ID: {cur.lastrowid}")
        cur.close()
        conn.close()

        return redirect('/?success=' + quote('✓ Thank you! We will contact you soon.'))

    except RuntimeError as e:
        print(f" Pool error: {e}")
        return redirect('/?error=' + quote('Service temporarily unavailable. Please try again later.'))
    except Error as e:
        print(f" DB error: {e}")
        return redirect('/?error=' + quote('Error submitting form. Please try again.'))
    except Exception as e:
        print(f" Unexpected error: {e}")
        return redirect('/?error=' + quote('An unexpected error occurred. Please try again.'))


#  ADMIN ROUTES

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
            return redirect(url_for('admin'))
        else:
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

        cur.execute("SELECT COUNT(*) FROM contact_queries WHERE YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE())")
        month = cur.fetchone()[0]

        cur.execute("SELECT id, name, email, phone, message, created_at FROM contact_queries ORDER BY created_at DESC")
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
        return jsonify({"error": str(e)}), 500


@app.route('/admin/api/delete/<int:record_id>', methods=['POST'])
@login_required
def api_delete(record_id):
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("DELETE FROM contact_queries WHERE id = %s", (record_id,))
        cur.close()
        conn.close()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    session.pop('admin_username',  None)
    return redirect(url_for('admin_login'))


#  ERROR HANDLERS 

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

if __name__ == '__main__':
    print("\n Starting Flask server on http://0.0.0.0:5000")
    print(" Admin panel: http://localhost:5000/admin")
    print("  Health check: http://localhost:5000/health")
    app.run(host='0.0.0.0', port=5000, debug=True)