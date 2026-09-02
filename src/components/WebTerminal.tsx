import React, { useState, useRef, useEffect } from 'react';
import { ServerNode } from '../types';
import { 
  Terminal as TerminalIcon, 
  Trash2, 
  Copy, 
  Check, 
  CornerDownLeft, 
  Maximize2, 
  Minimize2, 
  Zap, 
  Play
} from 'lucide-react';

interface WebTerminalProps {
  node: ServerNode;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: string;
  timestamp: string;
  status: 'success' | 'error';
}

export const WebTerminal: React.FC<WebTerminalProps> = ({ node }) => {
  const [inputCommand, setInputCommand] = useState('');
  const hostname = 'node51917-qgrowid-production';
  const promptUser = node.username === 'root' ? 'root' : node.username;

  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init-1',
      command: `ssh ${promptUser}@gate.infra.dewacloud.com -p ${node.port}`,
      output: `Last login: Wed Sep 2 08:28:49 2026 from 172.16.0.28
Welcome to Dewacloud Ubuntu 24.04.1 LTS (GNU/Linux 6.1.0-28-dewacloud-amd64 x86_64)

 * Documentation:  https://help.dewacloud.com
 * Node Cluster:   node51917-qgrowid-production (Tier-IV JKT1)
 * Active Runtime: Docker 27.3.1 (15 active microservices running)
 * System Load:    0.42, 0.58, 0.65 | RAM: 3.4GB / 8.0GB

Type 'docker ps' or 'help' to inspect running microservice containers.`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
    },
  ]);

  const [commandIndex, setCommandIndex] = useState<number>(-1);
  const [enteredCommands, setEnteredCommands] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('~');
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const quickCommands = [
    { label: 'Disk Usage', cmd: 'df -h' },
    { label: 'Free RAM', cmd: 'free -m' },
    { label: 'Top Processes', cmd: 'top' },
    { label: 'Docker PS', cmd: 'docker ps' },
    { label: 'Nginx Config Test', cmd: 'nginx -t' },
    { label: 'Open Ports', cmd: 'ss -tulpn' },
    { label: 'Uptime & Load', cmd: 'uptime' },
    { label: 'Fail2ban Status', cmd: 'fail2ban-client status' },
  ];

  const executeCommand = (cmdStr: string) => {
    const rawCmd = cmdStr.trim();
    if (!rawCmd) return;

    // Add to history list
    setEnteredCommands(prev => [...prev, rawCmd]);
    setCommandIndex(-1);

    const parts = rawCmd.split(' ');
    const mainCmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    let output = '';
    let status: 'success' | 'error' = 'success';

    switch (mainCmd) {
      case 'clear':
        setHistory([]);
        setInputCommand('');
        return;

      case 'help':
      case '?':
        output = `Dewacloud Node ${node.nodeId} Shell Command Guide:
  • df -h                     Check disk space and NVMe mount points
  • free -m / free -h         Display used and available RAM memory
  • top / htop                Interactive CPU & memory process monitor
  • uptime                    System uptime, active users, load average
  • uname -a                  Display Linux kernel and OS architecture
  • whoami                    Display current logged-in user (${node.username})
  • pwd                       Print working directory
  • ls [-la]                  List files in current directory
  • cd <dir>                  Change directory (~, /, /var/www, /etc)
  • cat <file>                Read content of text/configuration file
  • docker ps                 List running Docker containers
  • systemctl status <srv>    Check status of service (nginx, mariadb, sshd)
  • systemctl restart <srv>   Restart a system service
  • ss -tulpn / netstat       List listening ports and TCP sockets
  • ufw status                Check firewall rules & allowed ports
  • fail2ban-client status    Inspect SSH gate security bans
  • ping gate.infra.dewacloud.com  Test network latency to gateway
  • curl -I <url>             Inspect HTTP header responses
  • clear                     Clear the terminal screen`;
        break;

      case 'uptime':
        output = ` ${new Date().toLocaleTimeString()} up 14 days,  6:12,  1 user,  load average: 0.42, 0.58, 0.65`;
        break;

      case 'whoami':
        output = `${node.username}`;
        break;

      case 'id':
        output = `uid=1001(${node.username}) gid=1001(${node.username}) groups=1001(${node.username}),27(sudo),998(docker),33(www-data)`;
        break;

      case 'uname':
        output = `Linux dewacloud-node-${node.nodeId} 6.1.0-28-dewacloud-amd64 #1 SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux`;
        break;

      case 'pwd':
        output = currentPath === '~' ? `/home/${node.username}` : currentPath;
        break;

      case 'cd':
        if (!arg || arg === '~') {
          setCurrentPath('~');
          output = '';
        } else if (arg === '/') {
          setCurrentPath('/');
          output = '';
        } else if (arg === '..' || arg === '../') {
          setCurrentPath('~');
          output = '';
        } else if (arg.startsWith('/')) {
          setCurrentPath(arg);
          output = '';
        } else {
          setCurrentPath(prev => (prev === '/' ? `/${arg}` : `${prev}/${arg}`));
          output = '';
        }
        break;

      case 'ls':
        if (currentPath === '~' || currentPath === `/home/${node.username}`) {
          if (rawCmd.includes('-l') || rawCmd.includes('-a')) {
            output = `total 36
drwx------ 4 ${node.username} ${node.username} 4096 Sep  1 18:35 .
drwxr-xr-x 3 root          root          4096 Aug 15 11:00 ..
-rw------- 1 ${node.username} ${node.username}  842 Sep  1 18:30 .bash_history
-rw-r--r-- 1 ${node.username} ${node.username}  220 Aug 15 11:00 .bash_logout
-rw-r--r-- 1 ${node.username} ${node.username} 3771 Aug 15 11:00 .bashrc
drwx------ 2 ${node.username} ${node.username} 4096 Sep  1 18:35 .ssh
drwxr-xr-x 5 ${node.username} ${node.username} 4096 Aug 30 16:45 apps`;
          } else {
            output = `.bash_history  .bash_logout  .bashrc  .ssh  apps`;
          }
        } else if (currentPath === '/') {
          output = `bin   dev  home  lib64  mnt  proc  run   srv  tmp  var
boot  etc  lib   media  opt  root  sbin  sys  usr`;
        } else if (currentPath === '/var/www' || currentPath.includes('dewacloud-app')) {
          output = `dewacloud-app  html  package.json  server.js  .env.production  docker-compose.yml`;
        } else {
          output = `config  logs  data  src  dist  README.md`;
        }
        break;

      case 'df':
        output = `Filesystem      Size  Used Avail Use% Mounted on
udev            3.9G     0  3.9G   0% /dev
tmpfs           796M  1.4M  795M   1% /run
/dev/nvme0n1p2  120G   43G   77G  36% /
tmpfs           3.9G     0  3.9G   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
/dev/nvme0n1p1  511M  6.1M  505M   2% /boot/efi`;
        break;

      case 'free':
        output = `               total        used        free      shared  buff/cache   available
Mem:            7962        3412        2720         180        1830        4370
Swap:           2048         246        1802`;
        break;

      case 'top':
      case 'htop':
        output = `top - ${new Date().toLocaleTimeString()} up 14 days, 1 user,  load average: 0.42, 0.58, 0.65
Tasks: 148 total,   1 running, 147 sleeping,   0 stopped,   0 zombie
%Cpu(s):  3.4 us,  1.1 sy,  0.0 ni, 95.2 id,  0.2 wa,  0.0 hi,  0.1 si,  0.0 st
MiB Mem :   7962.4 total,   2720.1 free,   3412.3 used,   1830.0 buff/cache
MiB Swap:   2048.0 total,   1802.0 free,    246.0 used.   4370.1 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 5840 ${(node.username.slice(0, 8)).padEnd(8)}  20   0  982144 445920  32100 S   3.8   5.6  84:12.44 node
 5841 ${(node.username.slice(0, 8)).padEnd(8)}  20   0  974520 432100  32000 S   3.2   5.4  81:05.18 node
 3190 mysql     20   0 1840292 911360  28400 S   2.1  11.4 142:19.82 mariadbd
 2480 root      20   0 1420100 594120  41200 S   1.8   7.2  65:40.11 dockerd
 1406 www-data  20   0  148920  98400  12400 S   1.4   1.2  18:22.09 nginx
 1142 root      20   0   18420   4200   3100 S   0.2   0.5   0:44.12 sshd: ${node.username} [priv]`;
        break;

      case 'docker':
        if (arg === 'ps' || arg === 'ps -a' || !arg) {
          output = `CONTAINER ID   IMAGE                                                               COMMAND                  CREATED        STATUS        PORTS     NAMES
5f8d4b21eca1   registry.gitlab.com/qgrow.id1/qgrow-product/main:latest             "./qgrow-product -mi…"   5 hours ago    Up 4 hours              qgrow-product-container
c015a2eb7f6d   registry.gitlab.com/qgrow.id1/qgrow-qris/main:latest                "./qgrow-product -mi…"   5 days ago     Up 5 days               qgrow-qris-container
55882d315aec   registry.gitlab.com/qgrow.id1/qgrow-ewallet/main:latest             "./qgrow-ewallet -mi…"   9 days ago     Up 9 days               qgrow-ewallet-container
e177042af1b3   registry.gitlab.com/qgrow.id1/qgrow-payment-worker/main:latest      "/usr/bin/dumb-init …"   9 days ago     Up 9 days               qgrow-payment-worker-container
eab0ee09ef39   registry.gitlab.com/qgrow.id1/qgrow-branch/main:latest              "./qgrow-branch -mig…"   3 weeks ago    Up 3 weeks              qgrow-branch-container
756d4c0fa55a   redis:latest                                                        "docker-entrypoint.s…"   3 weeks ago    Up 3 weeks              container-redis
81980a2c7789   registry.gitlab.com/qgrow.id1/qgrow-wallet-listener/main:latest     "/usr/bin/dumb-init …"   3 weeks ago    Up 3 weeks              qgrow-wallet-listener-container
82abf6892a03   registry.gitlab.com/qgrow.id1/qgrow-trx-listener/main:latest        "/usr/bin/dumb-init …"   3 weeks ago    Up 3 weeks              qgrow-trx-listener-container
687bd0b0d407   registry.gitlab.com/qgrow.id1/qgrow-inbox-listener/master:latest    "/usr/bin/dumb-init …"   3 weeks ago    Up 3 weeks              qgrow-inbox-listener-container
8f9ae5e9e2a5   registry.gitlab.com/qgrow.id1/qgrow-inbox/master:latest             "./qgrow-inbox -migr…"   3 weeks ago    Up 3 weeks              qgrow-inbox-container
4007a1480640   registry.gitlab.com/qgrow.id1/qgrow-transfer/main:latest            "./qgrow-transfer -m…"   3 weeks ago    Up 3 weeks              qgrow-transfer-container
5bec2701db67   registry.gitlab.com/qgrow.id1/qgrow-media/master:latest             "./qgrow-media -migr…"   3 weeks ago    Up 3 weeks              qgrow-media-container
4d24fcf1290c   registry.gitlab.com/qgrow.id1/qgrow-menu/master:latest              "./qgrow-menu -migra…"   3 weeks ago    Up 3 weeks              qgrow-menu-container
4ece2346b186   registry.gitlab.com/qgrow.id1/qgrow-payment/main:latest             "./qgrow-payment -mi…"   3 weeks ago    Up 3 weeks              qgrow-payment-container
ef8760be1858   registry.gitlab.com/qgrow.id1/qgrow-wallet/master:latest            "./qgrow-wallet -mig…"   3 weeks ago    Up 3 weeks              qgrow-wallet-container`;
        } else if (arg.startsWith('stats') || arg.startsWith('--no-stream')) {
          output = `CONTAINER ID   NAME                             CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O         PIDS
5f8d4b21eca1   qgrow-product-container          1.42%     142.5MiB / 7.776GiB   1.79%     1.24MB / 8.42MB   12.4MB / 1.12MB   14
c015a2eb7f6d   qgrow-qris-container             0.84%     98.2MiB / 7.776GiB    1.23%     840kB / 3.12MB    8.21MB / 420kB    10
55882d315aec   qgrow-ewallet-container          2.15%     185.0MiB / 7.776GiB   2.32%     4.12MB / 18.5MB   34.2MB / 4.10MB   18
e177042af1b3   qgrow-payment-worker-container   1.10%     112.4MiB / 7.776GiB   1.41%     2.80MB / 11.2MB   16.8MB / 1.90MB   12
eab0ee09ef39   qgrow-branch-container           0.41%     86.1MiB / 7.776GiB    1.08%     412kB / 1.84MB    4.12MB / 110kB    8
756d4c0fa55a   container-redis                  0.62%     64.8MiB / 7.776GiB    0.81%     14.2MB / 28.6MB   2.10MB / 840kB    6
81980a2c7789   qgrow-wallet-listener-container  0.72%     92.3MiB / 7.776GiB    1.16%     1.80MB / 6.40MB   8.90MB / 820kB    10
82abf6892a03   qgrow-trx-listener-container     1.65%     134.0MiB / 7.776GiB   1.68%     5.40MB / 21.0MB   24.1MB / 2.80MB   15
687bd0b0d407   qgrow-inbox-listener-container   0.50%     78.5MiB / 7.776GiB    0.98%     980kB / 3.40MB    5.12MB / 310kB    8
8f9ae5e9e2a5   qgrow-inbox-container            0.34%     82.0MiB / 7.776GiB    1.03%     620kB / 2.10MB    4.80MB / 240kB    8
4007a1480640   qgrow-transfer-container         0.91%     108.2MiB / 7.776GiB   1.36%     2.10MB / 8.90MB   14.2MB / 1.40MB   11
5bec2701db67   qgrow-media-container            0.44%     95.0MiB / 7.776GiB    1.19%     1.12MB / 4.80MB   8.40MB / 620kB    9
4d24fcf1290c   qgrow-menu-container             0.52%     89.4MiB / 7.776GiB    1.12%     810kB / 3.10MB    6.20MB / 410kB    8
4ece2346b186   qgrow-payment-container          1.80%     160.7MiB / 7.776GiB   2.02%     3.90MB / 16.4MB   28.4MB / 3.20MB   16
ef8760be1858   qgrow-wallet-container           1.22%     124.6MiB / 7.776GiB   1.56%     2.60MB / 10.8MB   18.1MB / 1.80MB   12`;
        } else if (arg.startsWith('logs')) {
          const target = arg.replace('logs', '').trim() || 'qgrow-product-container';
          output = `[${target}] 2026-09-02T08:28:40.114Z [INFO] Application worker initialized successfully (PID 1)
[${target}] 2026-09-02T08:28:41.002Z [INFO] Connected to redis://container-redis:6379/0 pool_size=10
[${target}] 2026-09-02T08:28:41.312Z [INFO] Migration checks passed: schema version v2.14.0 up-to-date
[${target}] 2026-09-02T08:28:42.840Z [INFO] HTTP gRPC server listening on internal port :8080 (Gin/Go engine)
[${target}] 2026-09-02T08:30:15.220Z [INFO] [HealthCheck] Status 200 OK duration=0.8ms
[${target}] 2026-09-02T08:35:00.005Z [INFO] Processing incoming transaction batch #419208 (records=48)
[${target}] 2026-09-02T08:42:19.412Z [INFO] Kafka message acknowledged offset=89104 topic=qgrow.events.processed`;
        } else if (arg.startsWith('inspect')) {
          const target = arg.replace('inspect', '').trim() || 'qgrow-product-container';
          output = JSON.stringify([
            {
              Id: "5f8d4b21eca18928371629abefc881274191a82f",
              Created: "2026-09-02T03:15:22.9814421Z",
              Path: "./qgrow-product",
              Args: ["-migrate=true", "-port=8080"],
              State: {
                Status: "running",
                Running: true,
                Paused: false,
                Restarting: false,
                OOMKilled: false,
                Dead: false,
                Pid: 5840,
                ExitCode: 0,
                StartedAt: "2026-09-02T04:00:11.201948Z",
              },
              Image: "sha256:a48921df01bc58e99812984172",
              Name: `/${target}`,
              RestartPolicy: { Name: "always", MaximumRetryCount: 0 },
              NetworkSettings: {
                Bridge: "",
                SandboxID: "e8810293481237",
                IPAddress: "172.20.0.8",
                Networks: {
                  "qgrow_internal_net": {
                    IPAMConfig: null,
                    Links: null,
                    Aliases: [target, "product-svc"],
                    NetworkID: "c1829471928374",
                    Gateway: "172.20.0.1",
                    IPAddress: "172.20.0.8",
                  }
                }
              }
            }
          ], null, 2);
        } else if (arg === 'images') {
          output = `REPOSITORY                                                    TAG       IMAGE ID       CREATED        SIZE
registry.gitlab.com/qgrow.id1/qgrow-product/main              latest    5f8d4b21eca1   5 hours ago    142MB
registry.gitlab.com/qgrow.id1/qgrow-qris/main                 latest    c015a2eb7f6d   5 days ago     138MB
registry.gitlab.com/qgrow.id1/qgrow-ewallet/main              latest    55882d315aec   9 days ago     145MB
registry.gitlab.com/qgrow.id1/qgrow-payment-worker/main       latest    e177042af1b3   9 days ago     156MB
registry.gitlab.com/qgrow.id1/qgrow-branch/main               latest    eab0ee09ef39   3 weeks ago    132MB
redis                                                         latest    756d4c0fa55a   3 weeks ago    117MB
registry.gitlab.com/qgrow.id1/qgrow-wallet-listener/main      latest    81980a2c7789   3 weeks ago    140MB
registry.gitlab.com/qgrow.id1/qgrow-trx-listener/main         latest    82abf6892a03   3 weeks ago    148MB
registry.gitlab.com/qgrow.id1/qgrow-inbox-listener/master     latest    687bd0b0d407   3 weeks ago    135MB
registry.gitlab.com/qgrow.id1/qgrow-inbox/master              latest    8f9ae5e9e2a5   3 weeks ago    134MB
registry.gitlab.com/qgrow.id1/qgrow-transfer/main             latest    4007a1480640   3 weeks ago    144MB
registry.gitlab.com/qgrow.id1/qgrow-media/master              latest    5bec2701db67   3 weeks ago    162MB
registry.gitlab.com/qgrow.id1/qgrow-menu/master               latest    4d24fcf1290c   3 weeks ago    128MB
registry.gitlab.com/qgrow.id1/qgrow-payment/main              latest    4ece2346b186   3 weeks ago    158MB
registry.gitlab.com/qgrow.id1/qgrow-wallet/master             latest    ef8760be1858   3 weeks ago    146MB`;
        } else if (arg.startsWith('restart') || arg.startsWith('stop') || arg.startsWith('start')) {
          const action = arg.split(' ')[0];
          const target = arg.split(' ').slice(1).join(' ') || 'container';
          output = `${target}\n[docker] Container ${target} ${action}ed successfully.`;
        } else {
          output = `Docker version 27.3.1, build ce12230
Available subcommands:
  docker ps             List running microservice containers
  docker ps -a          List all containers including stopped
  docker stats          Display a live stream of container(s) resource usage statistics
  docker logs <name>    Fetch the logs of a container
  docker inspect <name> Return low-level information on Docker objects
  docker images         List available images from registry.gitlab.com/qgrow.id1/*
  docker restart <name> Restart one or more containers`;
        }
        break;

      case 'nginx':
        if (arg === '-t') {
          output = `nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful`;
        } else if (arg === '-v') {
          output = `nginx version: nginx/1.24.0 (Ubuntu)`;
        } else {
          output = `Nginx web server runtime. Use 'nginx -t' to validate configuration syntax.`;
        }
        break;

      case 'ss':
      case 'netstat':
        output = `State    Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
LISTEN   0      128    0.0.0.0:3022        0.0.0.0:*    users:(("sshd",pid=1142,fd=3))
LISTEN   0      511    0.0.0.0:80          0.0.0.0:*    users:(("nginx",pid=1406,fd=6))
LISTEN   0      511    0.0.0.0:443         0.0.0.0:*    users:(("nginx",pid=1406,fd=7))
LISTEN   0      128    0.0.0.0:3000        0.0.0.0:*    users:(("node",pid=5840,fd=18))
LISTEN   0      128    127.0.0.1:6379      0.0.0.0:*    users:(("redis-server",pid=4501,fd=6))
LISTEN   0      80     127.0.0.1:3306      0.0.0.0:*    users:(("mariadbd",pid=3190,fd=19))`;
        break;

      case 'ufw':
        output = `Status: active

To                         Action      From
--                         ------      ----
3022/tcp (Dewacloud SSH)   ALLOW       Anywhere
80/tcp (HTTP)              ALLOW       Anywhere
443/tcp (HTTPS)            ALLOW       Anywhere
3000/tcp (Node App)        ALLOW       Anywhere
3306/tcp (MySQL)           DENY        Anywhere
6379/tcp (Redis)           DENY        Anywhere`;
        break;

      case 'fail2ban-client':
        output = `Status
|- Number of jail:      1
- Jail list:           sshd

Status for the jail: sshd
|- Filter
|  |- Currently failed: 2
|  |- Total failed:     42
|  -  File list:        /var/log/auth.log
- Actions
   |- Currently banned: 3
   |- Total banned:     18
   - Banned IP list:    194.26.29.11 45.142.122.9 185.196.8.44`;
        break;

      case 'ping':
        output = `PING ${arg || 'gate.infra.dewacloud.com'} (${node.ipAddress}) 56(84) bytes of data.
64 bytes from ${node.host} (${node.ipAddress}): icmp_seq=1 ttl=56 time=14.2 ms
64 bytes from ${node.host} (${node.ipAddress}): icmp_seq=2 ttl=56 time=13.8 ms
64 bytes from ${node.host} (${node.ipAddress}): icmp_seq=3 ttl=56 time=14.5 ms
64 bytes from ${node.host} (${node.ipAddress}): icmp_seq=4 ttl=56 time=14.0 ms

--- ${arg || 'gate.infra.dewacloud.com'} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 13.842/14.125/14.512/0.245 ms`;
        break;

      case 'cat':
        if (arg.includes('authorized_keys')) {
          output = `# Dewacloud SSH Authorized Keys for Node ${node.nodeId}
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIL30+eUq+O3Jz7P7T9s8vK1N5mUa+w0V2xQ8d1Y9 dewacloud-key-primary`;
        } else if (arg.includes('.env')) {
          output = `NODE_ENV=production\nPORT=3000\nDB_HOST=127.0.0.1\nDB_NAME=dewacloud_prod`;
        } else {
          output = `# Configuration file preview for ${arg || 'file'}\nversion: 1.0\nenabled: true\nstatus: active`;
        }
        break;

      case 'systemctl':
        if (rawCmd.includes('status')) {
          const srv = arg.replace('status', '').trim() || 'nginx';
          output = `● ${srv}.service - ${srv.toUpperCase()} Application Daemon
     Loaded: loaded (/lib/systemd/system/${srv}.service; enabled; vendor preset: enabled)
     Active: active (running) since Wed 2026-08-19 18:22:10 UTC; 14 days ago
   Main PID: 1405 (${srv})
      Tasks: 4 (limit: 9480)
     Memory: 128.5M
        CPU: 18.240s
     CGroup: /system.slice/${srv}.service
             ├─1405 "${srv}: master process"
             └─1406 "${srv}: worker process"`;
        } else if (rawCmd.includes('restart')) {
          const srv = arg.replace('restart', '').trim() || 'service';
          output = `[systemd] Restarting ${srv}.service ...\n[systemd] Service ${srv}.service restarted successfully.`;
        } else {
          output = `Usage: systemctl [status|start|stop|restart|reload] <unit>`;
        }
        break;

      default:
        output = `bash: ${mainCmd}: command not found. Type 'help' to see available diagnostics commands.`;
        status = 'error';
        break;
    }

    setHistory(prev => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        command: rawCmd,
        output,
        timestamp: new Date().toLocaleTimeString(),
        status,
      },
    ]);

    setInputCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (enteredCommands.length === 0) return;
      const nextIndex = commandIndex === -1 ? enteredCommands.length - 1 : Math.max(0, commandIndex - 1);
      setCommandIndex(nextIndex);
      setInputCommand(enteredCommands[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (enteredCommands.length === 0 || commandIndex === -1) return;
      const nextIndex = commandIndex + 1;
      if (nextIndex >= enteredCommands.length) {
        setCommandIndex(-1);
        setInputCommand('');
      } else {
        setCommandIndex(nextIndex);
        setInputCommand(enteredCommands[nextIndex] || '');
      }
    }
  };

  const handleCopyOutput = () => {
    const fullText = history.map(h => `$ ${h.command}\n${h.output}`).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col bg-[#0A0B0E] border border-[#1F2229] rounded-xl overflow-hidden shadow-2xl transition-all ${
      isFullScreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[620px]'
    }`}>
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#0F1117] border-b border-[#1F2229]">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F87171]/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#FACC15]/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]/80"></div>
          </div>
          <span className="text-xs font-mono font-medium text-[#BFC3C9] ml-2 flex items-center gap-1.5">
            <TerminalIcon className="h-3.5 w-3.5 text-[#4E80EE]" />
            {node.username}@{node.host}:{node.port} (bash 5.2$)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            id="terminal-copy-buffer-btn"
            onClick={handleCopyOutput}
            className="p-1.5 rounded hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] transition cursor-pointer text-xs flex items-center gap-1"
            title="Copy Terminal History"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#4ADE80]" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            id="terminal-clear-btn"
            onClick={() => setHistory([])}
            className="p-1.5 rounded hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] transition cursor-pointer text-xs flex items-center gap-1"
            title="Clear Screen"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            id="terminal-fullscreen-btn"
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] transition cursor-pointer text-xs flex items-center gap-1"
            title={isFullScreen ? 'Exit Fullscreen' : 'Fullscreen Terminal'}
          >
            {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Snippets Chips */}
      <div className="px-3.5 py-2 bg-[#0F1117]/80 border-b border-[#1F2229] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[10px] font-bold text-[#545963] uppercase tracking-wider flex items-center gap-1 mr-1 flex-shrink-0">
          <Zap className="h-3 w-3 text-[#4E80EE]" />
          Quick Run:
        </span>
        {quickCommands.map((qc, i) => (
          <button
            key={i}
            id={`quick-cmd-${i}`}
            onClick={() => executeCommand(qc.cmd)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#161921] hover:bg-[#1F2229] text-[#4E80EE] hover:text-white border border-[#1F2229] font-mono text-xs whitespace-nowrap transition cursor-pointer"
          >
            <Play className="h-2.5 w-2.5 fill-[#4E80EE] text-[#4E80EE]" />
            <span>{qc.label}</span>
          </button>
        ))}
      </div>

      {/* Terminal Screen Body */}
      <div 
        className="flex-1 p-4 overflow-y-auto font-mono text-xs text-[#E0E2E7] space-y-3.5 cursor-text select-text"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center gap-1 text-[#8D9199]">
              <span className="text-[#4ADE80] font-semibold">{promptUser}@{hostname}</span>
              <span className="text-[#545963] font-bold">:</span>
              <span className="text-[#4E80EE] font-medium">{currentPath}</span>
              <span className="text-[#545963] font-bold">$</span>
              <span className="text-[#E0E2E7] font-semibold ml-1">{item.command}</span>
              <span className="text-[10px] text-[#545963] ml-auto">{item.timestamp}</span>
            </div>
            {item.output && (
              <pre className={`whitespace-pre-wrap leading-relaxed ${
                item.status === 'error' ? 'text-[#F87171]' : 'text-[#BFC3C9]'
              }`}>
                {item.output}
              </pre>
            )}
          </div>
        ))}

        {/* Live Input Line */}
        <div className="flex items-center gap-1 text-[#E0E2E7] pt-1">
          <span className="text-[#4ADE80] font-semibold flex-shrink-0">{promptUser}@{hostname}</span>
          <span className="text-[#545963] font-bold flex-shrink-0">:</span>
          <span className="text-[#4E80EE] font-medium flex-shrink-0">{currentPath}</span>
          <span className="text-[#545963] font-bold flex-shrink-0">$</span>
          <input
            ref={inputRef}
            id="terminal-command-input"
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (e.g. docker ps, docker stats, df -h)..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs px-1 focus:ring-0"
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
