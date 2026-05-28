#!/bin/bash

# Exit on error
set -e

# Configuration variables
REPO_URL="${1:-https://github.com/34097027DavidB/ICT171-WebServer-CardBashD.git}"
REPO_NAME=$(basename "$REPO_URL" .git)
NGINX_ROOT="/var/www/$REPO_NAME"
DOMAIN="${2:-localhost}"

echo "Starting setup..."

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install nginx
echo "Installing nginx..."
sudo apt-get install -y nginx

# Install git if not already installed
echo "Installing git..."
sudo apt-get install -y git

# Create web root directory
echo "Creating web root directory at $NGINX_ROOT..."
sudo mkdir -p "$NGINX_ROOT"

# Clone the GitHub repository
echo "Cloning repository from $REPO_URL..."
sudo git clone "$REPO_URL" "$NGINX_ROOT"

# Set proper permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data "$NGINX_ROOT"
sudo chmod -R 755 "$NGINX_ROOT"

# Create nginx configuration
echo "Configuring nginx..."
sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name $DOMAIN;

    root $NGINX_ROOT;
    index index.html index.htm index.nginx-debian.html;

    location / {
        try_files \$uri \$uri/ =404;
    }

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Enable the site (if using sites-enabled)
echo "Enabling nginx configuration..."
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl start nginx

echo "✓ Setup complete!"
echo "Website is hosted at: http://$DOMAIN"
echo "Repository location: $NGINX_ROOT"
