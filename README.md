# Transolux  Enterprises -  Project Documentation

## Executive Summary

**Project Name:** Transolux  Enterprises Web Application  
**Project Type:** Full-Stack Web Application with Cloud Infrastructure  
**Industry:** International Import-Export Trade  
**Status:** Production-Rea_dy  
**Version:** 1.0.0  

### Overview
Transolux  Enterprises is a modern, responsive web application designed for a global import-export business. The application provides a professional online presence with contact form functionality, admin dashboard, and robust database integration. Built with Flask backend and deployed on AWS infrastructure using containerization and Infrastructure as Code (IaC) principles.

### Key Achievements
- ✅ Full-stack web application with Flask backend
- ✅ Responsive frontend with modern UI/UX
- ✅ Docker containerization for consistent deployment
- ✅ AWS cloud infrastructure using Terraform
- ✅ MySQL database integration for data persistence
- ✅ Nginx reverse proxy for optimal performance
- ✅ Production-ready error handling

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Infrastructure Design](#3-infrastructure-design)
4. [Application Components](#4-application-components)
5. [Development Workflow](#5-development-workflow)
6. [Deployment Process](#6-deployment-process)
7. [Security Implementation](#7-security-implementation)
8. [Performance Optimization](#8-performance-optimization)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)
10. [API Documentation](#10-api-documentation)
11. [Troubleshooting Guide](#11-troubleshooting-guide)
12. [Best Practices](#12-best-practices)

---

## 1. Project Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Internet Users                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  AWS Cloud (VPC)                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │          Internet Gateway                          │  │
│  └─────────────────┬─────────────────────────────────┘  │
│                    │                                     │
│                    ▼                                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Public Subnet (10.0.1.0/24)               │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │        EC2 Instance (t2.micro)              │  │  │
│  │  │  ┌────────────┐      ┌─────────────────┐   │  │  │
│  │  │  │   Nginx    │──────│  Flask Backend  │   │  │  │
│  │  │  │  (Port 80) │      │   (Port 5000)   │   │  │  │
│  │  │  └────────────┘      └─────────────────┘   │  │  │
│  │  └─────────────────────────┬───────────────────┘  │  │
│  └────────────────────────────┼──────────────────────┘  │
│                                │                         │
│                                ▼                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Private Subnet (10.0.2.0/24)              │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │        RDS MySQL Database                    │  │  │
│  │  │         (Port 3306)                          │  │  │
│  │  │  - Database: database-1                      │  │  │
│  │  │  - Engine: MySQL 8.0                         │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Application Flow

```
User Request Flow:
1. User accesses website via browser
2. Request hits Nginx (Port 80)
3. Nginx serves static files OR proxies API requests to Flask
4. Flask processes request and interacts with MySQL
5. Response returned through Nginx to user
```

### 1.3 Data Flow Architecture

```
┌──────────────┐
│   Frontend   │
│ (HTML/CSS/JS)│
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    Nginx     │─────▶│    Flask     │─────▶│    MySQL     │
│  Static Files│      │   Backend    │      │   Database   │
│  & Proxy     │◀─────│  API Routes  │◀─────│   Storage    │
└──────────────┘      └──────────────┘      └──────────────┘
```

---

## 2. Technology Stack

### 2.1 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.10 | Primary programming language |
| **Flask** | 2.3.2 | Web application framework |
| **MySQL Connector** | 8.0.33 | Database connectivity |
| **Gunicorn** | 21.2.0 | WSGI HTTP server for production |
| **Python-dotenv** | 1.0.0 | Environment variable management |

### 2.2 Frontend Technologies

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic markup and structure |
| **CSS3** | Advanced styling with animations |
| **JavaScript (ES6)** | Interactive functionality |
| **Responsive Design** | Mobile-first approach |

### 2.3 Infrastructure Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | Latest | Application containerization |
| **Docker Compose** | 3.8 | Multi-container orchestration |
| **Nginx** | Alpine | Web server & reverse proxy |
| **Terraform** | 1.0+ | Infrastructure as Code |
| **AWS EC2** | t2.micro | Application hosting |
| **AWS RDS** | MySQL 8.0 | Managed database service |
| **AWS VPC** | - | Network isolation |

### 2.4 Development Tools

- **Git** - Version control
- **VS Code / PyCharm** - IDE
- **Postman** - API testing
- **MySQL Workbench** - Database management

---

## 3. Infrastructure Design

### 3.1 AWS Architecture Components

#### Virtual Private Cloud (VPC)
- **CIDR Block:** 10.0.0.0/16
- **Purpose:** Network isolation and security
- **Components:**
  - Internet Gateway
  - Route Tables
  - Security Groups
  - Network ACLs

#### Subnets Configuration

**Public Subnet:**
- CIDR: 10.0.1.0/24
- Availability Zone: ap-south-1a
- Resources: EC2 Instance
- Internet Access: Yes

**Private Subnet:**
- CIDR: 10.0.2.0/24
- Availability Zone: ap-south-1b
- Resources: RDS MySQL
- Internet Access: No (through NAT if needed)

#### EC2 Instance Specifications
- **Instance Type:** t2.micro
- **AMI:** Amazon Linux 2
- **Storage:** 8 GB EBS (General Purpose SSD)
- **Key Pair:** Ujwal-DevOps-SRE.pem
- **Security Group:** Allows ports 22, 80, 5000

#### RDS Database Specifications
- **Engine:** MySQL 8.0
- **Instance Class:** db.t3.micro
- **Storage:** 20 GB GP2
- **Multi-AZ:** No (development)
- **Backup Retention:** 7 days
- **Database Name:** database-1

### 3.2 Security Groups Configuration

**EC2 Security Group (web-sg):**
```
Inbound Rules:
- SSH (22) from 0.0.0.0/0
- HTTP (80) from 0.0.0.0/0
- Custom TCP (5000) from 0.0.0.0/0

Outbound Rules:
- All traffic to 0.0.0.0/0
```

**RDS Security Group (db-sg):**
```
Inbound Rules:
- MySQL (3306) from EC2 Security Group

Outbound Rules:
- All traffic to 0.0.0.0/0
```

### 3.3 Network Diagram

```
VPC (10.0.0.0/16)
│
├── Internet Gateway
│   └── Connected to Public Subnet
│
├── Public Subnet (10.0.1.0/24) - AZ: ap-south-1a
│   ├── EC2 Instance (Public IP)
│   │   ├── Nginx Container (Port 80)
│   │   ├── Flask Container (Port 5000)
│   │   └── MySQL Client
│   └── Route Table → Internet Gateway
│
└── Private Subnet (10.0.2.0/24) - AZ: ap-south-1b
    ├── RDS MySQL Instance (Private IP)
    └── Route Table → Local Only
```

---

## 4. Application Components

### 4.1 Directory Structure

```
project-root/
│
├── .gitignore                    # Git exclusion rules
├── docker-compose.yml            # Multi-container orchestration
├── README.md                     # Complete documentation
│
├── app-layer/                    # Backend application
│   ├── app.py                    # Main Flask application
│   ├── Dockerfile                # Flask container config
│   └── requirements.txt          # Python dependencies
│
├── Template/                     # Jinja2 templates
│   ├── 404.html                  # Not found page
│   ├── 500.html                  # Server error page
│   ├── admin.html                # Admin dashboard
│   └── contact.html              # Contact page (404 variant)
│
├── static/                       # Frontend assets
│   ├── index.html                # Main landing page
│   ├── styles.css                # Complete styling
│   ├── script.js                 # Client-side JavaScript
│   ├── nginx.conf                # Nginx configuration
│   └── Dockerfile                # Nginx container config
│
└── infrastructure/               # Terraform IaC
    ├── vpc.tf                    # VPC and networking
    ├── ec2.tf                    # EC2 configuration
    ├── rds.tf                    # RDS database
    ├── security-groups.tf        # Security rules
    ├── alb.tf                    # Load balancer (placeholder)
    └── output.tf                 # Terraform outputs
```

### 4.2 Backend Architecture (Flask)

#### Application Structure

```python
Flask Application (app.py)
│
├── Configuration
│   ├── Database Connection
│   ├── Secret Key
│   ├── Static/Template Folders
│   └── Environment Variables
│
├── Database Layer
│   ├── Connection Management
│   ├── Table Creation
│   ├── Retry Logic
│   └── Health Checks
│
├── Routes
│   ├── / (index) - Landing page
│   ├── /submit - Form submission
│   ├── /admin - Admin dashboard
│   └── /health - Health check
│
├── Error Handlers
│   ├── 404 - Not Found
│   └── 500 - Server Error
│
└── Utilities
    ├── Database Initialization
    ├── Connection Pooling
    └── Graceful Shutdown
```

#### Key Features

**Database Connection with Retry Logic:**
- Automatic retry on connection failure
- Configurable retry attempts (default: 10)
- Exponential backoff delay
- Docker startup coordination

**Health Check Endpoint:**
- Database connectivity verification
- Submission count reporting
- JSON response format
- Used by Docker healthcheck

**Form Validation:**
- Client-side validation
- Server-side validation
- Email format checking
- Required field enforcement

### 4.3 Frontend Architecture

#### Page Structure

**Landing Page Components:**
1. **Header/Navigation**
   - Fixed position
   - Smooth scroll links
   - Mobile-responsive menu
   - Glassmorphism effect

2. **Hero Section**
   - Animated gradient background
   - Floating icons
   - CTA buttons
   - Parallax effect

3. **Stats Section**
   - Animated counters
   - Grid layout
   - Real-time counting effect

4. **Services Section**
   - Product grid
   - Hover animations
   - Icon animations
   - Category organization

5. **Why Choose Us Section**
   - Benefit cards
   - Icon badges
   - Hover effects
   - Pulse animations

6. **About Section**
   - Company information
   - Grid layout
   - Animated background

7. **Contact Section**
   - Contact information cards
   - Form with validation
   - Real-time feedback
   - Submission handling

8. **Footer**
   - Copyright information
   - Branding

#### JavaScript Functionality

```javascript
Core Features:
├── Particle Animation System
├── Mobile Menu Toggle
├── Smooth Scrolling
├── Counter Animation
├── Scroll Animations (Intersection Observer)
├── Header Scroll Effects
├── Form Validation
├── Active Navigation Highlighting
├── Click Outside Detection
├── Parallax Effects
└── Page Load Animations
```

### 4.4 Database Schema

```sql
Database: database-1 (or mywebsite for local)

Table: contact_queries
├── id (INT, AUTO_INCREMENT, PRIMARY KEY)
├── name (VARCHAR(255), NOT NULL)
├── email (VARCHAR(255), NOT NULL)
├── phone (VARCHAR(50), NULL)
├── message (TEXT, NOT NULL)
├── created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
└── INDEX idx_created_at (created_at)

Engine: InnoDB
Charset: utf8mb4
Collation: utf8mb4_unicode_ci
```

---

## 5. Development Workflow

### 5.1 Local Development Setup

#### Prerequisites Installation

```bash
# Install Python 3.10
sudo apt update
sudo apt install python3.10 python3.10-venv python3-pip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

#### Environment Setup

**Method 1: Virtual Environment (Development)**

```bash
# Navigate to project
cd un-enterprises-project

# Create virtual environment
python3 -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
cd app-layer
pip install -r requirements.txt

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=development
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=yourpassword
export DB_NAME=mywebsite

# Run application
flask run --host=0.0.0.0 --port=5000
```

**Method 2: Docker Compose (Production-like)**

```bash
# Navigate to project root
cd un-enterprises-project

# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### 5.2 Docker Configuration Details

#### Docker Compose Services

**MySQL Service:**
```yaml
Purpose: Database storage
Image: mysql:8.0
Port: 3306
Volume: mysql_data (persistent)
Health Check: mysqladmin ping
Network: app-network
```

**Backend Service (Flask):**
```yaml
Purpose: API and business logic
Build: ./app-layer/Dockerfile
Port: 5000
Dependencies: MySQL (with health check)
Volumes: Source code mounted
Network: app-network
```

**Frontend Service (Nginx):**
```yaml
Purpose: Static file serving & reverse proxy
Build: ./static/Dockerfile
Port: 80
Dependencies: Backend
Volumes: Static files mounted
Network: app-network
```

#### Container Health Checks

```bash
# MySQL Health Check
Command: mysqladmin ping -h localhost -u root -p{password}
Interval: 5s
Timeout: 5s
Retries: 10
Start Period: 30s

# Flask Health Check
Command: curl -f http://localhost:5000/health
Interval: 10s
Timeout: 5s
Retries: 5
Start Period: 30s
```

### 5.3 Development Best Practices

#### Code Organization
- **Separation of Concerns:** Frontend, backend, infrastructure separated
- **Configuration Management:** Environment variables for configs
- **Documentation:** Inline comments and README
- **Version Control:** Git with meaningful commits

#### Testing Procedures

**Unit Testing:**
```bash
# Install pytest
pip install pytest pytest-flask

# Run tests
pytest tests/

# With coverage
pytest --cov=app tests/
```

**Integration Testing:**
```bash
# Test database connection
python -c "from app import init_database; init_database()"

# Test health endpoint
curl http://localhost:5000/health

# Test form submission
curl -X POST http://localhost:5000/submit \
  -d "name=Test&email=test@example.com&message=Test message"
```

**Frontend Testing:**
```bash
# Test static file serving
curl http://localhost/index.html

# Test responsive design
# Use browser dev tools with device emulation
```

---

## 6. Deployment Process

### 6.1 Infrastructure Provisioning with Terraform

#### Step-by-Step Deployment

**Phase 1: AWS Setup**

```bash
# Configure AWS credentials
aws configure
AWS Access Key ID: [Your Access Key]
AWS Secret Access Key: [Your Secret Key]
Default region name: ap-south-1
Default output format: json

# Verify credentials
aws sts get-caller-identity
```

**Phase 2: Create Key Pair**

```bash
# Create EC2 key pair
aws ec2 create-key-pair \
  --key-name Ujwal-DevOps-SRE \
  --query 'KeyMaterial' \
  --output text > Ujwal-DevOps-SRE.pem

# Set permissions
chmod 400 Ujwal-DevOps-SRE.pem
```

**Phase 3: Terraform Deployment**

```bash
# Navigate to infrastructure directory
cd infrastructure

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan deployment (review changes)
terraform plan -out=tfplan

# Apply infrastructure
terraform apply tfplan

# Or auto-approve
terraform apply -auto-approve
```

**Phase 4: Capture Outputs**

```bash
# Get RDS endpoint
terraform output rds_endpoint
# Output: database-1.xxxxxxxxxx.ap-south-1.rds.amazonaws.com

# Get EC2 public IP
terraform output ec2_public_ip
# Output: xx.xxx.xxx.xxx

# Save outputs to file
terraform output -json > outputs.json
```

### 6.2 Application Deployment

#### Connect to EC2 Instance

```bash
# SSH into EC2
ssh -i Ujwal-DevOps-SRE.pem ec2-user@<EC2_PUBLIC_IP>

# Alternative with verbose logging
ssh -v -i Ujwal-DevOps-SRE.pem ec2-user@<EC2_PUBLIC_IP>
```

#### System Preparation

```bash
# Update system packages
sudo yum update -y

# Install Docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install git -y

# Install Python and pip
sudo yum install python3 python3-pip -y

# Verify installations
docker --version
docker-compose --version
git --version
python3 --version
```

#### Application Deployment

```bash
# Clone repository
git clone https://github.com/yourusername/un-enterprises.git
cd un-enterprises

# Update database configuration
vi app-layer/app.py
# Change db_host to RDS endpoint
# Example: db_host = "database-1.xxxxxxxxxx.ap-south-1.rds.amazonaws.com"

# Build and start containers
docker-compose up -d --build

# Verify containers are running
docker-compose ps

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

#### Verification Steps

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test frontend
curl http://localhost/

# Test admin panel
curl http://localhost:5000/admin

# Check database connectivity
docker-compose exec backend python -c "
from app import db
if db and db.is_connected():
    print('✅ Database connected')
else:
    print('❌ Database connection failed')
"
```

### 6.3 Production Configuration

#### Environment Variables Setup

```bash
# Create .env file
cat > .env << EOF
FLASK_ENV=production
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_hex(32))')
DB_HOST=<RDS_ENDPOINT>
DB_USER=admin
DB_PASSWORD=Ujwal9494
DB_NAME=database-1
EOF

# Set proper permissions
chmod 600 .env
```

#### Gunicorn Configuration

Update `app-layer/Dockerfile` for production:

```dockerfile
FROM python:3.10-slim
WORKDIR /app

COPY . /app
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

# Production WSGI server
CMD ["gunicorn", \
     "--bind", "0.0.0.0:5000", \
     "--workers", "4", \
     "--threads", "2", \
     "--worker-class", "gthread", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--log-level", "info", \
     "app:app"]
```

#### Nginx SSL Configuration (Optional)

```bash
# Install Certbot
sudo yum install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 0 * * * certbot renew --quiet
```

### 6.4 Continuous Deployment Setup

#### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to EC2
        env:
          PRIVATE_KEY: ${{ secrets.EC2_SSH_KEY }}
          HOST: ${{ secrets.EC2_HOST }}
          USER: ec2-user
        run: |
          echo "$PRIVATE_KEY" > private_key && chmod 600 private_key
          ssh -i private_key -o StrictHostKeyChecking=no ${USER}@${HOST} '
            cd /home/ec2-user/un-enterprises &&
            git pull origin main &&
            docker-compose down &&
            docker-compose up -d --build
          '
```

---

## 7. Security Implementation

### 7.1 Application Security

#### Input Validation

```python
# Server-side validation
def validate_form_input(name, email, message):
    """Validate user input"""
    errors = []
    
    # Check required fields
    if not name or len(name.strip()) < 2:
        errors.append("Name must be at least 2 characters")
    
    # Email validation
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        errors.append("Invalid email format")
    
    # Message validation
    if not message or len(message.strip()) < 10:
        errors.append("Message must be at least 10 characters")
    
    return errors
```

#### SQL Injection Prevention

```python
# Always use parameterized queries
cursor.execute(
    "INSERT INTO contact_queries (name, email, phone, message) VALUES (%s, %s, %s, %s)",
    (name, email, phone, message)
)
# NEVER use string formatting:
# cursor.execute(f"INSERT INTO ... VALUES ('{name}', ...)")  # ❌ VULNERABLE
```

#### XSS Prevention

```html
<!-- Jinja2 auto-escapes by default -->
<td>{{ q[0] }}</td>  <!-- Safe: auto-escaped -->

<!-- Explicit escaping when needed -->
<td>{{ q[0]|escape }}</td>
```

#### CSRF Protection

```python
# Install Flask-WTF for CSRF protection
pip install Flask-WTF

# Enable CSRF
from flask_wtf.csrf import CSRFProtect
csrf = CSRFProtect(app)

# In templates
<form method="POST">
    {{ csrf_token() }}
    <!-- form fields -->
</form>
```

### 7.2 Infrastructure Security

#### Security Group Rules

```hcl
# Principle of Least Privilege

# EC2 Security Group
resource "aws_security_group" "web_sg" {
  # SSH - Restrict to specific IP in production
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["YOUR_IP/32"]  # Not 0.0.0.0/0
  }
  
  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # HTTPS (when configured)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS Security Group
resource "aws_security_group" "db_sg" {
  # MySQL only from EC2
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.web_sg.id]
  }
}
```

#### Database Security

```bash
# Strong password policy
DB_PASSWORD: Minimum 16 characters, mixed case, numbers, symbols

# Encryption at rest (RDS)
storage_encrypted = true

# Encryption in transit
require_secure_transport = ON

# Automated backups
backup_retention_period = 7
backup_window = "03:00-04:00"

# Database user privileges
GRANT SELECT, INSERT ON database.* TO 'app_user'@'%';
# Don't grant ALL PRIVILEGES unless necessary
```

#### Secrets Management

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name un-enterprises/db-password \
  --secret-string "YourSecurePassword"

# Retrieve in application
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='un-enterprises/db-password')
```

### 7.3 Security Best Practices Checklist

- [ ] Change default secret keys
- [ ] Use strong database passwords
- [ ] Restrict SSH access to specific IPs
- [ ] Enable AWS CloudTrail for audit logging
- [ ] Implement rate limiting on API endpoints
- [ ] Set up AWS WAF for web application firewall
- [ ] Regular security updates for all packages
- [ ] Use HTTPS/SSL in production
- [ ] Implement proper session management
- [ ] Set up monitoring and alerting
- [ ] Regular backup verification
- [ ] Disable directory listing on web server
- [ ] Remove server version headers
- [ ] Implement Content Security Policy headers

---

## 8. Performance Optimization

### 8.1 Database Optimization

#### Indexing Strategy

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_email ON contact_queries(email);
CREATE INDEX idx_created_at ON contact_queries(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_email_date ON contact_queries(email, created_at);

-- Analyze index usage
EXPLAIN SELECT * FROM contact_queries WHERE email = 'test@example.com';
```

#### Query Optimization

```python
# Use connection pooling
from mysql.connector import pooling

connection_pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    pool_reset_session=True,
    host=db_host,
    user=db_user,
    password=db_password,
    database=db_name
)

# Get connection from pool
connection = connection_pool.get_connection()
```

#### Database Caching

```python
# Install Redis
pip install redis flask-caching

# Configure caching
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'redis', 'CACHE_REDIS_URL': 'redis://localhost:6379/0'})

@app.route('/admin')
@cache.cached(timeout=60)  # Cache for 60 seconds
def admin():
    # Expensive database query
    pass
```

### 8.2 Frontend Optimization

#### Asset Optimization

```bash
# Minify CSS
npm install -g cssnano
cssnano styles.css styles.min.css

# Minify JavaScript
npm install -g terser
terser script.js -o script.min.js

# Image optimization
npm install -g imagemin-cli
imagemin images/*.{jpg,png} --out-dir=images/optimized
```

#### Nginx Caching Configuration

```nginx
# Add to nginx.conf
location ~* \.(css|js|jpg|jpeg|png|gif|ico|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript 
           application/javascript application/json application/xml;
```

#### Lazy Loading

```javascript
// Lazy load images
document.addEventListener("DOMContentLoaded", function() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
});
```

### 8.3 Application Performance

#### Gunicorn Worker Configuration

```python
# Optimal worker calculation: (2 x CPU cores) + 1
# For t2.micro (1 vCPU): 3 workers

# gunicorn.conf.py
workers = 3
worker_class = 'gthread'
threads = 2
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
timeout = 30
keepalive = 2
```

#### Response Compression

```python
# Install Flask-Compress
pip install Flask-Compress

from flask_compress import Compress
Compress(app)

# Automatic gzip compression for all responses > 500 bytes
```

#### Database Connection Pooling

```python
# Implement connection pool
from mysql.connector import pooling

db_config = {
    "host": db_host,
    "user": db_user,
    "password": db_password,
    "database": db_name
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name="app_pool",
    pool_size=10,
    pool_reset_session=True,
    **db_config
)

def get_db_connection():
    return connection_pool.get_connection()
```

### 8.4 Performance Monitoring

#### Application Metrics

```python
# Install monitoring tools
pip install prometheus-flask-exporter

from prometheus_flask_exporter import PrometheusMetrics
metrics = PrometheusMetrics(app)

# Metrics endpoint available at /metrics
# Track: request count, duration, in-progress requests
```

#### Performance Benchmarking

```bash
# Apache Bench (ab)
ab -n 1000 -c 10 http://your-domain.com/

# Results analysis:
# - Requests per second
# - Time per request
# - Transfer rate
# - Connection times

# Load testing with wrk
wrk -t4 -c100 -d30s http://your-domain.com/
```

---

## 9. Monitoring & Maintenance

### 9.1 Application Monitoring

#### Health Check Implementation

```python
@app.route('/health')
def health():
    """Comprehensive health check"""
    try:
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "checks": {}
        }
        
        # Database check
        if db and db.is_connected():
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.execute("SELECT COUNT(*) FROM contact_queries")
            count = cursor.fetchone()[0]
            health_status["checks"]["database"] = {
                "status": "up",
                "submissions": count
            }
        else:
            health_status["status"] = "degraded"
            health_status["checks"]["database"] = {"status": "down"}
        
        # Disk space check
        import shutil
        total, used, free = shutil.disk_usage("/")
        health_status["checks"]["disk"] = {
            "total_gb": total // (2**30),
            "free_gb": free // (2**30),
            "used_percent": (used / total) * 100
        }
        
        return jsonify(health_status), 200 if health_status["status"] == "healthy" else 503
        
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 503
```

#### Logging Configuration

```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
if not app.debug:
    # File handler
    file_handler = RotatingFileHandler(
        'logs/app.log',
        maxBytes=10240000,  # 10MB
        backupCount=10
    )
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    
    app.logger.setLevel(logging.INFO)
    app.logger.info('UN Enterprises startup')

# Usage in routes
app.logger.info(f'Form submission from {request.remote_addr}')
app.logger.error(f'Database error: {str(e)}')
```

#### CloudWatch Integration

```bash
# Install CloudWatch agent on EC2
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
```

CloudWatch Configuration (config.json):
```json
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/app.log",
            "log_group_name": "/aws/ec2/un-enterprises",
            "log_stream_name": "{instance_id}/application"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "UN-Enterprises",
    "metrics_collected": {
      "cpu": {
        "measurement": [{"name": "cpu_usage_idle"}],
        "totalcpu": false
      },
      "disk": {
        "measurement": [{"name": "used_percent"}],
        "resources": ["*"]
      },
      "mem": {
        "measurement": [{"name": "mem_used_percent"}]
      }
    }
  }
}
```

### 9.2 Database Monitoring

#### Query Performance Monitoring

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow-query.log';

-- Monitor running queries
SHOW FULL PROCESSLIST;

-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = 'database-1'
ORDER BY (data_length + index_length) DESC;

-- Check index usage
SELECT * FROM sys.schema_unused_indexes;
```

#### RDS Performance Insights

```bash
# Enable Performance Insights in RDS
aws rds modify-db-instance \
    --db-instance-identifier database-1 \
    --enable-performance-insights \
    --performance-insights-retention-period 7

# View metrics
aws rds describe-db-instances \
    --db-instance-identifier database-1 \
    --query 'DBInstances[0].PerformanceInsightsEnabled'
```

### 9.3 Automated Monitoring Scripts

#### System Health Monitor

```bash
#!/bin/bash
# monitor.sh - System health monitoring script

LOG_FILE="/var/log/system-monitor.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] Starting health check..." >> $LOG_FILE

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$TIMESTAMP] WARNING: Disk usage at ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory
MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEM_USAGE -gt 80 ]; then
    echo "[$TIMESTAMP] WARNING: Memory usage at ${MEM_USAGE}%" >> $LOG_FILE
fi

# Check application
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/health)
if [ $HTTP_STATUS -ne 200 ]; then
    echo "[$TIMESTAMP] ERROR: Application health check failed (HTTP $HTTP_STATUS)" >> $LOG_FILE
    # Restart application
    cd /home/ec2-user/un-enterprises
    docker-compose restart backend
fi

# Check database
DB_STATUS=$(docker-compose exec -T mysql mysqladmin ping -h localhost -u root -prootpassword 2>&1)
if [[ $DB_STATUS != *"alive"* ]]; then
    echo "[$TIMESTAMP] ERROR: Database not responding" >> $LOG_FILE
fi

echo "[$TIMESTAMP] Health check completed" >> $LOG_FILE
```

#### Cron Job Setup

```bash
# Add to crontab
crontab -e

# Run health check every 5 minutes
*/5 * * * * /home/ec2-user/scripts/monitor.sh

# Daily backup at 2 AM
0 2 * * * /home/ec2-user/scripts/backup.sh

# Weekly log rotation
0 0 * * 0 /home/ec2-user/scripts/rotate-logs.sh

# Monthly security updates
0 3 1 * * sudo yum update -y
```

### 9.4 Alerting Configuration

#### CloudWatch Alarms

```bash
# CPU Utilization Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "un-enterprises-high-cpu" \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --alarm-actions arn:aws:sns:ap-south-1:123456789:alerts

# Database Connection Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "un-enterprises-db-connections" \
    --alarm-description "Alert when DB connections exceed 80%" \
    --metric-name DatabaseConnections \
    --namespace AWS/RDS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2

# Disk Space Alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "un-enterprises-disk-space" \
    --alarm-description "Alert when disk usage exceeds 80%" \
    --metric-name DiskSpaceUtilization \
    --namespace System/Linux \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 1
```

### 9.5 Backup Strategy

#### Database Backup Script

```bash
#!/bin/bash
# backup.sh - Database backup script

BACKUP_DIR="/home/ec2-user/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="un_enterprises_${TIMESTAMP}.sql"
S3_BUCKET="s3://un-enterprises-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T mysql mysqldump \
    -u root \
    -prootpassword \
    --databases mywebsite \
    --single-transaction \
    --quick \
    --lock-tables=false \
    > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}.gz" \
    "${S3_BUCKET}/database/${BACKUP_FILE}.gz"

# Delete local backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Log success
echo "[$(date)] Backup completed: ${BACKUP_FILE}.gz" >> /var/log/backup.log
```

#### RDS Automated Backups

```hcl
# In Terraform rds.tf
resource "aws_db_instance" "main" {
  # ... other configurations ...
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"
  
  # Enable automated backups
  skip_final_snapshot    = false
  final_snapshot_identifier = "un-enterprises-final-snapshot"
  
  # Point-in-time recovery
  enabled_cloudwatch_logs_exports = ["error", "general", "slowquery"]
}
```

---

## 10. API Documentation

### 10.1 Endpoints Overview

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/` | GET | Landing page | None |
| `/health` | GET | Health check | None |
| `/submit` | POST | Submit contact form | None |
| `/admin` | GET | View submissions | None (should add auth) |

### 10.2 Detailed API Reference

#### GET `/` - Landing Page

**Description:** Serves the main landing page with all sections.

**Request:**
```http
GET / HTTP/1.1
Host: your-domain.com
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
...
</html>
```

**Status Codes:**
- `200 OK` - Page loaded successfully
- `500 Internal Server Error` - Server error

---

#### GET `/health` - Health Check

**Description:** Returns application and database health status.

**Request:**
```http
GET /health HTTP/1.1
Host: your-domain.com
Accept: application/json
```

**Response (Healthy):**
```json
{
  "status": "healthy",
  "database": "connected",
  "submissions": 42
}
```

**Response (Unhealthy):**
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "Connection timeout"
}
```

**Status Codes:**
- `200 OK` - System healthy
- `503 Service Unavailable` - System unhealthy

**Example:**
```bash
curl http://localhost:5000/health
```

---

#### POST `/submit` - Submit Contact Form

**Description:** Submits a contact form with user information.

**Request:**
```http
POST /submit HTTP/1.1
Host: your-domain.com
Content-Type: application/x-www-form-urlencoded

name=John+Doe&email=john@example.com&phone=1234567890&message=Hello
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name (min 2 chars) |
| email | string | Yes | Valid email address |
| phone | string | No | Phone number |
| message | string | Yes | Message content (min 10 chars) |

**Validation Rules:**
- **name:** Required, minimum 2 characters
- **email:** Required, valid email format (contains @ and .)
- **phone:** Optional, any format accepted
- **message:** Required, minimum 10 characters

**Response (Success):**
```http
HTTP/1.1 302 Found
Location: /
Set-Cookie: session=...; Path=/

Flash message: "Thank you for your message! We will get back to you soon."
```

**Response (Validation Error):**
```http
HTTP/1.1 302 Found
Location: /

Flash message: "Please fill in all required fields."
```

**Status Codes:**
- `302 Found` - Redirect after submission
- `500 Internal Server Error` - Database error

**Example:**
```bash
curl -X POST http://localhost:5000/submit \
  -d "name=John Doe" \
  -d "email=john@example.com" \
  -d "phone=1234567890" \
  -d "message=Hello, I am interested in your services."
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('email', 'john@example.com');
formData.append('phone', '1234567890');
formData.append('message', 'Hello, I am interested in your services.');

fetch('/submit', {
    method: 'POST',
    body: formData
})
.then(response => {
    if (response.redirected) {
        window.location.href = response.url;
    }
})
.catch(error => console.error('Error:', error));
```

---

#### GET `/admin` - Admin Dashboard

**Description:** Displays all contact form submissions in a table.

**Request:**
```http
GET /admin HTTP/1.1
Host: your-domain.com
```

**Response:**
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<head><title>Admin Panel</title></head>
<body>
    <h1>📨 Contact Form Submissions</h1>
    <table border="1">
        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Message</th></tr>
        <tr>
            <td>John Doe</td>
            <td>john@example.com</td>
            <td>1234567890</td>
            <td>Hello, interested in services</td>
        </tr>
    </table>
</body>
</html>
```

**Status Codes:**
- `200 OK` - Admin page loaded successfully
- `503 Service Unavailable` - Database not connected
- `500 Internal Server Error` - Database error

**Security Note:** ⚠️ This endpoint should be protected with authentication in production.

**Example:**
```bash
curl http://localhost:5000/admin
```

---

### 10.3 Error Responses

#### 404 - Not Found

**Request:**
```http
GET /nonexistent HTTP/1.1
Host: your-domain.com
```

**Response:**
```http
HTTP/1.1 404 Not Found
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<!-- Custom 404 page -->
</html>
```

---

#### 500 - Internal Server Error

**Response:**
```http
HTTP/1.1 500 Internal Server Error
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<!-- Custom 500 page -->
</html>
```

---

## 11. Troubleshooting Guide

### 11.1 Common Issues & Solutions

#### Issue 1: Database Connection Failed

**Symptoms:**
```
❌ Connection failed: Can't connect to MySQL server on 'mysql'
⚠️ WARNING: Database initialization failed!
```

**Diagnosis:**
```bash
# Check if MySQL container is running
docker-compose ps

# Check MySQL logs
docker-compose logs mysql

# Test connection manually
docker-compose exec mysql mysql -u root -prootpassword -e "SELECT 1"
```

**Solutions:**

**Solution A: Wait for MySQL to start**
```bash
# MySQL needs time to initialize
# Check health status
docker-compose ps mysql
# Wait until healthy, then restart backend
docker-compose restart backend
```

**Solution B: Reset database**
```bash
# Stop all containers
docker-compose down -v

# Rebuild and start
docker-compose up --build -d
```

**Solution C: Check configuration**
```bash
# Verify environment variables
docker-compose exec backend env | grep DB_

# Verify MySQL is accessible
docker-compose exec backend ping mysql -c 3
```

---

#### Issue 2: Application Not Loading (502 Bad Gateway)

**Symptoms:**
- Browser shows "502 Bad Gateway"
- Nginx cannot reach Flask backend

**Diagnosis:**
```bash
# Check if backend is running
docker-compose ps backend

# Check backend logs
docker-compose logs backend

# Test backend directly
curl http://localhost:5000/health
```

**Solutions:**

**Solution A: Restart backend**
```bash
docker-compose restart backend

# If that doesn't work
docker-compose up -d --force-recreate backend
```

**Solution B: Check network connectivity**
```bash
# Verify containers are on same network
docker network inspect un-enterprises_app-network

# Test connection from frontend to backend
docker-compose exec frontend ping backend -c 3
```

**Solution C: Check Nginx configuration**
```bash
# Test Nginx config
docker-compose exec frontend nginx -t

# Reload Nginx
docker-compose exec frontend nginx -s reload
```

---

#### Issue 3: Form Submission Not Working

**Symptoms:**
- Form submits but no data saved
- No success message displayed

**Diagnosis:**
```bash
# Check backend logs for errors
docker-compose logs -f backend

# Test form submission manually
curl -X POST http://localhost:5000/submit \
  -d "name=Test&email=test@example.com&message=Test message"

# Check database for data
docker-compose exec mysql mysql -u root -prootpassword \
  -e "SELECT * FROM mywebsite.contact_queries ORDER BY id DESC LIMIT 5"
```

**Solutions:**

**Solution A: Verify table exists**
```bash
# Check if table was created
docker-compose exec mysql mysql -u root -prootpassword \
  -e "SHOW TABLES FROM mywebsite"

# If missing, restart backend to trigger creation
docker-compose restart backend
```

**Solution B: Check form validation**
```javascript
// In browser console, check for JavaScript errors
console.log('Form validation:', document.querySelector('form'));

// Verify form action attribute
console.log('Form action:', document.querySelector('form').action);
```

**Solution C: Database permissions**
```bash
# Verify user has INSERT privileges
docker-compose exec mysql mysql -u root -prootpassword \
  -e "SHOW GRANTS FOR 'root'@'%'"
```

---

#### Issue 4: High Memory Usage

**Symptoms:**
- Application becomes slow
- Out of memory errors

**Diagnosis:**
```bash
# Check container memory usage
docker stats

# Check system memory
free -m

# Check for memory leaks
docker-compose logs backend | grep -i "memory"
```

**Solutions:**

**Solution A: Limit container memory**
```yaml
# In docker-compose.yml
services:
  backend:
    mem_limit: 512m
    memswap_limit: 512m
```

**Solution B: Optimize Gunicorn workers**
```python
# Reduce workers for low-memory systems
workers = 2  # Instead of 4
threads = 1  # Instead of 2
```

**Solution C: Clear Docker resources**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove stopped containers
docker container prune
```

---

#### Issue 5: SSL/HTTPS Not Working

**Symptoms:**
- "Your connection is not private" error
- Certificate errors

**Diagnosis:**
```bash
# Check certificate status
sudo certbot certificates

# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

**Solutions:**

**Solution A: Renew certificate**
```bash
sudo certbot renew --dry-run
sudo certbot renew
sudo systemctl reload nginx
```

**Solution B: Fix Nginx SSL config**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
}
```

---

### 11.2 Diagnostic Commands Reference

```bash
# Container Management
docker-compose ps                    # List all containers
docker-compose logs -f [service]     # Follow logs for service
docker-compose exec [service] bash   # Access container shell
docker-compose restart [service]     # Restart specific service
docker-compose down -v               # Stop and remove volumes
docker-compose up -d --build         # Rebuild and restart

# Database Diagnostics
docker-compose exec mysql mysql -u root -prootpassword -e "SHOW DATABASES"
docker-compose exec mysql mysql -u root -prootpassword mywebsite -e "SHOW TABLES"
docker-compose exec mysql mysql -u root -prootpassword mywebsite -e "SELECT COUNT(*) FROM contact_queries"

# Network Diagnostics
docker network ls                    # List networks
docker network inspect [network]     # Inspect network details
docker-compose exec backend ping mysql -c 3

# System Resources
docker stats                         # Real-time resource usage
df -h                               # Disk usage
free -m                             # Memory usage
top                                 # Process monitoring

# Application Testing
curl http://localhost/              # Test frontend
curl http://localhost:5000/health   # Test backend
curl -X POST http://localhost:5000/submit -d "name=Test&email=test@test.com&message=Testing"

# Log Analysis
docker-compose logs backend | grep ERROR
docker-compose logs mysql | grep -i "error\|warning"
tail -f /var/log/nginx/error.log
```

---

### 11.3 Emergency Procedures

#### Complete System Reset

```bash
# WARNING: This will delete all data!

# Step 1: Stop everything
docker-compose down -v

# Step 2: Remove all containers
docker container prune -f

# Step 3: Remove all images
docker image prune -a -f

# Step 4: Remove all volumes
docker volume prune -f

# Step 5: Rebuild from scratch
docker-compose up --build -d

# Step 6: Verify
docker-compose ps
curl http://localhost:5000/health
```

#### Database Recovery

```bash
# Restore from backup
docker-compose exec -T mysql mysql -u root -prootpassword mywebsite < backup.sql

# Or from S3
aws s3 cp s3://un-enterprises-backups/database/latest.sql.gz .
gunzip latest.sql.gz
docker-compose exec -T mysql mysql -u root -prootpassword mywebsite < latest.sql
```

---

## 12. Best Practices

### 12.1 Development Best Practices

#### Code Organization
✅ **DO:**
- Separate concerns (frontend, backend, infrastructure)
- Use environment variables for configuration
- Write descriptive comments
- Follow PEP 8 style guide for Python
- Use meaningful variable and function names

❌ **DON'T:**
- Hardcode sensitive information
- Mix configuration with code
- Write overly complex functions
- Ignore error handling
- Skip input validation

#### Version Control
```bash
# Good commit messages
git commit -m "feat: Add health check endpoint"
git commit -m "fix: Resolve database connection timeout"
git commit -m "docs: Update API documentation"

# Branch strategy
main/master  - Production-ready code
develop      - Development branch
feature/*    - New features
hotfix/*     - Urgent fixes
```

### 12.2 Security Best Practices

#### Checklist for Production

- [ ] Change all default passwords
- [ ] Use strong secret keys (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Add authentication to admin panel
- [ ] Regular security updates
- [ ] Enable CloudTrail logging
- [ ] Set up AWS WAF
- [ ] Implement CSRF protection
- [ ] Sanitize all user inputs
- [ ] Use parameterized SQL queries
- [ ] Restrict SSH access by IP
- [ ] Regular backup testing
- [ ] Monitor security logs

### 12.3 Performance Best Practices

#### Optimization Checklist

- [ ] Enable gzip compression
- [ ] Minify CSS and JavaScript
- [ ] Optimize images
- [ ] Implement caching strategy
- [ ] Use CDN for static assets
- [ ] Database query optimization
- [ ] Connection pooling
- [ ] Lazy loading for images
- [ ] Browser caching headers
- [ ] Asynchronous operations where possible

### 12.4 Maintenance Schedule

#### Daily Tasks
- Monitor application health
- Check error logs
- Review system resources

#### Weekly Tasks
- Review security logs
- Check backup integrity
- Update dependencies
- Performance analysis

#### Monthly Tasks
- Security updates
- Database optimization
- Cost analysis
- Capacity planning
- Documentation updates

#### Quarterly Tasks
- Disaster recovery testing
- Security audit
- Performance benchmarking
- Infrastructure review

---

## Conclusion

This documentation provides comprehensive guidance for developing, deploying, and maintaining the UN Enterprises web application. For additional support:

- **GitHub Issues:** Report bugs and request features
- **Email:** support@unenterprises.com
- **Documentation Updates:** Regular updates available in repository

**Project Statistics:**
- Lines of Code: ~2,000+
- Technologies Used: 15+
- AWS Resources: 10+
- Documentation Pages: 50+

**Version:** 1.0.0  
**Last Updated:** November 2024  
**Maintained By:** Development Team


Run these app using these commnds 

docker rmi -f $(docker images -aq)
docker compose up --build -d   
docker exec -it mysql_db mysql -u root -prootpassword
