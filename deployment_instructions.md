# AWS EC2 Deployment Guide for NRIPROPSERVICES

This guide will walk you through building your application image, pushing it to a Docker registry, and deploying it on an AWS EC2 instance with SSL configured for `indiazameen.com`.

## Prerequisites
1.  **Docker Hub Account**: Or another container registry (like AWS ECR).
2.  **AWS EC2 Instance**: A Linux instance (e.g., Ubuntu 22.04) with an Elastic IP.
3.  **Domain Name**: `indiazameen.com` and `www.indiazameen.com` must have their A records pointing to your EC2 instance's public IP.

---

## Phase 1: Build and Push (Local Machine)

Before going to the server, you need to package your app into a Docker image and upload it.

1.  **Login to Docker Hub** (on your local machine):
    ```bash
    docker login
    ```
    *Enter your Docker Hub username and password.*

2.  **Build the Image**:
    Replace `<your-dockerhub-username>` with your actual username.
    **CRITICAL**: If you are using a Mac with an M-series chip (Apple Silicon), you MUST include the `--platform linux/amd64` flag to build an image compatible with your EC2 instance.
    ```bash
    docker build --platform linux/amd64 -t <your-dockerhub-username>/nripropservices:latest .
    ```

3.  **Push the Image**:
    ```bash
    docker push <your-dockerhub-username>/nripropservices:latest
    ```

---

## Phase 2: EC2 Server Preparation

SSH into your EC2 instance.

1.  **Install Docker and Docker Compose**:
    ```bash
    # Update packages
    sudo apt update && sudo apt upgrade -y
    
    # Install Docker
    sudo apt install docker.io -y
    sudo systemctl enable --now docker
    sudo usermod -aG docker ubuntu  # Re-login required for this to take effect without sudo
    
    # Install Docker Compose
    sudo apt install docker-compose-v2 -y
    ```

2.  **Transfer Configuration Files**:
    You need to get the following files from your local machine to a directory on your EC2 instance (e.g., `~/nripropservices/`):
    - `docker-compose.prod.yml`
    - `nginx.conf`
    
    *Tip: You can use `scp` from your local machine to copy these files, or clone your git repository if these files are committed.*

3.  **Customize the Compose File**:
    On the EC2 instance, edit `docker-compose.prod.yml` and replace `<your-dockerhub-username>` with your actual username.
    ```bash
    nano docker-compose.prod.yml
    ```

---

## Phase 3: Initial SSL Generation (Certbot)

We need to generate the SSL certificates *before* starting the main application. We will use a temporary Nginx container to serve the Let's Encrypt challenge files.

1.  **Run Temporary Nginx**:
    Run this command to start a background Nginx serving the `nginx-init.conf` configuration. Ensure you have transferred `nginx-init.conf` from your local machine to the EC2 instance first.
    ```bash
    docker run -d --name nginx-temp -p 80:80 \
      -v "$(pwd)/nginx-init.conf:/etc/nginx/conf.d/default.conf:ro" \
      -v "$(pwd)/certbot/www:/var/www/certbot" \
      nginx:alpine
    ```

2.  **Run Certbot Webroot**:
    Now, ask Certbot to place the challenge files in the directory Nginx is serving:
    ```bash
    docker run -it --rm --name certbot \
      -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
      -v "$(pwd)/certbot/www:/var/www/certbot" \
      certbot/certbot certonly --webroot -w /var/www/certbot -d indiazameen.com -d www.indiazameen.com --email indiazameen2026@gmail.com --agree-tos --no-eff-email
    ```

3.  **Cleanup Temporary Nginx**:
    Once the certificates are successfully generated, stop and remove the temporary Nginx container:
    ```bash
    docker stop nginx-temp
    docker rm nginx-temp
    ```

4.  **Verify Certificates**:
    Check that the certificates were created:
    ```bash
    ls -l certbot/conf/live/indiazameen.com/
    ```

---

## Phase 4: Launch the Application

Now that the certificates exist, you can bring up the full stack.

1.  **Start Services**:
    In the directory containing your configuration files:
    ```bash
    docker compose -f docker-compose.prod.yml up -d
    ```

2.  **Check Status**:
    ```bash
    docker compose -f docker-compose.prod.yml ps
    ```
    Ensure the `db`, `app`, `nginx`, and `certbot` containers are "Up".

3.  **Verify Migrations**:
    Check the logs of the migrator to ensure your database schema was applied:
    ```bash
    docker compose -f docker-compose.prod.yml logs migrator
    ```

Your application should now be live and secure at `https://indiazameen.com`!

## Future Updates
When you make code changes:
1. Build and push the new image locally (Phase 1).
2. SSH to the server and run:
   ```bash
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```
