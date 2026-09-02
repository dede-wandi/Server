export interface ServerNode {
  id: string;
  nodeId: string;
  name: string;
  host: string;
  port: number;
  username: string;
  sftpLink: string;
  sshCommand: string;
  path: string;
  authType: string;
  provider: string;
  status: 'online' | 'warning' | 'offline' | 'connecting';
  ipAddress: string;
  os: string;
  kernel: string;
  region: string;
  specs: {
    cpuCores: number;
    cpuModel: string;
    ramTotalGb: number;
    diskTotalGb: number;
    diskType: string;
    bandwidthLimitTb: number;
  };
}

export interface MetricPoint {
  time: string;
  cpu: number;
  cpuCores: number[];
  memory: number; // in %
  memUsedGb: number;
  disk: number; // in %
  networkInMb: number;
  networkOutMb: number;
  loadAvg: [number, number, number];
  iops: number;
}

export interface SystemProcess {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  mem: number;
  status: 'running' | 'sleeping' | 'stopped' | 'zombie';
  threads: number;
  uptime: string;
  command: string;
}

export interface SystemService {
  id: string;
  name: string;
  displayName: string;
  status: 'active' | 'inactive' | 'failed' | 'reloading';
  category: 'web' | 'database' | 'runtime' | 'security' | 'system';
  uptime: string;
  port?: number;
  memoryUsageMb: number;
  description: string;
  version: string;
}

export interface RemoteFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  sizeFormatted: string;
  permissions: string;
  owner: string;
  group: string;
  modified: string;
  content?: string;
  isExecutable?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  isoTimestamp?: string; // e.g. 2026-09-02T00:55:12.420Z
  dayOfWeek?: string;    // e.g. "Rabu", "Selasa", "Senin"
  level: 'info' | 'warning' | 'error' | 'success';
  service: string;
  message: string;
  ip?: string;
  pid?: number;
  statusCode?: number;
  durationMs?: number;
  traceId?: string;
  host?: string;
  raw?: string;
}

export interface FirewallRule {
  id: string;
  name: string;
  port: number | string;
  protocol: 'TCP' | 'UDP' | 'TCP/UDP';
  action: 'ALLOW' | 'DENY';
  source: string;
  status: 'active' | 'inactive';
  created: string;
}

export interface SSHKeyItem {
  id: string;
  name: string;
  type: 'ED25519' | 'RSA-4096' | 'ECDSA';
  fingerprint: string;
  publicKey: string;
  created: string;
  lastUsed: string;
}

export interface DockerContainer {
  id: string;
  shortId: string;
  name: string;
  image: string;
  command: string;
  created: string;
  status: string;
  state: 'running' | 'exited' | 'restarting' | 'paused';
  ports?: string;
  cpuUsage?: string;
  memUsage?: string;
  category?: 'core' | 'payment' | 'listener' | 'storage';
}

