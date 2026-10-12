# FoodKart Platform — Cloud-Native DevOps Project

A containerized food-ordering backend demonstrating application delivery, CI/CD automation, cloud infrastructure provisioning, and Kubernetes deployment.

## Architecture

```text
Developer
    |
    v
GitHub Repository
    |
    v
Jenkins CI/CD Pipeline
    |
    +--> Install Dependencies
    +--> Run Jest Tests
    +--> Connect to AWS EC2
    +--> Deploy Application
    +--> Verify Application Health
    +--> Rollback on Deployment Failure
                 |
                 v
             AWS EC2
                 |
                 v
           Docker Compose
             /       \
            v         v
      Node.js API  PostgreSQL
```

The project also includes a local Kubernetes deployment using Minikube.

## Technology Stack

- **Application:** Node.js, Express.js
- **Database:** PostgreSQL
- **Containers:** Docker, Docker Compose
- **CI/CD:** Jenkins
- **Cloud:** AWS EC2
- **Infrastructure as Code:** Terraform
- **Orchestration:** Kubernetes, Minikube
- **Testing:** Jest
- **Version Control:** Git, GitHub

## Application Features

- Restaurant listing and retrieval APIs
- Restaurant menu APIs
- Order creation and retrieval
- PostgreSQL relational data model
- Foreign-key relationships
- Transaction-based order creation
- Parameterized SQL queries
- Database-backed application health endpoint
- Automated application tests

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Application and database health |
| GET | `/api/restaurants` | List restaurants |
| GET | `/api/restaurants/:id` | Retrieve a restaurant |
| GET | `/api/restaurants/:id/menu` | Retrieve a restaurant menu |
| POST | `/api/orders` | Create an order |
| GET | `/api/orders/:id` | Retrieve an order |

## Database Design

The application uses four relational tables:

- `restaurants`
- `menu_items`
- `orders`
- `order_items`

SQL schema and sample data are maintained in `backend/db/`.

## Docker Compose

Docker Compose runs the backend and PostgreSQL together.

Start the application:

```bash
docker compose up -d --build
```

Check running services:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop the application:

```bash
docker compose down
```

The PostgreSQL data volume is persistent. Do not remove it when you need to retain database data.

## Jenkins CI/CD

The Jenkins pipeline automates:

1. Source checkout from GitHub
2. Dependency installation
3. Automated Jest tests
4. SSH connectivity verification
5. Deployment to AWS EC2
6. Application health verification
7. Deployment rollback handling

Jenkins uses stored credentials for SSH access. Private keys and credentials must never be committed to Git.

## AWS and Terraform

Terraform is used to manage the AWS EC2 infrastructure and security-group configuration.

The application is deployed to EC2 using Docker Compose, with PostgreSQL kept off the public network.

Security considerations:

- Restrict SSH access to trusted IP addresses.
- Do not expose PostgreSQL publicly.
- Store credentials securely.
- Review AWS costs and stop resources when they are not needed.

## Kubernetes Deployment

The `k8s/` directory contains the Kubernetes manifests for:

- Backend Deployment with two replicas
- PostgreSQL Deployment
- Backend NodePort Service
- PostgreSQL ClusterIP Service
- ConfigMap and Secret
- PersistentVolumeClaim for PostgreSQL

### Deploy to Minikube

Start Minikube:

```bash
minikube start --driver=docker --cpus=2 --memory=3072
```

Build and load the backend image:

```bash
docker build -t foodkart-backend:latest ./backend
minikube image load foodkart-backend:latest
```

Apply the Kubernetes manifests:

```bash
kubectl apply -f k8s/
```

Check deployments and pods:

```bash
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get pvc
```

Wait for PostgreSQL:

```bash
kubectl rollout status deployment/foodkart-postgres --timeout=120s
```

Initialize the database using the SQL files:

```bash
$POD = kubectl get pod -l app=foodkart-postgres -o jsonpath="{.items[0].metadata.name}"
Get-Content .\backend\db\schema.sql | kubectl exec -i $POD -- psql -U foodkart -d foodkart
Get-Content .\backend\db\seed.sql | kubectl exec -i $POD -- psql -U foodkart -d foodkart
Get-Content .\backend\db\menu-seed.sql | kubectl exec -i $POD -- psql -U foodkart -d foodkart
```

These initialization commands are intended for a fresh database. Do not rerun them blindly against an existing database.

Access the backend locally:

```bash
kubectl port-forward service/foodkart-backend 3000:3000
```

Then test:

```text
http://localhost:3000/api/health
http://localhost:3000/api/restaurants
http://localhost:3000/api/restaurants/1/menu
```

### Kubernetes Notes

- The PostgreSQL PVC uses the cluster's `standard` StorageClass.
- The database Secret manifest currently contains demo credentials and is not suitable for production use.
- Minikube data is separate from the Docker Compose database volume.
- Recreating Minikube can remove cluster resources and locally stored Kubernetes database data.

## Repository Structure

```text
foodkart-platform/
├── backend/
│   ├── db/
│   ├── Dockerfile
│   └── server.js
├── jenkins/
├── k8s/
├── terraform/
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

## Project Outcomes

This project provides practical experience with:

- Building and containerizing a backend application
- Persisting application data with PostgreSQL
- Writing and running automated tests
- Building a Jenkins CI/CD pipeline
- Deploying an application to AWS EC2
- Managing infrastructure with Terraform
- Deploying and troubleshooting Kubernetes workloads
- Using health checks and rollback logic
- Managing source control and deployment configuration

## Future Improvements

- Helm charts for reusable Kubernetes deployments
- Prometheus and Grafana monitoring
- Centralized logging
- Automated security and container image scanning
- Production-grade secret management
- Automated Kubernetes deployment through CI/CD

## Author

**Balasaheb Javheri**

DevOps | AWS | Docker | Jenkins | Terraform | Kubernetes
