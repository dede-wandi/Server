import { LogEntry } from '../types';

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function formatLogDate(date: Date): { timestamp: string; isoTimestamp: string; dayOfWeek: string } {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');

  const dayOfWeek = DAYS_ID[date.getDay()];
  const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
  const isoTimestamp = date.toISOString();

  return { timestamp, isoTimestamp, dayOfWeek };
}

export interface ServiceMeta {
  id: string;
  name: string;
  displayName: string;
  type: 'docker' | 'systemd';
  category: 'payment' | 'listener' | 'core' | 'storage' | 'web' | 'database' | 'security' | 'system' | 'runtime';
  logFile: string;
  journalUnit?: string;
  containerId?: string;
  image?: string;
  pid?: number;
  port?: number | string;
  command?: string;
  description: string;
}

export const LINUX_SERVICES_META: ServiceMeta[] = [
  // --- 15 DOCKER MICROSERVICES (qgrow.id1 STACK) ---
  {
    id: 'qgrow-product-container',
    name: 'qgrow-product-container',
    displayName: 'Product Catalog & Inventory',
    type: 'docker',
    category: 'core',
    containerId: '5f8d4b21eca1',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-product/main:latest',
    logFile: 'docker logs qgrow-product-container',
    port: '8080 (Internal)',
    command: './qgrow-product -migrate=true -port=8080',
    description: 'Core microservice for managing product SKU, catalog categories, stock inventory and variant prices.',
  },
  {
    id: 'qgrow-qris-container',
    name: 'qgrow-qris-container',
    displayName: 'QRIS Payment Gateway',
    type: 'docker',
    category: 'payment',
    containerId: 'c015a2eb7f6d',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-qris/main:latest',
    logFile: 'docker logs qgrow-qris-container',
    port: '8081 (Internal)',
    command: './qgrow-qris -migrate=true -port=8081',
    description: 'Dynamic and static QRIS generator, National QR Switch integration, merchant callback parsing and settlement.',
  },
  {
    id: 'qgrow-ewallet-container',
    name: 'qgrow-ewallet-container',
    displayName: 'E-Wallet Payment Engine',
    type: 'docker',
    category: 'payment',
    containerId: '55882d315aec',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-ewallet/main:latest',
    logFile: 'docker logs qgrow-ewallet-container',
    port: '8082 (Internal)',
    command: './qgrow-ewallet -migrate=true -port=8082',
    description: 'Aggregator for OVO, DANA, ShopeePay, GoPay, and AstraPay direct debit API flows with HMAC signature checks.',
  },
  {
    id: 'qgrow-payment-worker-container',
    name: 'qgrow-payment-worker-container',
    displayName: 'Payment Queue Worker',
    type: 'docker',
    category: 'listener',
    containerId: 'e177042af1b3',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-payment-worker/main:latest',
    logFile: 'docker logs qgrow-payment-worker-container',
    port: 'Worker Pool',
    command: '/usr/bin/dumb-init ./qgrow-payment-worker',
    description: 'Asynchronous payment webhook dispatcher, retry backoff worker, and transaction reconciliation processor.',
  },
  {
    id: 'qgrow-branch-container',
    name: 'qgrow-branch-container',
    displayName: 'Branch & Outlet Manager',
    type: 'docker',
    category: 'core',
    containerId: 'eab0ee09ef39',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-branch/main:latest',
    logFile: 'docker logs qgrow-branch-container',
    port: '8083 (Internal)',
    command: './qgrow-branch -migrate=true -port=8083',
    description: 'Multi-store hierarchy, merchant cashier terminals, branch permissions, and geofence verification.',
  },
  {
    id: 'container-redis',
    name: 'container-redis',
    displayName: 'Redis In-Memory Cache',
    type: 'docker',
    category: 'storage',
    containerId: '756d4c0fa55a',
    image: 'redis:latest',
    logFile: 'docker logs container-redis',
    port: '6379/tcp',
    command: 'docker-entrypoint.sh redis-server --appendonly yes',
    description: 'High-speed session storage, rate limiting counters, pub/sub channels, and query caching for microservices.',
  },
  {
    id: 'qgrow-wallet-listener-container',
    name: 'qgrow-wallet-listener-container',
    displayName: 'Wallet Balance Listener',
    type: 'docker',
    category: 'listener',
    containerId: '81980a2c7789',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-wallet-listener/main:latest',
    logFile: 'docker logs qgrow-wallet-listener-container',
    port: 'Kafka Consumer',
    command: '/usr/bin/dumb-init ./qgrow-wallet-listener',
    description: 'Subscribes to topup & deduction events, commits Kafka offsets, and executes atomic ledger balance mutations.',
  },
  {
    id: 'qgrow-trx-listener-container',
    name: 'qgrow-trx-listener-container',
    displayName: 'Transaction State Listener',
    type: 'docker',
    category: 'listener',
    containerId: '82abf6892a03',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-trx-listener/main:latest',
    logFile: 'docker logs qgrow-trx-listener-container',
    port: 'Kafka Consumer',
    command: '/usr/bin/dumb-init ./qgrow-trx-listener',
    description: 'Processes real-time state machine changes (PENDING -> SUCCESS / FAILED) and triggers notification webhooks.',
  },
  {
    id: 'qgrow-inbox-listener-container',
    name: 'qgrow-inbox-listener-container',
    displayName: 'Push & Inbox Listener',
    type: 'docker',
    category: 'listener',
    containerId: '687bd0b0d407',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-inbox-listener/master:latest',
    logFile: 'docker logs qgrow-inbox-listener-container',
    port: 'Event Consumer',
    command: '/usr/bin/dumb-init ./qgrow-inbox-listener',
    description: 'Listens for system alerts, merchant receipts, and triggers FCM push notifications & email templates.',
  },
  {
    id: 'qgrow-inbox-container',
    name: 'qgrow-inbox-container',
    displayName: 'Inbox Notification API',
    type: 'docker',
    category: 'core',
    containerId: '8f9ae5e9e2a5',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-inbox/master:latest',
    logFile: 'docker logs qgrow-inbox-container',
    port: '8084 (Internal)',
    command: './qgrow-inbox -migrate=true -port=8084',
    description: 'REST API for merchant notification center, announcement feeds, and read receipt tracking.',
  },
  {
    id: 'qgrow-transfer-container',
    name: 'qgrow-transfer-container',
    displayName: 'Bank Transfer & Payouts',
    type: 'docker',
    category: 'payment',
    containerId: '4007a1480640',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-transfer/main:latest',
    logFile: 'docker logs qgrow-transfer-container',
    port: '8085 (Internal)',
    command: './qgrow-transfer -migrate=true -port=8085',
    description: 'Bank account name inquiry, BI-FAST disbursement, and automated merchant daily withdrawal payouts.',
  },
  {
    id: 'qgrow-media-container',
    name: 'qgrow-media-container',
    displayName: 'Media & Asset Processor',
    type: 'docker',
    category: 'core',
    containerId: '5bec2701db67',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-media/master:latest',
    logFile: 'docker logs qgrow-media-container',
    port: '8086 (Internal)',
    command: './qgrow-media -migrate=true -port=8086',
    description: 'Handles product image upload, WebP thumbnail generation, KYC document hashing and S3 storage sync.',
  },
  {
    id: 'qgrow-menu-container',
    name: 'qgrow-menu-container',
    displayName: 'Digital Menu & Addons',
    type: 'docker',
    category: 'core',
    containerId: '4d24fcf1290c',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-menu/master:latest',
    logFile: 'docker logs qgrow-menu-container',
    port: '8087 (Internal)',
    command: './qgrow-menu -migrate=true -port=8087',
    description: 'Menu option trees, bundle deals, modifier groups, and food delivery POS integrations.',
  },
  {
    id: 'qgrow-payment-container',
    name: 'qgrow-payment-container',
    displayName: 'Payment Orchestrator API',
    type: 'docker',
    category: 'payment',
    containerId: '4ece2346b186',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-payment/main:latest',
    logFile: 'docker logs qgrow-payment-container',
    port: '8088 (Internal)',
    command: './qgrow-payment -migrate=true -port=8088',
    description: 'Primary checkout routing orchestrator, transaction fee computation, and multi-acquirer failover.',
  },
  {
    id: 'qgrow-wallet-container',
    name: 'qgrow-wallet-container',
    displayName: 'Merchant Wallet Ledger',
    type: 'docker',
    category: 'payment',
    containerId: 'ef8760be1858',
    image: 'registry.gitlab.com/qgrow.id1/qgrow-wallet/master:latest',
    logFile: 'docker logs qgrow-wallet-container',
    port: '8089 (Internal)',
    command: './qgrow-wallet -migrate=true -port=8089',
    description: 'Double-entry bookkeeping ledger, merchant balance holding accounts, and real-time statements.',
  },

  // --- SYSTEM & DAEMON SERVICES ---
  {
    id: 'nginx',
    name: 'nginx',
    displayName: 'Nginx Web & Reverse Proxy',
    type: 'systemd',
    category: 'web',
    logFile: '/var/log/nginx/access.log',
    journalUnit: 'nginx.service',
    pid: 1406,
    port: '80, 443',
    description: 'HTTP/2 reverse proxy routing external ingress traffic to Docker container networks and SSL termination.',
  },
  {
    id: 'mariadbd',
    name: 'mariadbd',
    displayName: 'MariaDB / MySQL Server',
    type: 'systemd',
    category: 'database',
    logFile: '/var/log/mysql/error.log',
    journalUnit: 'mariadb.service',
    pid: 3190,
    port: 3306,
    description: 'Primary relational database host, InnoDB engine, connection pooling, and transaction locking.',
  },
  {
    id: 'sshd',
    name: 'sshd[3022]',
    displayName: 'SSH Gateway & SFTP',
    type: 'systemd',
    category: 'security',
    logFile: '/var/log/auth.log',
    journalUnit: 'ssh.service',
    pid: 1142,
    port: 3022,
    description: 'OpenSSH server daemon and SFTP file transfer sessions on port 3022.',
  },
  {
    id: 'docker',
    name: 'docker',
    displayName: 'Docker Engine Daemon',
    type: 'systemd',
    category: 'runtime',
    logFile: '/var/log/docker.log',
    journalUnit: 'docker.service',
    pid: 2480,
    description: 'Container virtualization engine managing overlays, bridge networks, and 15 live microservice containers.',
  },
  {
    id: 'redis-server',
    name: 'redis-server',
    displayName: 'Host Redis Server',
    type: 'systemd',
    category: 'database',
    logFile: '/var/log/redis/redis-server.log',
    journalUnit: 'redis.service',
    pid: 4501,
    port: 6379,
    description: 'Host-level Redis instance for system caching and background broker queues.',
  },
  {
    id: 'pm2-app',
    name: 'pm2-app',
    displayName: 'PM2 Process Cluster',
    type: 'systemd',
    category: 'runtime',
    logFile: '/var/log/dewacloud/app.log',
    journalUnit: 'pm2-51917-9399.service',
    pid: 5840,
    port: 3000,
    description: 'Node.js application cluster workers running in /var/www/dewacloud-app.',
  },
  {
    id: 'fail2ban',
    name: 'fail2ban.actions',
    displayName: 'Fail2ban Intrusion Defense',
    type: 'systemd',
    category: 'security',
    logFile: '/var/log/fail2ban.log',
    journalUnit: 'fail2ban.service',
    pid: 7810,
    description: 'Automated brute-force detector banning malicious IPs attempting unauthorized SSH access.',
  },
  {
    id: 'ufw-filter',
    name: 'ufw-filter',
    displayName: 'UFW Firewall (Kernel)',
    type: 'systemd',
    category: 'security',
    logFile: '/var/log/ufw.log',
    journalUnit: 'ufw.service',
    pid: 412,
    description: 'Kernel packet filter inspecting incoming and outgoing TCP/UDP connections on eth0.',
  },
  {
    id: 'cron',
    name: 'cron',
    displayName: 'Cron Scheduler',
    type: 'systemd',
    category: 'system',
    logFile: '/var/log/cron.log',
    journalUnit: 'cron.service',
    pid: 902,
    description: 'Periodic background jobs (automated database backups, logrotate, telemetry sync).',
  },
  {
    id: 'dewacloud-agent',
    name: 'dewacloud-agent',
    displayName: 'Dewacloud PaaS Agent',
    type: 'systemd',
    category: 'system',
    logFile: '/var/log/dewacloud-agent.log',
    journalUnit: 'dewacloud-agent.service',
    pid: 912,
    description: 'Dewacloud cloud agent reporting node health, CPU/RAM telemetry, and gateway sync.',
  },
  {
    id: 'systemd',
    name: 'systemd',
    displayName: 'Systemd & Kernel Core',
    type: 'systemd',
    category: 'system',
    logFile: '/var/log/syslog',
    journalUnit: 'systemd-journald.service',
    pid: 1,
    description: 'Linux kernel subsystem, daemon process tree, cgroup slices, and hardware timers.',
  },
];

