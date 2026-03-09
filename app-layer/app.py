"""
TRANSOLUX ENTERPRISES — FLASK BACKEND
======================================
VERIFY IT IS RUNNING:  open http://localhost:5000/test-db
If you see JSON with "success":true, Flask + MySQL are working.
"""
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, session, jsonify
from functools import wraps
import mysql.connector
from mysql.connector import Error
import os, time
from datetime import timedelta

# ══════════════════════════════════════════════
#  CONFIG
# ══════════════════════════════════════════════
app = Flask(__name__, static_folder='static', template_folder='Template')
app.secret_key               = os.getenv('FLASK_SECRET_KEY', 'transolux-dev-secret')
app.permanent_session_lifetime = timedelta(hours=3)

ADMIN_USER = os.getenv('ADMIN_USERNAME', 'ujwal')
ADMIN_PASS = os.getenv('ADMIN_PASSWORD', 'ujwal9494')
DB_HOST    = os.getenv('DB_HOST',        'mysql')
DB_USER    = os.getenv('DB_USER',        'root')
DB_PASS    = os.getenv('DB_PASSWORD',    'rootpassword')
DB_NAME    = os.getenv('DB_NAME',        'mywebsite')
TABLE      = 'contact_submissions'   # single source of truth

print("=" * 55)
print(f"  TRANSOLUX STARTING")
print(f"  DB  : {DB_USER}@{DB_HOST}/{DB_NAME}")
print(f"  TABLE : {TABLE}")
print("=" * 55)

# ══════════════════════════════════════════════
#  DB HELPERS
# ══════════════════════════════════════════════
def get_db():
    return mysql.connector.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASS,
        database=DB_NAME, connect_timeout=10, autocommit=True,
        charset='utf8mb4'
    )

