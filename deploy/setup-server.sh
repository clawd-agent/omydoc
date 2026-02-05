#!/bin/bash
# Настройка сервера для DocGen
set -e

echo "=== Обновление системы ==="
apt-get update && apt-get upgrade -y

echo "=== Установка Docker ==="
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

echo "=== Установка Docker Compose ==="
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  apt-get install -y docker-compose-plugin
fi

echo "=== Установка Nginx ==="
apt-get install -y nginx certbot python3-certbot-nginx

echo "=== Установка PostgreSQL ==="
if ! command -v psql &> /dev/null; then
  apt-get install -y postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
fi

echo "=== Настройка PostgreSQL ==="
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='docgen'" | grep -q 1 || {
  sudo -u postgres psql -c "CREATE USER docgen WITH PASSWORD 'docgen_pass_2026';"
  sudo -u postgres psql -c "CREATE DATABASE docgen OWNER docgen;"
  echo "PostgreSQL: пользователь и БД созданы"
}

echo "=== Создание директорий ==="
mkdir -p /opt/docgen

echo "=== Настройка файрволла ==="
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "=== Настройка swap (1GB) ==="
if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "Swap создан"
fi

echo "=== Готово! ==="
docker --version
psql --version
nginx -v
free -h
