import { RemoteFile } from '../types';

export const COMPREHENSIVE_LINUX_FILES: RemoteFile[] = [
  // ==========================================
  // ROOT (/) DIRECTORIES (Standard Linux FHS)
  // ==========================================
  {
    id: 'f-root-bin',
    name: 'bin',
    path: '/bin',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'lrwxrwxrwx',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 04:10',
  },
  {
    id: 'f-root-boot',
    name: 'boot',
    path: '/boot',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-15 08:30',
  },
  {
    id: 'f-root-dev',
    name: 'dev',
    path: '/dev',
    type: 'directory',
    size: 3420,
    sizeFormatted: '3.4 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-09-02 00:00',
  },
  {
    id: 'f-root-etc',
    name: 'etc',
    path: '/etc',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-09-01 19:40',
  },
  {
    id: 'f-root-home',
    name: 'home',
    path: '/home',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-09-01 18:30',
  },
  {
    id: 'f-root-lib',
    name: 'lib',
    path: '/lib',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'lrwxrwxrwx',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 04:10',
  },
  {
    id: 'f-root-lib64',
    name: 'lib64',
    path: '/lib64',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'lrwxrwxrwx',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 04:10',
  },
  {
    id: 'f-root-media',
    name: 'media',
    path: '/media',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-10 12:00',
  },
  {
    id: 'f-root-mnt',
    name: 'mnt',
    path: '/mnt',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-22 14:15',
  },
  {
    id: 'f-root-opt',
    name: 'opt',
    path: '/opt',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-25 16:30',
  },
  {
    id: 'f-root-proc',
    name: 'proc',
    path: '/proc',
    type: 'directory',
    size: 0,
    sizeFormatted: '0 B',
    permissions: 'dr-xr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-09-02 00:00',
  },
  {
    id: 'f-root-root',
    name: 'root',
    path: '/root',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwx------',
    owner: 'root',
    group: 'root',
    modified: '2026-09-01 12:00',
  },
  {
    id: 'f-root-run',
    name: 'run',
    path: '/run',
    type: 'directory',
    size: 1024,
    sizeFormatted: '1.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-09-02 01:20',
  },
  {
    id: 'f-root-sbin',
    name: 'sbin',
    path: '/sbin',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'lrwxrwxrwx',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 04:10',
  },
  {
    id: 'f-root-srv',
    name: 'srv',
    path: '/srv',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-15 10:00',
  },
  {
    id: 'f-root-sys',
    name: 'sys',
    path: '/sys',
    type: 'directory',
    size: 0,
    sizeFormatted: '0 B',
    permissions: 'dr-xr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-09-02 00:00',
  },
  {
    id: 'f-root-tmp',
    name: 'tmp',
    path: '/tmp',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxrwxrwt',
    owner: 'root',
    group: 'root',
    modified: '2026-09-02 01:15',
  },
  {
    id: 'f-root-usr',
    name: 'usr',
    path: '/usr',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 04:15',
  },
  {
    id: 'f-root-var',
    name: 'var',
    path: '/var',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-09-02 01:25',
  },

  // ==========================================
  // /home & USER FILES (/home/51917-9399)
  // ==========================================
  {
    id: 'f-home-user',
    name: '51917-9399',
    path: '/home/51917-9399',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwx------',
    owner: '51917-9399',
    group: '51917-9399',
    modified: '2026-09-02 01:00',
  },
  {
    id: 'f-user-ssh',
    name: '.ssh',
    path: '/home/51917-9399/.ssh',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwx------',
    owner: '51917-9399',
    group: '51917-9399',
    modified: '2026-09-01 18:35',
  },
  {
    id: 'f-auth-keys',
    name: 'authorized_keys',
    path: '/home/51917-9399/.ssh/authorized_keys',
    type: 'file',
    size: 582,
    sizeFormatted: '582 B',
    permissions: '-rw-------',
    owner: '51917-9399',
    group: '51917-9399',
    modified: '2026-09-01 18:35',
    content: `# Dewacloud SSH Authorized Keys for Node 51917
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIL30+eUq+O3Jz7P7T9s8vK1N5mUa+w0V2xQ8d1Y9 dewacloud-key-primary
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC9f0A2jL... admin@local-workstation`,
  },
  {
    id: 'f-user-bashrc',
    name: '.bashrc',
    path: '/home/51917-9399/.bashrc',
    type: 'file',
    size: 3771,
    sizeFormatted: '3.7 KB',
    permissions: '-rw-r--r--',
    owner: '51917-9399',
    group: '51917-9399',
    modified: '2026-08-15 11:00',
    content: `# ~/.bashrc: executed by bash(1) for non-login shells.
export HISTCONTROL=ignoreboth:erasedups
export HISTSIZE=10000
export HISTFILESIZE=20000
shopt -s histappend
shopt -s checkwinsize

# Dewacloud Node Custom Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias logs='journalctl -u nginx -f'
alias status='systemctl status dewacloud-node'
alias ports='netstat -tulpn'

# Prompt
PS1='\\[\\033[01;32m\\]\\u@51917\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '`,
  },
  {
    id: 'f-user-profile',
    name: '.profile',
    path: '/home/51917-9399/.profile',
    type: 'file',
    size: 807,
    sizeFormatted: '807 B',
    permissions: '-rw-r--r--',
    owner: '51917-9399',
    group: '51917-9399',
    modified: '2026-08-15 11:00',
    content: `# ~/.profile: executed by the command interpreter for login shells.
if [ -n "$BASH_VERSION" ]; then
    if [ -f "$HOME/.bashrc" ]; then
        . "$HOME/.bashrc"
    fi
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi
if [ -d "$HOME/.local/bin" ] ; then
    PATH="$HOME/.local/bin:$PATH"
fi`,
  },
  {
    id: 'f-user-scripts',
    name: 'scripts',
    path: '/home/51917-9399/scripts',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: '51917-9399',
    group: '51917-9399',
    modified: '2026-09-01 14:20',
  },
  {
    id: 'f-user-backup-sh',
    name: 'backup-db.sh',
    path: '/home/51917-9399/scripts/backup-db.sh',
    type: 'file',
    size: 940,
    sizeFormatted: '940 B',
    permissions: '-rwxr-xr-x',
    owner: '51917-9399',
    group: '51917-9399',
    modified: '2026-09-01 14:20',
    content: `#!/usr/bin/env bash
# Dewacloud Automated DB Backup Script
set -e
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/mariadb"
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting MariaDB database backup for Node 51917..."
mysqldump --single-transaction --quick --databases dewacloud_prod | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"
echo "[$(date)] Backup completed: $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Retain last 7 days of backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete`,
  },
  {
    id: 'f-user-dewacloud-cfg',
    name: 'dewacloud.json',
    path: '/home/51917-9399/dewacloud.json',
    type: 'file',
    size: 420,
    sizeFormatted: '420 B',
    permissions: '-rw-------',
    owner: '51917-9399',
    group: '51917-9399',
    modified: '2026-09-01 18:30',
    content: `{
  "nodeId": "51917",
  "instanceName": "dewacloud-prod-node",
  "sshPort": 3022,
  "gateway": "gate.infra.dewacloud.com",
  "username": "51917-9399",
  "region": "ap-southeast-1 (Jakarta DC)",
  "syncStatus": "healthy",
  "lastAudit": "2026-09-02T01:25:00Z"
}`,
  },

  // ==========================================
  // /etc DIRECTORY & SUBDIRECTORIES
  // ==========================================
  {
    id: 'f-etc-nginx',
    name: 'nginx',
    path: '/etc/nginx',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-25 10:20',
  },
  {
    id: 'f-nginx-conf',
    name: 'nginx.conf',
    path: '/etc/nginx/nginx.conf',
    type: 'file',
    size: 2450,
    sizeFormatted: '2.4 KB',
    permissions: '-rw-r--r--',
    owner: 'root',
    group: 'root',
    modified: '2026-08-25 10:20',
    content: `user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 2048;
    multi_accept on;
    use epoll;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}`,
  },
  {
    id: 'f-etc-nginx-sites',
    name: 'sites-available',
    path: '/etc/nginx/sites-available',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-28 11:30',
  },
  {
    id: 'f-nginx-site-default',
    name: 'dewacloud-app.conf',
    path: '/etc/nginx/sites-available/dewacloud-app.conf',
    type: 'file',
    size: 1420,
    sizeFormatted: '1.4 KB',
    permissions: '-rw-r--r--',
    owner: 'root',
    group: 'root',
    modified: '2026-08-28 11:30',
    content: `server {
    listen 80;
    listen [::]:80;
    server_name gate.infra.dewacloud.com;

    root /var/www/dewacloud-app/public;
    index index.html index.js;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location ~ /\\.(?!well-known).* {
        deny all;
    }
}`,
  },
  {
    id: 'f-etc-ssh',
    name: 'ssh',
    path: '/etc/ssh',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 09:15',
  },
  {
    id: 'f-etc-sshd-config',
    name: 'sshd_config',
    path: '/etc/ssh/sshd_config',
    type: 'file',
    size: 3260,
    sizeFormatted: '3.3 KB',
    permissions: '-rw-r--r--',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 09:15',
    content: `# Dewacloud SSH Server Configuration (Node 51917)
Port 3022
AddressFamily any
ListenAddress 0.0.0.0
ListenAddress ::

# Authentication
PermitRootLogin prohibit-password
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PasswordAuthentication no
ChallengeResponseAuthentication no
UsePAM yes

# Gateway Settings
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
ClientAliveInterval 60
ClientAliveCountMax 3`,
  },
  {
    id: 'f-etc-hosts',
    name: 'hosts',
    path: '/etc/hosts',
    type: 'file',
    size: 310,
    sizeFormatted: '310 B',
    permissions: '-rw-r--r--',
    owner: 'root',
    group: 'root',
    modified: '2026-08-15 08:30',
    content: `127.0.0.1 localhost
127.0.1.1 dewacloud-node-51917
103.150.191.24 gate.infra.dewacloud.com

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters`,
  },
  {
    id: 'f-etc-resolv-conf',
    name: 'resolv.conf',
    path: '/etc/resolv.conf',
    type: 'file',
    size: 195,
    sizeFormatted: '195 B',
    permissions: '-rw-r--r--',
    owner: 'root',
    group: 'root',
    modified: '2026-08-15 08:30',
    content: `nameserver 1.1.1.1
nameserver 8.8.8.8
nameserver 8.8.4.4
search infra.dewacloud.com`,
  },
  {
    id: 'f-etc-os-release',
    name: 'os-release',
    path: '/etc/os-release',
    type: 'file',
    size: 388,
    sizeFormatted: '388 B',
    permissions: '-rw-r--r--',
    owner: 'root',
    group: 'root',
    modified: '2026-08-10 00:00',
    content: `PRETTY_NAME="Ubuntu 24.04 LTS"
NAME="Ubuntu"
VERSION_ID="24.04"
VERSION="24.04 LTS (Noble Numbat)"
VERSION_CODENAME=noble
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"`,
  },
  {
    id: 'f-etc-ufw',
    name: 'ufw',
    path: '/etc/ufw',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 10:00',
  },
  {
    id: 'f-etc-fail2ban',
    name: 'fail2ban',
    path: '/etc/fail2ban',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 10:30',
  },
  {
    id: 'f-etc-cron-d',
    name: 'cron.d',
    path: '/etc/cron.d',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-22 09:00',
  },
  {
    id: 'f-etc-mysql',
    name: 'mysql',
    path: '/etc/mysql',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-25 14:00',
  },
  {
    id: 'f-etc-redis',
    name: 'redis',
    path: '/etc/redis',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-25 14:30',
  },
  {
    id: 'f-etc-systemd',
    name: 'systemd',
    path: '/etc/systemd',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-25 15:00',
  },

  // ==========================================
  // /var DIRECTORY & SUBDIRECTORIES
  // ==========================================
  {
    id: 'f-var-www',
    name: 'www',
    path: '/var/www',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'www-data',
    group: 'www-data',
    modified: '2026-09-01 22:15',
  },
  {
    id: 'f-var-log',
    name: 'log',
    path: '/var/log',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxrwxr-x',
    owner: 'root',
    group: 'syslog',
    modified: '2026-09-02 01:20',
  },
  {
    id: 'f-var-lib',
    name: 'lib',
    path: '/var/lib',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-09-01 10:00',
  },
  {
    id: 'f-var-backups',
    name: 'backups',
    path: '/var/backups',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-09-01 03:00',
  },
  {
    id: 'f-var-cache',
    name: 'cache',
    path: '/var/cache',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-09-01 06:00',
  },
  {
    id: 'f-var-spool',
    name: 'spool',
    path: '/var/spool',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 04:00',
  },

  // ==========================================
  // /var/www/dewacloud-app APPLICATION SOURCE
  // ==========================================
  {
    id: 'f-app-dir',
    name: 'dewacloud-app',
    path: '/var/www/dewacloud-app',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: '51917-9399',
    group: 'www-data',
    modified: '2026-09-01 22:15',
  },
  {
    id: 'f-env-file',
    name: '.env.production',
    path: '/var/www/dewacloud-app/.env.production',
    type: 'file',
    size: 890,
    sizeFormatted: '890 B',
    permissions: '-rw-------',
    owner: '51917-9399',
    group: '51917-9399',
    modified: '2026-09-01 21:00',
    content: `# Dewacloud Node 51917 Production Environment
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
APP_NAME=Dewacloud-Web-Service

# Database Connections
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=dewacloud_prod
DB_USER=dewacloud_user
DB_PASSWORD=************************

# Cache
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Storage
STORAGE_DRIVER=local
UPLOAD_PATH=/var/www/dewacloud-app/storage/uploads`,
  },
  {
    id: 'f-docker-compose',
    name: 'docker-compose.yml',
    path: '/var/www/dewacloud-app/docker-compose.yml',
    type: 'file',
    size: 1120,
    sizeFormatted: '1.1 KB',
    permissions: '-rw-r--r--',
    owner: '51917-9399',
    group: '51917-9399',
    modified: '2026-08-31 14:00',
    content: `version: '3.8'

services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
      - db
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  redis-data:`,
  },
  {
    id: 'f-app-package-json',
    name: 'package.json',
    path: '/var/www/dewacloud-app/package.json',
    type: 'file',
    size: 740,
    sizeFormatted: '740 B',
    permissions: '-rw-r--r--',
    owner: '51917-9399',
    group: 'www-data',
    modified: '2026-08-30 15:10',
    content: `{
  "name": "dewacloud-app",
  "version": "2.4.0",
  "private": true,
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "npm run build:client",
    "lint": "eslint ."
  },
  "dependencies": {
    "express": "^4.21.0",
    "mysql2": "^3.11.0",
    "ioredis": "^5.4.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5"
  }
}`,
  },
  {
    id: 'f-app-server-js',
    name: 'server.js',
    path: '/var/www/dewacloud-app/server.js',
    type: 'file',
    size: 2150,
    sizeFormatted: '2.1 KB',
    permissions: '-rw-r--r--',
    owner: '51917-9399',
    group: 'www-data',
    modified: '2026-09-01 20:45',
    content: `const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '.env.production' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    node: '51917',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Dewacloud Server running on port \${PORT}\`);
});`,
  },
  {
    id: 'f-app-public',
    name: 'public',
    path: '/var/www/dewacloud-app/public',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: '51917-9399',
    group: 'www-data',
    modified: '2026-08-30 18:00',
  },
  {
    id: 'f-app-storage',
    name: 'storage',
    path: '/var/www/dewacloud-app/storage',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxrwxr-x',
    owner: '51917-9399',
    group: 'www-data',
    modified: '2026-08-30 18:00',
  },

  // ==========================================
  // /var/log FILES
  // ==========================================
  {
    id: 'f-log-syslog',
    name: 'syslog',
    path: '/var/log/syslog',
    type: 'file',
    size: 5242880,
    sizeFormatted: '5.0 MB',
    permissions: '-rw-r-----',
    owner: 'syslog',
    group: 'adm',
    modified: '2026-09-02 01:25',
    content: `Sep  2 00:55:12 dewacloud-node-51917 sshd[3022]: Accepted publickey for 51917-9399 from 103.150.191.24 port 54820 ssh2: ED25519
Sep  2 00:54:30 dewacloud-node-51917 nginx: 103.150.191.24 - - [02/Sep/2026:00:54:30 +0700] "GET /api/health HTTP/2.0" 200 84
Sep  2 00:52:18 dewacloud-node-51917 CRON[18402]: (root) CMD (/usr/local/bin/dewacloud-telemetry-sync > /dev/null 2>&1)`,
  },
  {
    id: 'f-log-nginx',
    name: 'nginx',
    path: '/var/log/nginx',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-x---',
    owner: 'www-data',
    group: 'adm',
    modified: '2026-09-02 01:20',
  },
  {
    id: 'f-log-auth',
    name: 'auth.log',
    path: '/var/log/auth.log',
    type: 'file',
    size: 1420500,
    sizeFormatted: '1.4 MB',
    permissions: '-rw-r-----',
    owner: 'syslog',
    group: 'adm',
    modified: '2026-09-02 01:25',
    content: `Sep  2 00:55:12 dewacloud-node-51917 sshd[3022]: Accepted publickey for 51917-9399 from 103.150.191.24 port 54820 ssh2: ED25519
Sep  2 00:48:05 dewacloud-node-51917 fail2ban.actions[7810]: [sshd] Notice: Banned 194.26.29.11 after 5 failed attempts`,
  },
  {
    id: 'f-log-fail2ban',
    name: 'fail2ban.log',
    path: '/var/log/fail2ban.log',
    type: 'file',
    size: 428000,
    sizeFormatted: '428 KB',
    permissions: '-rw-r-----',
    owner: 'root',
    group: 'adm',
    modified: '2026-09-02 00:48',
    content: `2026-09-02 00:48:05,124 fail2ban.filter [7810]: INFO [sshd] Found 194.26.29.11 - 2026-09-02 00:48:04
2026-09-02 00:48:05,280 fail2ban.actions[7810]: NOTICE [sshd] Ban 194.26.29.11`,
  },

  // ==========================================
  // /opt DIRECTORY & ADD-ONS
  // ==========================================
  {
    id: 'f-opt-dewacloud',
    name: 'dewacloud',
    path: '/opt/dewacloud',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-25 16:30',
  },
  {
    id: 'f-opt-node-exporter',
    name: 'node_exporter',
    path: '/opt/node_exporter',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-25 16:30',
  },
  {
    id: 'f-opt-containerd',
    name: 'containerd',
    path: '/opt/containerd',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 04:00',
  },

  // ==========================================
  // /proc VIRTUAL METRICS
  // ==========================================
  {
    id: 'f-proc-cpuinfo',
    name: 'cpuinfo',
    path: '/proc/cpuinfo',
    type: 'file',
    size: 1024,
    sizeFormatted: '1.0 KB',
    permissions: '-r--r--r--',
    owner: 'root',
    group: 'root',
    modified: '2026-09-02 01:25',
    content: `processor	: 0
vendor_id	: GenuineIntel
cpu family	: 6
model_name	: Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz
cpu MHz		: 1995.312
cache size	: 49152 KB
cpu cores	: 4

processor	: 1
model_name	: Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz
cpu MHz		: 1995.312

processor	: 2
model_name	: Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz

processor	: 3
model_name	: Intel(R) Xeon(R) Gold 6338 CPU @ 2.00GHz`,
  },
  {
    id: 'f-proc-meminfo',
    name: 'meminfo',
    path: '/proc/meminfo',
    type: 'file',
    size: 1420,
    sizeFormatted: '1.4 KB',
    permissions: '-r--r--r--',
    owner: 'root',
    group: 'root',
    modified: '2026-09-02 01:25',
    content: `MemTotal:        8192000 kB
MemFree:         3482100 kB
MemAvailable:    4891200 kB
Buffers:          341200 kB
Cached:          2189000 kB
SwapTotal:       2097148 kB
SwapFree:        1845244 kB`,
  },
  {
    id: 'f-proc-loadavg',
    name: 'loadavg',
    path: '/proc/loadavg',
    type: 'file',
    size: 40,
    sizeFormatted: '40 B',
    permissions: '-r--r--r--',
    owner: 'root',
    group: 'root',
    modified: '2026-09-02 01:25',
    content: `0.42 0.38 0.31 2/412 18942`,
  },

  // ==========================================
  // /mnt & /srv DIRECTORIES
  // ==========================================
  {
    id: 'f-mnt-storage',
    name: 'dewacloud-nfs-storage',
    path: '/mnt/dewacloud-nfs-storage',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxrwxr-x',
    owner: 'root',
    group: 'www-data',
    modified: '2026-08-22 14:15',
  },
  {
    id: 'f-srv-git',
    name: 'git',
    path: '/srv/git',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'git',
    group: 'git',
    modified: '2026-08-15 10:00',
  },

  // ==========================================
  // /usr SUBDIRECTORIES
  // ==========================================
  {
    id: 'f-usr-bin',
    name: 'bin',
    path: '/usr/bin',
    type: 'directory',
    size: 36864,
    sizeFormatted: '36.8 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 04:15',
  },
  {
    id: 'f-usr-local',
    name: 'local',
    path: '/usr/local',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 04:15',
  },
  {
    id: 'f-usr-share',
    name: 'share',
    path: '/usr/share',
    type: 'directory',
    size: 4096,
    sizeFormatted: '4.0 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 04:15',
  },
  {
    id: 'f-usr-lib',
    name: 'lib',
    path: '/usr/lib',
    type: 'directory',
    size: 20480,
    sizeFormatted: '20.4 KB',
    permissions: 'drwxr-xr-x',
    owner: 'root',
    group: 'root',
    modified: '2026-08-20 04:15',
  },

  // ==========================================
  // /tmp DUMMY RUNTIME FILES
  // ==========================================
  {
    id: 'f-tmp-mysql-sock',
    name: 'mysql.sock',
    path: '/tmp/mysql.sock',
    type: 'file',
    size: 0,
    sizeFormatted: '0 B',
    permissions: 'srwxrwxrwx',
    owner: 'mysql',
    group: 'mysql',
    modified: '2026-09-02 00:00',
    content: `# Unix domain socket for MySQL/MariaDB server`,
  },
  {
    id: 'f-tmp-redis-sock',
    name: 'redis.sock',
    path: '/tmp/redis.sock',
    type: 'file',
    size: 0,
    sizeFormatted: '0 B',
    permissions: 'srwxrwxrwx',
    owner: 'redis',
    group: 'redis',
    modified: '2026-09-02 00:00',
    content: `# Unix domain socket for Redis instance`,
  }
];
