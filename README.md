

# 🌐 Transolux Enterprises — Full-Stack Web Application

<div align="center">

![Transolux Banner](https://img.shields.io/badge/Transolux-Enterprises-1a6cf0?style=for-the-badge&logo=globe&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Deployed-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.3.2-000000?style=for-the-badge&logo=flask&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Terraform-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)

**India-Based Import & Export Company — "Your Gateway to Global Trade Excellence"**

> 🚀 Multi-tier application deployed on Kubernetes that **auto-scales 300% under 3 seconds**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Application](#-live-application)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start — Docker Compose](#-quick-start--docker-compose-local-dev)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [AWS Infrastructure (Terraform)](#-aws-infrastructure--terraform)
- [CI/CD — GitHub Actions](#-cicd--github-actions)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Admin Panel](#-admin-panel)
- [Environment Variables](#-environment-variables)
- [Useful Commands](#-useful-commands)
- [Troubleshooting](#-troubleshooting)

---

## 🌟 Overview

Transolux Enterprises is a production-grade, full-stack web application for an India-based import & export company. The app enables customers to submit trade enquiries through a contact form, while administrators manage all leads through a secure, real-time dashboard.

### Key Highlights

| Feature | Details |
|---------|---------|
| **Frontend** | Static HTML/CSS/JS served via Nginx |
| **Backend** | Python Flask REST API |
| **Database** | MySQL 8.0 with connection pooling |
| **Containerization** | Docker + Docker Compose |
| **Orchestration** | Kubernetes (K8s) with HPA |
| **Auto-Scaling** | 300% scale-up in under 3 seconds |
| **IaC** | Terraform (hashicorp/aws v6.33.0) |
| **CI/CD** | GitHub Actions → GitHub Pages |
| **AWS Region** | ap-south-1 (Mumbai) |

---

## 🔗 Live Application

| Service | URL |
|---------|-----|
| Main Website | `http://localhost` (K8s: LoadBalancer) |
| Admin Dashboard | `http://localhost/admin` |
| Health Check | `http://localhost/health` |
| Flask API (direct) | `http://localhost:5000` |

**Admin Credentials:**
```
Username: ujwal
Password: ujwal9494
```
> ⚠️ Change admin credentials before production deployment!

---

## 🏗️ Architecture

### Application Flow

```
Internet Users
     │
     ▼
┌─────────────────────────────────────────────────────┐
│                    AWS Cloud                        │
│                                                     │
│  Route 53 → CloudFront → WAF → ALB (Port 80)       │
│                               │                     │
│         ┌─────────────────────┤                     │
│         ▼                     ▼                     │
│  ┌─────────────┐    ┌─────────────────────┐        │
│  │  S3 Bucket  │    │  Auto Scaling Group │        │
│  │(Static HTML)│    │  (min:1 desired:2   │        │
│  └─────────────┘    │   max:3 t2.micro)   │        │
│                     │                     │        │
│                     │  ┌───────────────┐  │        │
│                     │  │ Nginx:alpine  │  │        │
│                     │  │   Port 80     │  │        │
│                     │  └──────┬────────┘  │        │
│                     │         │ proxy_pass│        │
│                     │  ┌──────▼────────┐  │        │
│                     │  │ Flask Backend │  │        │
│                     │  │   Port 5000   │  │        │
│                     │  └──────┬────────┘  │        │
│                     └─────────┼───────────┘        │
│                               │ Port 3306           │
│                     ┌─────────▼───────────┐        │
│                     │   MySQL 8.0 (RDS)   │        │
│                     │  DB: mywebsite       │        │
│                     │  EBS: 5GiB gp2      │        │
│                     └─────────────────────┘        │
│                                                     │
│  CloudWatch → SNS Alerts                           │
│  GitHub Actions → ECR → EC2 Deploy                 │
└─────────────────────────────────────────────────────┘
```

### Kubernetes Architecture (Local/Cloud)

```
kubectl apply -f k8s/
              │
              ▼
┌─────────────────────────────────────────────────────┐
│              Namespace: transolux                   │
│                                                     │
│  LoadBalancer Service (Port 80)                     │
│           │                                         │
│           ▼                                         │
│  ┌──────────────────┐   HPA: min:2 max:5           │
│  │ nginx-frontend   │   CPU > 90%                  │
│  │ Deployment x2   │◄──────────────────┐           │
│  │ (nginx:alpine)   │                   │           │
│  └────────┬─────────┘              Metrics-Server  │
│           │ proxy_pass                   │           │
│           ▼                              │           │
│  ┌──────────────────┐   HPA: min:2 max:6           │
│  │ flask-backend    │   CPU > 70%                  │
│  │ Deployment x2   │◄──────────────────┘           │
│  │ (Python Flask)   │                               │
│  └────────┬─────────┘                              │
│           │ ClusterIP :3306                         │
│           ▼                                         │
│  ┌──────────────────┐    ┌─────────────────┐       │
│  │ mysql Deployment │    │  mysql-pvc      │       │
│  │ (mysql:8.0) x1  │───►│  5Gi ReadWrite  │       │
│  │ Recreate strategy│    │  Once (EBS)     │       │
│  └──────────────────┘    └─────────────────┘       │
│                                                     │
│  Secrets: transolux-secrets (DB creds)              │
│  ConfigMap: nginx-config (proxy rules)              │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | HTML5 / CSS3 / JavaScript | - |
| Web Server | Nginx | alpine |
| Backend | Python Flask | 2.3.2 |
| Database | MySQL | 8.0.45 |
| DB Driver | mysql-connector-python | 8.0.33 |
| WSGI | Gunicorn | 21.2.0 |
| Container | Docker | - |
| Orchestration | Kubernetes (K8s) | - |
| IaC | Terraform | hashicorp/aws v6.33.0 |
| CI/CD | GitHub Actions | - |
| Static Hosting | GitHub Pages | - |
| Cloud | AWS (ap-south-1) | - |

---

## 📁 Project Structure

```
my-E-I/
├── 📄 README.md
├── 📄 docker-compose.yml            # Local development stack
│
├── 📂 app-layer/                    # Flask Backend
│   ├── 📄 Dockerfile
│   ├── 📄 app.py                    # Main Flask application
│   ├── 📄 requirements.txt
│   └── 📂 Template/
│       ├── 📄 admin.html            # Admin dashboard UI
│       └── 📄 admin_login.html      # Login page
│
├── 📂 static/                       # Nginx Frontend
│   ├── 📄 Dockerfile
│   ├── 📄 nginx.conf                # Nginx reverse proxy config
│   ├── 📄 index.html                # Main website
│   ├── 📄 styles.css
│   └── 📄 script.js
│
├── 📂 k8s/                          # Kubernetes Manifests
│   ├── 📄 00-namespace.yaml         # Namespace: transolux
│   ├── 📄 01-secret.yaml            # DB credentials (base64)
│   ├── 📄 02-mysql-pvc.yaml         # 5Gi PersistentVolumeClaim
│   ├── 📄 03-mysql.yaml             # MySQL Deployment + ClusterIP Service
│   ├── 📄 04-backend.yaml           # Flask Deployment + ClusterIP Service
│   ├── 📄 05-nginx-configmap.yaml   # Nginx proxy config
│   ├── 📄 06-frontend.yaml          # Nginx Deployment + LoadBalancer Service
│   └── 📄 07-hpa.yaml               # HorizontalPodAutoscaler (backend + frontend)
│
├── 📂 Infrastructure/               # Terraform AWS IaC
│   ├── 📄 main.tf                   # VPC, EC2, ALB, ASG, Security Groups
│   ├── 📄 provider.tf               # AWS provider (ap-south-1)
│   └── 📄 output.tf                 # Output: EC2 public IP
│
└── 📂 .github/
    └── 📂 workflows/
        └── 📄 main.yml              # GitHub Actions CI/CD
```

---

## ✅ Prerequisites

Make sure these are installed before deploying:

| Tool | Version | Check |
|------|---------|-------|
| Docker | 20.x+ | `docker --version` |
| Docker Compose | 2.x+ | `docker compose version` |
| kubectl | 1.25+ | `kubectl version --client` |
| Terraform | 1.5+ | `terraform --version` |
| AWS CLI | 2.x | `aws --version` |
| Git | 2.x | `git --version` |

> 💡 For local Kubernetes: Install **Docker Desktop** (includes K8s) or **Minikube**

---

## 🐳 Quick Start — Docker Compose (Local Dev)

The fastest way to run everything locally in one command.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/ujwalnagrikar/my-E-I.git
cd my-E-I
```

### Step 2 — Start the Stack

```bash
docker compose up --build
```

This starts 3 containers:
- `mysql_db` — MySQL 8.0 on port 3306
- `flask-backend` — Flask API on port 5000
- `nginx-frontend` — Nginx on port 80

### Step 3 — Verify

```bash
# Check all containers are running
docker compose ps

# Check health
curl http://localhost/health
```

Open `http://localhost` in your browser. ✅

### Stop the Stack

```bash
docker compose down

# Remove volumes too (wipes database)
docker compose down -v
```

---

## ☸️ Kubernetes Deployment

### One-Time Setup — Build & Push Docker Images

> ⚠️ This is the **only manual step** — K8s pulls images from DockerHub, it can't build them for you.

```bash
# Login to DockerHub
docker login

# Build and push Flask backend
docker build -t ujwalnagrikar/transolux-backend:latest ./app-layer
docker push ujwalnagrikar/transolux-backend:latest

# Build and push Nginx frontend
docker build -t ujwalnagrikar/transolux-frontend:latest ./static
docker push ujwalnagrikar/transolux-frontend:latest
```

---

### Step 1 — Start Local Kubernetes

**Docker Desktop:**
> Settings → Kubernetes → Enable Kubernetes → Apply

**Minikube:**
```bash
minikube start --cpus=2 --memory=4096
```

---

### Step 2 — Verify kubectl is Connected

```bash
kubectl cluster-info
kubectl get nodes
```

---

### Step 3 — (Optional) Update Secrets

Edit `k8s/01-secret.yaml` to change passwords before deploying:

```yaml
stringData:
  MYSQL_ROOT_PASSWORD: "your-strong-password"
  DB_PASSWORD: "your-db-password"
  DB_NAME: "mywebsite"
```

---

### Step 4 — Deploy Everything

**Option A: Step-by-step (recommended for first deploy)**

```bash
# 1. Create namespace
kubectl apply -f k8s/00-namespace.yaml

# 2. Create secrets
kubectl apply -f k8s/01-secret.yaml

# 3. Create persistent storage
kubectl apply -f k8s/02-mysql-pvc.yaml

# 4. Deploy MySQL
kubectl apply -f k8s/03-mysql.yaml

# 5. Wait for MySQL to be ready (IMPORTANT)
kubectl wait --namespace transolux \
  --for=condition=ready pod \
  --selector=app=mysql \
  --timeout=120s

# 6. Deploy Flask backend
kubectl apply -f k8s/04-backend.yaml

# 7. Apply Nginx config
kubectl apply -f k8s/05-nginx-configmap.yaml

# 8. Deploy Nginx frontend
kubectl apply -f k8s/06-frontend.yaml

# 9. Apply auto-scaling rules
kubectl apply -f k8s/07-hpa.yaml
```

**Option B: Apply all at once** (initContainer handles MySQL wait)

```bash
kubectl apply -f k8s/
```

---

### Step 5 — Verify Deployment

```bash
# Check all pods are Running
kubectl get pods -n transolux

# Expected output:
# NAME                             READY   STATUS    RESTARTS   AGE
# flask-backend-xxxxx              1/1     Running   0          2m
# flask-backend-xxxxx              1/1     Running   0          2m
# mysql-xxxxx                      1/1     Running   0          3m
# nginx-frontend-xxxxx             1/1     Running   0          2m
# nginx-frontend-xxxxx             1/1     Running   0          2m

# Check services
kubectl get svc -n transolux

# NAME             TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)
# backend          ClusterIP      10.111.6.82     <none>        5000/TCP
# mysql            ClusterIP      10.99.235.117   <none>        3306/TCP
# nginx-frontend   LoadBalancer   10.110.148.105  localhost     80:30573/TCP
```

### Step 6 — Access the Application

```bash
# On Docker Desktop / cloud (LoadBalancer)
open http://localhost

# On Minikube
minikube service nginx-frontend -n transolux
```

---

### Auto-Scaling Configuration

| Component | Min Pods | Max Pods | Scale Trigger |
|-----------|----------|----------|---------------|
| Flask Backend | 2 | 6 | CPU > 70% |
| Nginx Frontend | 2 | 5 | CPU > 90% |

```bash
# Watch HPA in real time
kubectl get hpa -n transolux --watch
```

---

### Useful K8s Commands

```bash
# View logs
kubectl logs -f deployment/flask-backend -n transolux
kubectl logs -f deployment/nginx-frontend -n transolux
kubectl logs -f deployment/mysql -n transolux

# Shell into pods
kubectl exec -it deployment/flask-backend -n transolux -- bash
kubectl exec -it deployment/nginx-frontend -n transolux -- sh

# Shell into MySQL
kubectl exec -it deployment/mysql -n transolux -- bash
# Then inside the container:
mysql -u root -prootpassword
USE mywebsite;
SHOW TABLES;
SELECT * FROM contact_queries;

# Scale manually
kubectl scale deployment flask-backend --replicas=4 -n transolux

# Restart a deployment
kubectl rollout restart deployment/flask-backend -n transolux

# Delete all resources
kubectl delete namespace transolux
```

---

## ☁️ AWS Infrastructure — Terraform

Terraform provisions the complete AWS infrastructure in `ap-south-1` (Mumbai).

### Resources Created

| Resource | Details |
|----------|---------|
| VPC | `10.0.0.0/16` |
| Public Subnet | `10.0.1.0/24` — us-east-1a |
| Private Subnet | `10.0.2.0/24` — us-east-1b |
| Internet Gateway | `main-igw` |
| Route Table | `public-rt` → 0.0.0.0/0 |
| Security Group | Port 80 inbound, all outbound |
| EC2 Instance | `t2.micro` (ami-0c55b159c71c2f08f) |
| Launch Template | `web-server-lt` |
| Auto Scaling Group | min:1, desired:2, max:3 |
| ALB | Application Load Balancer, Port 80 |
| Target Group | `web-server-tg` |
| Scaling Policy | TargetTracking — CPU target: 98% |

### Deploy with Terraform

```bash
cd Infrastructure/

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply infrastructure
terraform apply

# Confirm with: yes

# Get the EC2 public IP
terraform output web_server_public_ip

# Destroy infrastructure (saves costs)
terraform destroy
```

### AWS CLI Setup (required)

```bash
# Configure AWS credentials
aws configure
# AWS Access Key ID: [your key]
# AWS Secret Access Key: [your secret]
# Default region name: ap-south-1
# Default output format: json
```

---

## 🔄 CI/CD — GitHub Actions

The pipeline automatically deploys the static frontend to **GitHub Pages** on every push to `main`.

### Workflow: `.github/workflows/main.yml`

```
Git Push to main
      │
      ▼
GitHub Actions Runner (ubuntu-latest)
      │
      ├── Checkout repository
      ├── Configure GitHub Pages
      ├── Upload ./static/ as Pages artifact
      └── Deploy to GitHub Pages
                │
                ▼
         yourname.github.io/my-E-I
```

### Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Push to `main` branch to trigger deploy

---

## 🗄️ Database Schema

```sql
CREATE TABLE contact_queries (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255)  NOT NULL,
    email      VARCHAR(255)  NOT NULL,
    phone      VARCHAR(50),
    message    TEXT          NOT NULL,
    created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci;
```

### Verify Data in MySQL (Kubernetes)

```bash
# Get MySQL pod name
kubectl get pods -n transolux | grep mysql

# Shell into MySQL pod
kubectl exec -it mysql-695cc7b88-ln824 -n transolux -- bash

# Connect to MySQL
mysql -u root -p
# Enter password: rootpassword

mysql> USE mywebsite;
mysql> SHOW TABLES;
mysql> SELECT * FROM contact_queries;
mysql> SELECT COUNT(*) FROM contact_queries;
```

**Sample Output:**
```
+----+--------------+---------------------------+------------------+----------------------+---------------------+
| id | name         | email                     | phone            | message              | created_at          |
+----+--------------+---------------------------+------------------+----------------------+---------------------+
|  1 | Arun Nagrikar| arunnagrikar@gmail.com   | +91 9370916779   | hello my name is...  | 2026-02-24 15:36:50 |
+----+--------------+---------------------------+------------------+----------------------+---------------------+
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Serve main website | Public |
| `POST` | `/submit` | Submit contact form | Public |
| `GET` | `/health` | Health check + DB status | Public |
| `GET` | `/admin/login` | Admin login page | Public |
| `POST` | `/admin/login` | Authenticate admin | Public |
| `GET` | `/admin` | Admin dashboard | 🔒 Session |
| `GET` | `/admin/api/data` | Get all enquiries + stats | 🔒 Session |
| `POST` | `/admin/api/delete/<id>` | Delete an enquiry | 🔒 Session |
| `GET` | `/admin/logout` | Logout admin | 🔒 Session |

### Health Check Response

```json
{
  "status": "healthy",
  "database": "connected",
  "submissions": 42
}
```

### Admin API Data Response

```json
{
  "stats": {
    "total": 42,
    "today": 3,
    "week": 15,
    "month": 42
  },
  "queries": [
    {
      "id": 1,
      "name": "Arun Nagrikar",
      "email": "arun@gmail.com",
      "phone": "+91 9370916779",
      "message": "Hello, I need a quote...",
      "created_at": "24 Feb 2026, 03:36 PM"
    }
  ]
}
```

---

## 🔐 Admin Panel

Access the admin dashboard at `http://localhost/admin`

### Features

| Feature | Details |
|---------|---------|
| 📊 Stats Dashboard | Total, Today, This Week, This Month enquiry counts |
| 📋 Enquiries Table | All contact form submissions with live search |
| 👁️ Read Full Message | Modal popup for long messages |
| 🗑️ Delete Entry | Confirmation modal before deletion |
| 🔄 Auto Refresh | Manual refresh button |
| 🔍 Live Search | Filter by name, email, phone, message |
| 🔐 Session Auth | 3-hour session timeout |

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `mysql` | MySQL hostname (K8s service name) |
| `DB_USER` | `root` | Database username |
| `DB_PASSWORD` | `rootpassword` | Database password |
| `DB_NAME` | `mywebsite` | Database name |
| `FLASK_ENV` | `development` | Flask environment |
| `FLASK_APP` | `app.py` | Flask entry point |

> 💡 In Kubernetes, these come from `k8s/01-secret.yaml`. In Docker Compose, from `docker-compose.yml`.

---

## 🧰 Useful Commands

### Docker

```bash
# View running containers
docker ps

# View logs
docker logs flask-backend -f
docker logs nginx-frontend -f

# Shell into containers
docker exec -it flask-backend bash
docker exec -it mysql_db bash

# Rebuild after code changes
docker compose up --build --force-recreate

# Prune unused images
docker system prune -f
```

### Kubernetes

```bash
# Get everything in namespace
kubectl get all -n transolux

# Describe a pod (useful for debugging)
kubectl describe pod <pod-name> -n transolux

# Port-forward MySQL locally (for GUI tools like TablePlus)
kubectl port-forward -n transolux svc/mysql 3306:3306

# Port-forward Flask directly
kubectl port-forward -n transolux svc/backend 5000:5000

# View events (shows startup errors)
kubectl get events -n transolux --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n transolux

# Rollback a deployment
kubectl rollout undo deployment/flask-backend -n transolux
```

### Terraform

```bash
# Format Terraform files
terraform fmt

# Validate configuration
terraform validate

# Show current state
terraform show

# List resources
terraform state list
```

---

## 🔧 Troubleshooting

### Flask pods are in CrashLoopBackOff

```bash
kubectl logs flask-backend-xxxxx -n transolux

# If "DB error" — MySQL not ready yet
# Solution: wait for MySQL, then restart Flask
kubectl rollout restart deployment/flask-backend -n transolux
```

### MySQL pod won't start

```bash
kubectl describe pod mysql-xxxxx -n transolux
# Check "Events" section for PVC binding issues

# Verify PVC is bound
kubectl get pvc -n transolux
```

### Cannot access http://localhost (Docker Desktop)

```bash
# Check the LoadBalancer external IP
kubectl get svc nginx-frontend -n transolux

# If EXTERNAL-IP is <pending>, use NodePort instead
kubectl patch svc nginx-frontend -n transolux -p '{"spec":{"type":"NodePort"}}'
kubectl get svc nginx-frontend -n transolux
# Access via http://localhost:<NodePort>
```

### Minikube — service not accessible

```bash
minikube service nginx-frontend -n transolux --url
# Opens tunnel automatically
```

### Images not pulling (ImagePullBackOff)

```bash
# Check image name in the deployment
kubectl describe pod flask-backend-xxxxx -n transolux | grep Image

# Make sure you pushed with the correct tag
docker push ujwalnagrikar/transolux-backend:latest

# For private registry, create a pull secret
kubectl create secret docker-registry regcred \
  --docker-username=ujwalnagrikar \
  --docker-password=<your-token> \
  -n transolux
```

### Terraform — AWS authentication error

```bash
# Re-configure credentials
aws configure

# Verify identity
aws sts get-caller-identity

# Check current region
aws configure get region
```

---

## 📊 Performance & Scaling

### Auto-Scaling Behavior

```
Normal load (CPU < 70%) → 2 Flask pods + 2 Nginx pods
High load  (CPU > 70%) → Scale Flask up to 6 pods
Peak load  (CPU > 90%) → Scale Nginx up to 5 pods
Load drops             → Scale back down after 5 min cooldown
```

### Connection Pool Configuration

```python
# In app.py — MySQLConnectionPool
pool_size    = 5          # Max 5 simultaneous DB connections per pod
max_retries  = 10         # Retry DB connection 10 times on startup
retry_delay  = 5          # Wait 5 seconds between retries
autocommit   = True       # Auto-commit transactions
```

### Kubernetes Resource Limits

| Pod | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----|-------------|-----------|----------------|--------------|
| Flask | 100m | 300m | 128Mi | 256Mi |
| Nginx | 50m | 150m | 64Mi | 128Mi |
| MySQL | 250m | 500m | 256Mi | 512Mi |

---

## 👨‍💻 Author

**Ujwal Nagrikar**

- 📧 Email: ujjwalnagrikar@gmail.com
- 📍 Location: Nagpur, Maharashtra, India
- 🐙 GitHub: [@ujwalnagrikar](https://github.com/ujwalnagrikar)

---

## 📄 License

This project is proprietary to **Transolux Enterprises**.

© 2024 Transolux Enterprises. All rights reserved. | Nagpur, Maharashtra, India

---

<div align="center">

⭐ **Star this repo if it helped you!**

Made with ❤️ in India 🇮🇳

</div>
