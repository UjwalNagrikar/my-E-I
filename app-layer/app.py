from flask import Flask, render_template, request, redirect, flash, url_for, send_from_directory, session, jsonify
from urllib.parse import quote
from functools import wraps
import mysql.connector
from mysql.connector import Error
import os
import time
from datetime import datetime, timedelta

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = 'transolux-enterprises-secret-key-2024'
app.permanent_session_lifetime = timedelta(hours=3)

# Admin credentials
ADMIN_USERNAME = "ujwal"
ADMIN_PASSWORD = "ujwal9494"

# Database Configuration for Docker
db_host = os.getenv("DB_HOST", "mysql")
db_user = os.getenv("DB_USER", "root")
db_password = os.getenv("DB_PASSWORD", "rootpassword")
db_name = os.getenv("DB_NAME", "mywebsite")

print("="*50)
print("🔧 DATABASE CONFIGURATION")
print("="*50)
print(f"Host: {db_host}")
print(f"User: {db_user}")
print(f"Database: {db_name}")
print("="*50)

# Global database connection
db = None
cursor = None

def init_database(max_retries=10, retry_delay=5):
    """Initialize database connection with retry logic for Docker startup"""
    global db, cursor

    for attempt in range(max_retries):
        try:
            print(f"\n🔄 Connection Attempt {attempt + 1}/{max_retries}")
            print(f"   Connecting to: {db_user}@{db_host}")

            db = mysql.connector.connect(
                host=db_host,
                user=db_user,
                password=db_password,
                connect_timeout=30,
                autocommit=True
            )

            cursor = db.cursor(buffered=True)
            print("✅ Connected to MySQL server!")

            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}`")
            print(f"✅ Database '{db_name}' created/verified")

            cursor.close()
            db.close()

            db = mysql.connector.connect(
                host=db_host,
                user=db_user,
                password=db_password,
                database=db_name,
                connect_timeout=30,
                autocommit=True
            )
            cursor = db.cursor(buffered=True)
            print(f"✅ Connected to database '{db_name}'")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS contact_queries (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    phone VARCHAR(50),
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_created_at (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            print("✅ Table 'contact_queries' created/verified")

            cursor.execute("SELECT COUNT(*) FROM contact_queries")
            count = cursor.fetchone()[0]
            print(f"✅ Database ready! Current submissions: {count}")
            print("="*50)

            return True

        except Error as e:
            print(f"❌ Connection failed: {e}")
            if attempt < max_retries - 1:
                print(f"⏳ Waiting {retry_delay} seconds before retry...")
                time.sleep(retry_delay)
            else:
                print("❌ All connection attempts exhausted!")
                return False
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            if attempt < max_retries - 1:
                print(f"⏳ Waiting {retry_delay} seconds before retry...")
                time.sleep(retry_delay)
            else:
                return False

    return False

print("\n🚀 Starting Flask Application...")
if not init_database():
    print("\n⚠️  WARNING: Database initialization failed!")
    print("⚠️  Application will start but database features won't work.")
else:
    print("\n🎉 Application started successfully!")

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function


# ── PUBLIC ROUTES ─────────────────────────────────────────

@app.route('/')
def index():
    try:
        return send_from_directory(app.static_folder, 'index.html')
    except Exception as e:
        print(f"❌ Error serving index.html: {e}")
        return f"Error: {e}", 500

@app.route('/health')
def health():
    try:
        if db and db.is_connected():
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.execute("SELECT COUNT(*) FROM contact_queries")
            count = cursor.fetchone()[0]
            return {"status": "healthy", "database": "connected", "submissions": count}, 200
        else:
            return {"status": "unhealthy", "database": "disconnected"}, 503
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}, 503

@app.route('/submit', methods=['POST'])
def submit():
    if not db or not db.is_connected():
        print("❌ Database not connected")
        return redirect('/?error=' + quote('Service temporarily unavailable. Please try again later.'))

    try:
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        phone = request.form.get('phone', '').strip()
        message = request.form.get('message', '').strip()

        print(f"\n📝 New submission: {name} ({email})")

        if not name or not email or not message:
            return redirect('/?error=' + quote('Please fill in all required fields.'))

        if '@' not in email or '.' not in email:
            return redirect('/?error=' + quote('Please enter a valid email address.'))

        sql = "INSERT INTO contact_queries (name, email, phone, message) VALUES (%s, %s, %s, %s)"
        values = (name, email, phone, message)

        cursor.execute(sql, values)
        db.commit()

        print(f"✅ Submission saved! ID: {cursor.lastrowid}")
        return redirect('/?success=' + quote('✓ Thank you! We will contact you soon.'))

    except Error as e:
        print(f"❌ Database error: {e}")
        db.rollback()
        return redirect('/?error=' + quote('Error submitting form. Please try again.'))
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return redirect('/?error=' + quote('An unexpected error occurred. Please try again.'))


# ── ADMIN ROUTES ──────────────────────────────────────────

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
            session['admin_username'] = username
            return redirect(url_for('admin'))
        else:
            return render_template('admin_login.html', error=True)

    return render_template('admin_login.html', error=False)


@app.route('/admin')
@login_required
def admin():
    if not db or not db.is_connected():
        return "Database not connected", 503
    return render_template('admin.html', admin_username=session.get('admin_username', 'Admin'))


@app.route('/admin/api/data')
@login_required
def admin_api_data():
    try:
        cursor.execute("SELECT COUNT(*) FROM contact_queries")
        total = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM contact_queries WHERE DATE(created_at) = CURDATE()")
        today = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM contact_queries WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)")
        week = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM contact_queries WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())")
        month = cursor.fetchone()[0]

        cursor.execute("SELECT id, name, email, phone, message, created_at FROM contact_queries ORDER BY created_at DESC")
        rows = cursor.fetchall()

        queries = []
        for r in rows:
            queries.append({
                "id": r[0],
                "name": r[1],
                "email": r[2],
                "phone": r[3] or "—",
                "message": r[4],
                "created_at": r[5].strftime('%d %b %Y, %I:%M %p')
            })

        return jsonify({
            "stats": {"total": total, "today": today, "week": week, "month": month},
            "queries": queries
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/api/delete/<int:id>', methods=['POST'])
@login_required
def api_delete(id):
    try:
        cursor.execute("DELETE FROM contact_queries WHERE id = %s", (id,))
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    session.pop('admin_username', None)
    return redirect(url_for('admin_login'))


# ── ERROR HANDLERS ────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500

@app.teardown_appcontext
def close_connection(exception):
    global db, cursor
    if cursor:
        try:
            cursor.close()
        except:
            pass
    if db and db.is_connected():
        try:
            db.close()
        except:
            pass

if __name__ == '__main__':
    print("\n🌐 Starting Flask server on http://0.0.0.0:5000")
    print("📊 Admin panel: http://localhost:5000/admin")
    print("❤️  Health check: http://localhost:5000/health")
    app.run(host='0.0.0.0', port=5000, debug=True)