def init_db(max_retries=20, delay=5):
    for attempt in range(1, max_retries + 1):
        try:
            print(f"[DB] Attempt {attempt}/{max_retries} …")
            # Create database if needed
            c = mysql.connector.connect(host=DB_HOST, user=DB_USER,
                    password=DB_PASS, connect_timeout=10, autocommit=True)
            c.cursor().execute(
                f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            c.close()

            # Create table
            conn = get_db()
            cur  = conn.cursor()
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS `{TABLE}` (
                    id         INT AUTO_INCREMENT PRIMARY KEY,
                    name       VARCHAR(255) NOT NULL,
                    email      VARCHAR(255) NOT NULL,
                    phone      VARCHAR(60)  DEFAULT '',
                    message    TEXT         NOT NULL,
                    ip_address VARCHAR(64)  DEFAULT '',
                    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_ts (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """)
            cur.close(); conn.close()
            print(f"[DB] ✅  Ready  (table={TABLE})")
            return True

        except Error as e:
            print(f"[DB] ❌  {e}")
            if attempt < max_retries:
                print(f"[DB]    Retry in {delay}s …")
                time.sleep(delay)
    return False

DB_OK = init_db()
print(f"\n{'✅ Ready' if DB_OK else '❌ DB unavailable — submissions will fail'}\n")

# ══════════════════════════════════════════════
#  AUTH
# ══════════════════════════════════════════════
def login_required(f):
    @wraps(f)
    def wrap(*a, **kw):
        if 'admin' not in session:
            if request.path.startswith('/admin/api/'):
                return jsonify({'error': 'Session expired', 'redirect': '/admin/login'}), 401
            return redirect(url_for('admin_login'))
        return f(*a, **kw)
    return wrap

# ══════════════════════════════════════════════
#  PUBLIC ROUTES
# ══════════════════════════════════════════════
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# ── /test-db  ──────────────────────────────────────────────
# Open http://localhost:5000/test-db  (or localhost/test-db via nginx)
# to instantly verify Flask + MySQL are connected and can write rows.
@app.route('/test-db')
def test_db():
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(f"""INSERT INTO `{TABLE}` (name, email, phone, message, ip_address)
                        VALUES (%s,%s,%s,%s,%s)""",
                    ('TEST USER', 'test@test.com', '+91 0000000000',
                     'Auto-inserted by /test-db endpoint', '127.0.0.1'))
        new_id = cur.lastrowid
        cur.close(); conn.close()
        return jsonify({
            'success': True,
            'message': f'Test row inserted! id={new_id}. '
                       f'Check /admin to see it.',
            'table': TABLE
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health')
def health():
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(f"SELECT COUNT(*) FROM `{TABLE}`")
        n = cur.fetchone()[0]; cur.close(); conn.close()
        return jsonify({'status': 'healthy', 'submissions': n, 'table': TABLE})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 503

# ── /submit  ───────────────────────────────────────────────
# ALWAYS returns JSON. Never redirects. Works with all nginx versions.
@app.route('/submit', methods=['POST'])
def submit():
    name    = (request.form.get('name',    '') or '').strip()
    email   = (request.form.get('email',   '') or '').strip()
    phone   = (request.form.get('phone',   '') or '').strip()
    message = (request.form.get('message', '') or '').strip()
    ip      = (request.headers.get('X-Forwarded-For', '') or
               request.remote_addr or '').split(',')[0].strip()

    print(f"[SUBMIT] name={name!r}  email={email!r}  phone={phone!r}  ip={ip}")

    # Validate
    if not name:
        return jsonify({'success': False, 'message': 'Name is required.'}), 400
    if not email or '@' not in email:
        return jsonify({'success': False, 'message': 'Valid email required.'}), 400
    if not message:
        return jsonify({'success': False, 'message': 'Message cannot be empty.'}), 400

    # Save
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(
            f"INSERT INTO `{TABLE}` (name, email, phone, message, ip_address) "
            f"VALUES (%s, %s, %s, %s, %s)",
            (name, email, phone, message, ip)
        )
        new_id = cur.lastrowid
        cur.close(); conn.close()
        print(f"[SUBMIT] ✅  Saved #{new_id}  —  {name} <{email}>")
        return jsonify({
            'success': True,
            'id':      new_id,
            'message': 'Thank you! Your enquiry has been received. We will contact you within 24 hours.'
        })
    except Error as e:
        print(f"[SUBMIT] ❌  DB error: {e}")
        return jsonify({'success': False, 'message': f'Database error: {e}'}), 500
    except Exception as e:
        print(f"[SUBMIT] ❌  Unexpected: {e}")
        return jsonify({'success': False, 'message': 'An unexpected error occurred.'}), 500

# Also accept /api/contact → same handler
app.add_url_rule('/api/contact', 'api_contact', submit, methods=['POST'])

# ══════════════════════════════════════════════
#  ADMIN ROUTES
# ══════════════════════════════════════════════
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if 'admin' in session:
        return redirect(url_for('admin_dashboard'))
    if request.method == 'POST':
        u = (request.form.get('username') or '').strip()
        p = (request.form.get('password') or '').strip()
        if u == ADMIN_USER and p == ADMIN_PASS:
            session.permanent = True
            session['admin'] = u
            return redirect(url_for('admin_dashboard'))
        return render_template('admin_login.html', error=True)
    return render_template('admin_login.html', error=False)

@app.route('/admin')
@login_required
def admin_dashboard():
    return render_template('admin.html', admin_username=session.get('admin', 'Admin'))

@app.route('/admin/api/data')
@login_required
def admin_data():
    try:
        conn = get_db(); cur = conn.cursor()

        cur.execute(f"SELECT COUNT(*) FROM `{TABLE}`"); total = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM `{TABLE}` WHERE DATE(created_at)=CURDATE()"); today = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM `{TABLE}` WHERE YEARWEEK(created_at,1)=YEARWEEK(CURDATE(),1)"); week = cur.fetchone()[0]
        cur.execute(f"SELECT COUNT(*) FROM `{TABLE}` WHERE YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE())"); month = cur.fetchone()[0]

        cur.execute(f"SELECT id,name,email,phone,message,ip_address,created_at FROM `{TABLE}` ORDER BY created_at DESC")
        rows = cur.fetchall(); cur.close(); conn.close()

        return jsonify({
            'stats': {'total': total, 'today': today, 'week': week, 'month': month},
            'submissions': [{
                'id':         r[0], 'name':    r[1], 'email':   r[2],
                'phone':      r[3] or '—', 'message': r[4],
                'ip':         r[5] or '—',
                'created_at': r[6].strftime('%d %b %Y, %I:%M %p')
            } for r in rows]
        })
    except Exception as e:
        print(f"[ADMIN DATA] ❌ {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/admin/api/delete/<int:rid>', methods=['POST'])
@login_required
def admin_delete(rid):
    try:
        conn = get_db(); cur = conn.cursor()
        cur.execute(f"DELETE FROM `{TABLE}` WHERE id=%s", (rid,))
        ok = cur.rowcount > 0; cur.close(); conn.close()
        return jsonify({'success': ok})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/admin/logout')
def admin_logout():
    session.clear()
    return redirect(url_for('admin_login'))

# ══════════════════════════════════════════════
#  ERROR HANDLERS
# ══════════════════════════════════════════════
@app.errorhandler(404)
def not_found(e):
    if '/api/' in request.path:
        return jsonify({'error': 'Not found'}), 404
    try:
        return send_from_directory(app.static_folder, 'index.html'), 404
    except Exception:
        return 'Not found', 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)