// Generate authentic, high-density logs per service across all 15 microservices and system daemons
export function generateComprehensiveLogs(): LogEntry[] {
  const logs: LogEntry[] = [];
  const baseTime = new Date('2026-09-02T01:15:00.000Z').getTime();

  // Curated historical timeline per service
  const authenticEvents: Array<{
    offsetSec?: number;
    exactDate?: string;
    service: string;
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
    ip?: string;
    pid?: number;
    durationMs?: number;
  }> = [
    // --- Exact Time Window 2026-09-02T06:48:00 to 2026-09-02T06:48:59 (qgrow-product-container) ---
    {
      exactDate: '2026-09-02T06:48:02.114Z',
      service: 'qgrow-product-container',
      level: 'info',
      message: 'GET /api/v1/products?category_id=cat_beverages HTTP/1.1 200 OK (returned 18 items, query_time=1.1ms, cache=HIT)',
      durationMs: 1.1,
    },
    {
      exactDate: '2026-09-02T06:48:15.820Z',
      service: 'qgrow-product-container',
      level: 'info',
      message: 'Stock lock verified for SKU "PRD-COFFEE-01" (available=142, reserved=2, branch="BR-JKT-01")',
      durationMs: 0.7,
    },
    {
      exactDate: '2026-09-02T06:48:29.405Z',
      service: 'qgrow-product-container',
      level: 'success',
      message: 'Product catalog index synchronized with Redis cluster node-1 in 2.8ms (38 categories updated)',
      durationMs: 2.8,
    },
    {
      exactDate: '2026-09-02T06:48:42.190Z',
      service: 'qgrow-product-container',
      level: 'info',
      message: 'POST /api/v1/products/batch-check HTTP/1.1 200 OK (15 SKUs evaluated, all available)',
      durationMs: 2.1,
    },
    {
      exactDate: '2026-09-02T06:48:58.740Z',
      service: 'qgrow-product-container',
      level: 'info',
      message: 'Stock reservation released for expired cart lock_id="lk_89110" (SKU "PRD-TEA-02", qty=1)',
      durationMs: 0.8,
    },

    // --- 1. QGROW PRODUCT CONTAINER ---
    {
      offsetSec: 2,
      service: 'qgrow-product-container',
      level: 'info',
      message: 'GET /api/v1/products?limit=20&page=1 HTTP/1.1 200 OK (cache=HIT, query_time=0.9ms)',
      durationMs: 0.9,
    },
    {
      offsetSec: 8,
      service: 'qgrow-product-container',
      level: 'info',
      message: 'Stock lock verified for SKU "PRD-COFFEE-01" (available=142, reserved=2, branch="BR-JKT-01")',
      durationMs: 0.7,
    },
    {
      offsetSec: 15,
      service: 'qgrow-product-container',
      level: 'info',
      message: 'GET /api/v1/products?category_id=cat_89201 HTTP/1.1 200 OK (returned 24 items, query_time=1.2ms, cache=HIT)',
      durationMs: 1.2,
    },
    {
      offsetSec: 25,
      service: 'qgrow-product-container',
      level: 'success',
      message: 'Product variant prices synchronized across 12 branch outlets in 3.4ms',
      durationMs: 3.4,
    },
    {
      offsetSec: 45,
      service: 'qgrow-product-container',
      level: 'info',
      message: 'Category tree re-indexed for merchantId="MCH-88210" (38 active catalog items)',
      durationMs: 1.8,
    },
    {
      offsetSec: 75,
      service: 'qgrow-product-container',
      level: 'info',
      message: 'POST /api/v1/products/batch-check HTTP/1.1 200 OK (15 SKUs evaluated, all available)',
      durationMs: 2.1,
    },
    {
      offsetSec: 120,
      service: 'qgrow-product-container',
      level: 'info',
      message: 'Stock reservation locked for SKU "PRD-COFFEE-01" (quantity=2, lock_id=lk_9921)',
      durationMs: 0.8,
    },
    {
      offsetSec: 300,
      service: 'qgrow-product-container',
      level: 'info',
      message: 'Cache warmed: 250 hot product records loaded into local memory cache',
      durationMs: 5.2,
    },
    {
      offsetSec: 3600 * 2,
      service: 'qgrow-product-container',
      level: 'warning',
      message: 'Product stock threshold alert: SKU "PRD-MILK-OAT" remaining quantity is 3 (below min_threshold=10)',
    },
    {
      offsetSec: 3600 * 18,
      service: 'qgrow-product-container',
      level: 'error',
      message: 'Error updating inventory SKU "PRD-MATCHA-PREM": lock wait timeout exceeded; try restarting transaction',
    },
    {
      offsetSec: 3600 * 36,
      service: 'qgrow-product-container',
      level: 'success',
      message: 'Bulk catalog index refreshed: 1,420 products synchronized to Elasticsearch cluster',
      durationMs: 420,
    },

    // --- 2. QGROW QRIS CONTAINER ---
    {
      offsetSec: 30,
      service: 'qgrow-qris-container',
      level: 'info',
      message: 'GenerateDynamicQRIS: ref_id="QR-20260902-88192" amount=150000 fee=1050 nmid="ID10200392019"',
      durationMs: 3.4,
    },
    {
      offsetSec: 180,
      service: 'qgrow-qris-container',
      level: 'info',
      message: 'Callback received from National Switch: ref_id="QR-20260902-88192" status=PAID rrn="98127391823" bank="BCA"',
      ip: '103.150.191.24',
    },
    {
      offsetSec: 3600 * 4,
      service: 'qgrow-qris-container',
      level: 'warning',
      message: 'QRIS payment expired: ref_id="QR-20260901-77102" (timeout after 15 minutes without buyer settlement)',
    },
    {
      offsetSec: 3600 * 14,
      service: 'qgrow-qris-container',
      level: 'error',
      message: 'QRIS Webhook Callback HMAC Signature verification failed for acquirer switch IP 182.253.77.104',
      ip: '182.253.77.104',
    },
    {
      offsetSec: 3600 * 28,
      service: 'qgrow-qris-container',
      level: 'success',
      message: 'QRIS Settlement reconciliation completed: 482 transactions settled, total IDR 74,820,000',
    },

    // --- 3. QGROW EWALLET CONTAINER ---
    {
      offsetSec: 45,
      service: 'qgrow-ewallet-container',
      level: 'info',
      message: 'E-Wallet intent created: channel=GOPAY ref_id="EWL-98127" amount=85000 deeplink_url="gopay://pay?token=..."',
      durationMs: 4.1,
    },
    {
      offsetSec: 300,
      service: 'qgrow-ewallet-container',
      level: 'info',
      message: 'E-Wallet OVO push payment status: SUCCEEDED user_phone="0812****8821" trx_id="OVO-881290"',
    },
    {
      offsetSec: 3600 * 8,
      service: 'qgrow-ewallet-container',
      level: 'warning',
      message: 'DANA channel high response latency: upstream API responded in 1,840ms (exceeding SLA threshold 1,000ms)',
      durationMs: 1840,
    },
    {
      offsetSec: 3600 * 22,
      service: 'qgrow-ewallet-container',
      level: 'error',
      message: 'ShopeePay API error 504 Gateway Timeout while initiating checkout intent for ref_id="EWL-77192"',
      durationMs: 3002,
    },

    // --- 4. QGROW PAYMENT WORKER CONTAINER ---
    {
      offsetSec: 60,
      service: 'qgrow-payment-worker-container',
      level: 'info',
      message: 'Worker pool active: 8 goroutines consuming topic "qgrow.payments.settlement" (batch_size=50)',
    },
    {
      offsetSec: 400,
      service: 'qgrow-payment-worker-container',
      level: 'success',
      message: 'Webhook dispatch succeeded to merchant endpoint https://pos.kopi-kenangan.id/webhook/qgrow (HTTP 200, latency=48ms)',
      durationMs: 48,
    },
    {
      offsetSec: 3600 * 6,
      service: 'qgrow-payment-worker-container',
      level: 'warning',
      message: 'Webhook retry backoff: merchant endpoint https://merchant-api.id/cb returned 503 Service Unavailable (attempt 2/5)',
    },
    {
      offsetSec: 3600 * 20,
      service: 'qgrow-payment-worker-container',
      level: 'error',
      message: 'Webhook delivery failed permanently for trx "TRX-449102" after 5 retries. Pushed to Dead Letter Queue (DLQ)',
    },

    // --- 5. QGROW BRANCH CONTAINER ---
    {
      offsetSec: 90,
      service: 'qgrow-branch-container',
      level: 'info',
      message: 'Branch cashier session initialized: outlet_id="OUT-JKT-01" cashier="Budi Santoso" terminal="POS-04"',
    },
    {
      offsetSec: 3600 * 12,
      service: 'qgrow-branch-container',
      level: 'info',
      message: 'Branch geofence check passed: lat=-6.2088 long=106.8456 accuracy=12m for outlet "Grand Indonesia"',
    },
    {
      offsetSec: 3600 * 30,
      service: 'qgrow-branch-container',
      level: 'warning',
      message: 'Terminal clock drift detected: POS-02 clock skewed by +4.8s (NTP auto-sync recommended)',
    },

    // --- 6. CONTAINER REDIS ---
    {
      offsetSec: 25,
      service: 'container-redis',
      level: 'info',
      message: 'DB 0: 64,812 keys in cache. Memory used: 64.8MB / 7.78GB. Hit rate: 98.4%',
    },
    {
      offsetSec: 3600 * 16,
      service: 'container-redis',
      level: 'success',
      message: 'Background AOF rewrite terminated with success. Log size reduced from 42MB to 8.1MB',
    },
    {
      offsetSec: 3600 * 40,
      service: 'container-redis',
      level: 'warning',
      message: 'Slowlog captured: KEYS "qgrow:session:*" took 18.2ms (use SCAN instead of KEYS in production)',
    },

    // --- 7. QGROW WALLET LISTENER CONTAINER ---
    {
      offsetSec: 70,
      service: 'qgrow-wallet-listener-container',
      level: 'info',
      message: 'Kafka consumer partition 2 assigned, current offset=849204. Topic: "qgrow.wallet.events"',
    },
    {
      offsetSec: 3600 * 5,
      service: 'qgrow-wallet-listener-container',
      level: 'info',
      message: 'Processed WalletBalanceChangedEvent: merchant_id="MCH-8819" delta=+148950 new_balance=12480000',
    },
    {
      offsetSec: 3600 * 24,
      service: 'qgrow-wallet-listener-container',
      level: 'error',
      message: 'OptimisticLockException updating merchant ledger balance for MCH-3319: version conflict (retrying batch)',
    },

    // --- 8. QGROW TRX LISTENER CONTAINER ---
    {
      offsetSec: 80,
      service: 'qgrow-trx-listener-container',
      level: 'info',
      message: 'Transaction state transition: trx_id="TRX-991823" PENDING -> SUCCESS (payment_type=QRIS)',
    },
    {
      offsetSec: 3600 * 9,
      service: 'qgrow-trx-listener-container',
      level: 'info',
      message: 'Idempotency check: duplicated event payload skipped for order_id="ORD-991823-1"',
    },

    // --- 9. QGROW INBOX & INBOX LISTENER ---
    {
      offsetSec: 110,
      service: 'qgrow-inbox-listener-container',
      level: 'info',
      message: 'FCM push notification dispatched to 48 active merchant devices (payload_size=340 bytes)',
    },
    {
      offsetSec: 200,
      service: 'qgrow-inbox-container',
      level: 'info',
      message: 'GET /api/v1/inbox/notifications?unread_only=true HTTP/1.1 200 OK (count=3)',
    },

    // --- 10. QGROW TRANSFER CONTAINER ---
    {
      offsetSec: 140,
      service: 'qgrow-transfer-container',
      level: 'info',
      message: 'AccountInquiry: bank_code="BCA" account_no="8490182910" -> account_name="PT QGROW DIGITAL INDONESIA"',
      durationMs: 82,
    },
    {
      offsetSec: 3600 * 10,
      service: 'qgrow-transfer-container',
      level: 'success',
      message: 'Disbursement executed via BI-FAST: ref="TRF-881920" amount=2500000 fee=2500 status=SUCCESS',
      durationMs: 140,
    },
    {
      offsetSec: 3600 * 32,
      service: 'qgrow-transfer-container',
      level: 'error',
      message: 'Bank gateway 502 Bad Gateway while querying account balance on BNI host 10.20.1.4',
    },

    // --- 11. QGROW MEDIA & MENU ---
    {
      offsetSec: 160,
      service: 'qgrow-media-container',
      level: 'info',
      message: 'Image uploaded & processed: "banner-promo.jpg" -> WebP 800x450 (size: 48KB, compression: 74%)',
      durationMs: 120,
    },
    {
      offsetSec: 220,
      service: 'qgrow-menu-container',
      level: 'info',
      message: 'Menu catalog tree loaded: merchant_id="MCH-8819" (4 categories, 38 menu items, 12 modifier groups)',
      durationMs: 3.2,
    },

    // --- 12. QGROW PAYMENT & WALLET ---
    {
      offsetSec: 50,
      service: 'qgrow-payment-container',
      level: 'info',
      message: 'Payment route matched: method=QRIS provider=NATIONAL_SWITCH fee_rule=MDR_0_7_PERCENT',
    },
    {
      offsetSec: 3600 * 3,
      service: 'qgrow-wallet-container',
      level: 'info',
      message: 'Double-entry journal posted: Debit Settlement Receivable (IDR 150,000) / Credit Merchant Escrow (IDR 148,950)',
    },

    // --- SYSTEM DAEMONS ---
    {
      offsetSec: 20,
      service: 'sshd[3022]',
      level: 'info',
      message: 'Accepted publickey for 51917-9399 from 103.150.191.24 port 54820 ssh2: ED25519',
      ip: '103.150.191.24',
      pid: 1142,
    },
    {
      offsetSec: 35,
      service: 'nginx',
      level: 'info',
      message: 'HTTP/2 200 OK for https://qgrow.id/api/v1/checkout upstream: 172.20.0.8:8088 in 4.2ms',
      pid: 1406,
      durationMs: 4.2,
    },
    {
      offsetSec: 55,
      service: 'mariadbd',
      level: 'info',
      message: 'InnoDB: Buffer pool hit rate 998 / 1000. Active connections: 8 (innodb_buffer_pool_size=4096M)',
      pid: 3190,
    },
    {
      offsetSec: 3600 * 7,
      service: 'fail2ban.actions',
      level: 'warning',
      message: '[sshd] Notice: Banned 194.26.29.11 after 5 failed authentication attempts on port 3022',
      ip: '194.26.29.11',
      pid: 7810,
    },
    {
      offsetSec: 3600 * 15,
      service: 'docker',
      level: 'info',
      message: 'Docker healthcheck: 15/15 containers in healthy state on bridge network "qgrow_internal_net"',
      pid: 2480,
    },
  ];

  let idCounter = 1;

  // Insert base curated authentic events
  authenticEvents.forEach((ev) => {
    const entryDate = ev.exactDate ? new Date(ev.exactDate) : new Date(baseTime - (ev.offsetSec || 0) * 1000);
    const { timestamp, isoTimestamp, dayOfWeek } = formatLogDate(entryDate);
    const traceId = `tr-${Math.random().toString(36).substring(2, 10)}`;

    logs.push({
      id: `svc-log-${idCounter++}`,
      timestamp,
      isoTimestamp,
      dayOfWeek,
      service: ev.service,
      level: ev.level,
      message: ev.message,
      ip: ev.ip,
      durationMs: ev.durationMs,
      traceId,
      host: 'gate.infra.dewacloud.com',
      pid: ev.pid || 1000,
      raw: `${timestamp} [${dayOfWeek}] [${ev.service}] ${ev.level.toUpperCase()}: ${ev.message}`,
    });
  });

  // Dense generator across past 5 days for each specific microservice and system service
  const serviceGenerators: Array<{
    service: string;
    pid?: number;
    templates: Array<{
      level: 'info' | 'warning' | 'error' | 'success';
      msg: () => string;
      ip?: string;
      durationMs?: number;
    }>;
  }> = [
    {
      service: 'qgrow-product-container',
      templates: [
        { level: 'info', msg: () => `GET /api/v1/products?limit=20&page=${Math.floor(1 + Math.random() * 10)} 200 OK (returned 20 items, ${(Math.random() * 2 + 0.8).toFixed(1)}ms)`, durationMs: 1.4 },
        { level: 'info', msg: () => `Stock reservation acquired for SKU "PRD-COFFEE-${Math.floor(10 + Math.random() * 90)}" (qty=${Math.floor(1 + Math.random() * 4)})` },
        { level: 'warning', msg: () => `Slow query in product repo: FindBySlug("${['latte-special', 'caramel-macchiato', 'toast-kaya'][Math.floor(Math.random() * 3)]}") took ${(Math.random() * 80 + 120).toFixed(0)}ms` },
        { level: 'success', msg: () => `Product inventory cache synchronized with Redis key "qgrow:product:catalog:v2"` },
      ],
    },
    {
      service: 'qgrow-qris-container',
      templates: [
        { level: 'info', msg: () => `GenerateDynamicQRIS ref_id="QR-${Math.floor(100000 + Math.random() * 900000)}" amount=${Math.floor(25000 + Math.random() * 200000)} fee=750`, durationMs: 2.8 },
        { level: 'info', msg: () => `QRIS callback verified: status=PAID switch="ASPI-NSP" rrn="${Math.floor(100000000000 + Math.random() * 900000000000)}"` },
        { level: 'success', msg: () => `Settlement batch #${Math.floor(4000 + Math.random() * 1000)} reconciled successfully for acquirer partner` },
        { level: 'warning', msg: () => `QRIS payment timeout for ref_id="QR-${Math.floor(100000 + Math.random() * 900000)}" (unpaid after 15m)` },
      ],
    },
    {
      service: 'qgrow-ewallet-container',
      templates: [
        { level: 'info', msg: () => `E-Wallet intent created: channel=${['OVO', 'DANA', 'GOPAY', 'SHOPEEPAY'][Math.floor(Math.random() * 4)]} amount=${Math.floor(15000 + Math.random() * 150000)}`, durationMs: 3.5 },
        { level: 'info', msg: () => `E-Wallet callback processed: state=SETTLED user_phone="081${Math.floor(10000000 + Math.random() * 90000000)}"` },
        { level: 'warning', msg: () => `E-Wallet API warning: provider returned HTTP 429 Too Many Requests (retrying in 500ms)` },
      ],
    },
    {
      service: 'qgrow-payment-worker-container',
      templates: [
        { level: 'info', msg: () => `Payment worker processed batch #${Math.floor(80000 + Math.random() * 10000)} (12 payment jobs completed)` },
        { level: 'success', msg: () => `Merchant webhook delivered: endpoint="https://api.merchant.id/pay/cb" (HTTP 200 in ${(Math.random() * 30 + 20).toFixed(0)}ms)` },
        { level: 'info', msg: () => `Kafka partition offset committed: topic="qgrow.payments.reconcile" offset=${Math.floor(900000 + Math.random() * 50000)}` },
      ],
    },
    {
      service: 'qgrow-branch-container',
      templates: [
        { level: 'info', msg: () => `Branch cashier heartbeat: branch="JKT-SELATAN-0${Math.floor(1 + Math.random() * 5)}" active_cashiers=3` },
        { level: 'info', msg: () => `Multi-store price check verified for merchant_id="MCH-${Math.floor(1000 + Math.random() * 9000)}"` },
      ],
    },
    {
      service: 'container-redis',
      templates: [
        { level: 'info', msg: () => `DB 0: ${Math.floor(60000 + Math.random() * 10000)} keys in cache. Memory used: ${(Math.random() * 5 + 62).toFixed(1)}MB / 7.78GB. Hit rate: 98.7%` },
        { level: 'success', msg: () => `Redis AOF synced to disk: 0 errors detected` },
      ],
    },
    {
      service: 'qgrow-wallet-listener-container',
      templates: [
        { level: 'info', msg: () => `Kafka consumer message acknowledged: event="WalletBalanceUpdated" merchant="MCH-${Math.floor(1000 + Math.random() * 9000)}"` },
        { level: 'info', msg: () => `Double-entry balance calculation verified for merchant wallet account` },
      ],
    },
    {
      service: 'qgrow-trx-listener-container',
      templates: [
        { level: 'info', msg: () => `State machine update: trx="TRX-${Math.floor(100000 + Math.random() * 900000)}" status=COMPLETED` },
        { level: 'info', msg: () => `Event broadcast dispatched to Redis pub/sub channel "events:transactions:completed"` },
      ],
    },
    {
      service: 'qgrow-inbox-listener-container',
      templates: [
        { level: 'info', msg: () => `Push notification sent to ${Math.floor(10 + Math.random() * 50)} merchant devices (FCM ticket OK)` },
      ],
    },
    {
      service: 'qgrow-inbox-container',
      templates: [
        { level: 'info', msg: () => `GET /api/v1/inbox/list HTTP/1.1 200 OK (returned ${Math.floor(5 + Math.random() * 15)} notifications)` },
      ],
    },
    {
      service: 'qgrow-transfer-container',
      templates: [
        { level: 'info', msg: () => `Account inquiry successful: bank="${['BCA', 'BRI', 'MANDIRI', 'BNI', 'CIMB'][Math.floor(Math.random() * 5)]}" account="${Math.floor(1000000000 + Math.random() * 9000000000)}"` },
        { level: 'success', msg: () => `BI-FAST disbursement completed: IDR ${Math.floor(500000 + Math.random() * 5000000)} settled in ${(Math.random() * 100 + 80).toFixed(0)}ms` },
      ],
    },
    {
      service: 'qgrow-media-container',
      templates: [
        { level: 'info', msg: () => `Multipart asset processed: "product-image-${Math.floor(100 + Math.random() * 900)}.webp" (size: ${Math.floor(20 + Math.random() * 40)}KB)` },
      ],
    },
    {
      service: 'qgrow-menu-container',
      templates: [
        { level: 'info', msg: () => `Menu category cache hit for merchant "MCH-${Math.floor(1000 + Math.random() * 9000)}" (0.4ms response)` },
      ],
    },
    {
      service: 'qgrow-payment-container',
      templates: [
        { level: 'info', msg: () => `Payment checkout created: order_id="ORD-${Math.floor(100000 + Math.random() * 900000)}" amount=${Math.floor(50000 + Math.random() * 300000)}` },
      ],
    },
    {
      service: 'qgrow-wallet-container',
      templates: [
        { level: 'info', msg: () => `Merchant wallet statement generated: 48 ledger entries balance verified` },
      ],
    },
    {
      service: 'sshd[3022]',
      pid: 1142,
      templates: [
        { level: 'info', msg: () => `Accepted publickey for 51917-9399 from 103.150.191.24 port ${Math.floor(50000 + Math.random() * 10000)} ssh2: ED25519`, ip: '103.150.191.24' },
        { level: 'info', msg: () => `pam_unix(sshd:session): session closed for user 51917-9399` },
        { level: 'warning', msg: () => `Failed password for invalid user admin from 194.26.29.11 port ${Math.floor(40000 + Math.random() * 20000)} ssh2`, ip: '194.26.29.11' },
      ],
    },
    {
      service: 'nginx',
      pid: 1406,
      templates: [
        { level: 'info', msg: () => `SSL handshake complete [TLSv1.3] client: 103.150.191.24, server: node-51917.dewacloud.com`, ip: '103.150.191.24' },
        { level: 'info', msg: () => `Upstream container proxy pass: 172.20.0.8 responded 200 in ${(Math.random() * 4 + 0.5).toFixed(2)}ms` },
        { level: 'warning', msg: () => `client 185.220.101.5 requested non-existent resource /setup.php, returning 404`, ip: '185.220.101.5' },
      ],
    },
    {
      service: 'mariadbd',
      pid: 3190,
      templates: [
        { level: 'info', msg: () => `InnoDB: Buffer pool hit rate ${Math.floor(995 + Math.random() * 5)} / 1000. Active connections: ${Math.floor(4 + Math.random() * 8)}` },
        { level: 'info', msg: () => `Connection ${Math.floor(40000 + Math.random() * 10000)} opened for user "qgrow_db_user"@172.20.0.1` },
      ],
    },
    {
      service: 'docker',
      pid: 2480,
      templates: [
        { level: 'info', msg: () => `Container healthcheck probe OK: all 15 microservices running without restarts` },
      ],
    },
  ];

  const totalSteps = 260;
  for (let i = 1; i <= totalSteps; i++) {
    const secOffset = i * 1400 + Math.floor(Math.random() * 400);
    const entryDate = new Date(baseTime - secOffset * 1000);
    const { timestamp, isoTimestamp, dayOfWeek } = formatLogDate(entryDate);

    const svcGen = serviceGenerators[i % serviceGenerators.length];
    const template = svcGen.templates[i % svcGen.templates.length];
    const traceId = `tr-${Math.random().toString(36).substring(2, 10)}`;

    const message = template.msg();

    logs.push({
      id: `gen-svc-${i}`,
      timestamp,
      isoTimestamp,
      dayOfWeek,
      service: svcGen.service,
      level: template.level,
      message,
      ip: template.ip,
      durationMs: template.durationMs,
      traceId,
      host: 'gate.infra.dewacloud.com',
      pid: svcGen.pid || 1000,
      raw: `${timestamp} [${dayOfWeek}] [${svcGen.service}] ${template.level.toUpperCase()}: ${message}`,
    });
  }

  // Sort descending by ISO timestamp (newest first)
  logs.sort((a, b) => new Date(b.isoTimestamp || b.timestamp).getTime() - new Date(a.isoTimestamp || a.timestamp).getTime());

  return logs;
}
