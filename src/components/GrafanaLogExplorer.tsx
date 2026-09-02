import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ServerNode, LogEntry } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid
} from 'recharts';
import { 
  Search, 
  Calendar, 
  Clock, 
  Download, 
  Play, 
  Pause, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle, 
  X, 
  Maximize2, 
  Layers, 
  Code, 
  Terminal, 
  ArrowUpDown, 
  Zap, 
  ZoomIn, 
  ZoomOut,
  Server,
  Activity,
  FileText,
  Boxes,
  Cpu,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { formatLogDate, LINUX_SERVICES_META, ServiceMeta } from '../data/logData';

interface GrafanaLogExplorerProps {
  node: ServerNode;
  logs: LogEntry[];
  onAskAI?: (prompt: string) => void;
  onAddLog?: (log: LogEntry) => void;
}

const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const GrafanaLogExplorer: React.FC<GrafanaLogExplorerProps> = ({
  node,
  logs: propLogs,
  onAskAI,
  onAddLog
}) => {
  // Local logs state for live streaming
  const [logs, setLogs] = useState<LogEntry[]>(propLogs);

  useEffect(() => {
    setLogs(propLogs);
  }, [propLogs]);

  // View mode: 'docker-cli' | 'table' | 'raw' | 'json'
  const [viewMode, setViewMode] = useState<'docker-cli' | 'table' | 'raw' | 'json'>('docker-cli');
  const [wrapLines, setWrapLines] = useState<boolean>(true);
  const [showHistogram, setShowHistogram] = useState<boolean>(true);
  const [isLiveTail, setIsLiveTail] = useState<boolean>(true);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // CLI Stream State & Docker Flags
  const [cliTailLimit, setCliTailLimit] = useState<number>(100);
  const [showTimestampsInCLI, setShowTimestampsInCLI] = useState<boolean>(true);
  const [cliAutoScroll, setCliAutoScroll] = useState<boolean>(true);
  const [cliGrepTerm, setCliGrepTerm] = useState<string>('');
  const [terminalCleared, setTerminalCleared] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>('');

  // Time Filter State
  const [timePreset, setTimePreset] = useState<string>('all');
  const [timezone, setTimezone] = useState<'WIB' | 'UTC'>('WIB');
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState<boolean>(false);

  // Custom DateTime Granular State (From - To)
  const [startDate, setStartDate] = useState<string>('2026-08-28');
  const [startHour, setStartHour] = useState<string>('00');
  const [startMinute, setStartMinute] = useState<string>('00');
  const [startSecond, setStartSecond] = useState<string>('00');

  const [endDate, setEndDate] = useState<string>('2026-09-02');
  const [endHour, setEndHour] = useState<string>('23');
  const [endMinute, setEndMinute] = useState<string>('59');
  const [endSecond, setEndSecond] = useState<string>('59');

  // Service Group Tabs: 'all' | 'docker' | 'systemd'
  const [serviceGroupTab, setServiceGroupTab] = useState<'all' | 'docker' | 'systemd'>('docker');
  const [dockerSubCategory, setDockerSubCategory] = useState<string>('all');
  const [serviceSearchTerm, setServiceSearchTerm] = useState<string>('');

  // Query & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('qgrow-product-container');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const logStreamEndRef = useRef<HTMLDivElement>(null);
  const cliTerminalEndRef = useRef<HTMLDivElement>(null);

  // Quick preset ranges definition
  const handleApplyPreset = (preset: string) => {
    setTimePreset(preset);
    const now = new Date('2026-09-02T02:30:00.000Z');
    let from = new Date(now);

    if (preset === 'all') {
      setStartDate('2026-08-28');
      setStartHour('00');
      setStartMinute('00');
      setStartSecond('00');
      setEndDate('2026-09-02');
      setEndHour('23');
      setEndMinute('59');
      setEndSecond('59');
      return;
    }

    if (preset === 'last-5m') from = new Date(now.getTime() - 5 * 60 * 1000);
    else if (preset === 'last-15m') from = new Date(now.getTime() - 15 * 60 * 1000);
    else if (preset === 'last-30m') from = new Date(now.getTime() - 30 * 60 * 1000);
    else if (preset === 'last-1h') from = new Date(now.getTime() - 60 * 60 * 1000);
    else if (preset === 'last-3h') from = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    else if (preset === 'last-6h') from = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    else if (preset === 'last-12h') from = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    else if (preset === 'last-24h') from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    else if (preset === 'last-2d') from = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    else if (preset === 'last-7d') from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (preset === 'today') {
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
    } else if (preset === 'yesterday') {
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      from.setHours(0, 0, 0, 0);
      const toYesterday = new Date(from);
      toYesterday.setHours(23, 59, 59, 999);
      setEndDate(toYesterday.toISOString().substring(0, 10));
      setEndHour(String(toYesterday.getHours()).padStart(2, '0'));
      setEndMinute(String(toYesterday.getMinutes()).padStart(2, '0'));
      setEndSecond(String(toYesterday.getSeconds()).padStart(2, '0'));
    }

    setStartDate(from.toISOString().substring(0, 10));
    setStartHour(String(from.getHours()).padStart(2, '0'));
    setStartMinute(String(from.getMinutes()).padStart(2, '0'));
    setStartSecond(String(from.getSeconds()).padStart(2, '0'));

    if (preset !== 'yesterday') {
      setEndDate(now.toISOString().substring(0, 10));
      setEndHour(String(now.getHours()).padStart(2, '0'));
      setEndMinute(String(now.getMinutes()).padStart(2, '0'));
      setEndSecond(String(now.getSeconds()).padStart(2, '0'));
    }
  };

  // Convert custom start and end to timestamps
  const startTimestamp = useMemo(() => {
    const d = new Date(`${startDate}T${startHour}:${startMinute}:${startSecond}`);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }, [startDate, startHour, startMinute, startSecond]);

  const endTimestamp = useMemo(() => {
    const d = new Date(`${endDate}T${endHour}:${endMinute}:${endSecond}`);
    return isNaN(d.getTime()) ? Infinity : d.getTime();
  }, [endDate, endHour, endMinute, endSecond]);

  // Day of week strings for display
  const startDayName = useMemo(() => {
    const d = new Date(startDate);
    return isNaN(d.getTime()) ? '' : DAYS_ID[d.getDay()];
  }, [startDate]);

  const endDayName = useMemo(() => {
    const d = new Date(endDate);
    return isNaN(d.getTime()) ? '' : DAYS_ID[d.getDay()];
  }, [endDate]);

  // Dynamic Service Log Counts Map
  const serviceCounts = useMemo(() => {
    const counts: Record<string, { total: number; error: number; warning: number; success: number; info: number }> = {};
    logs.forEach(l => {
      if (!counts[l.service]) {
        counts[l.service] = { total: 0, error: 0, warning: 0, success: 0, info: 0 };
      }
      counts[l.service].total++;
      if (l.level === 'error') counts[l.service].error++;
      else if (l.level === 'warning') counts[l.service].warning++;
      else if (l.level === 'success') counts[l.service].success++;
      else counts[l.service].info++;
    });
    return counts;
  }, [logs]);

  // Active Service Meta information
  const activeServiceMeta = useMemo(() => {
    if (selectedService === 'all') return null;
    return LINUX_SERVICES_META.find(s => s.name === selectedService || s.id === selectedService) || null;
  }, [selectedService]);

  // Filtered Services List for Selection
  const availableServices = useMemo(() => {
    return LINUX_SERVICES_META.filter(s => {
      // 1. Group Tab Filter
      if (serviceGroupTab === 'docker' && s.type !== 'docker') return false;
      if (serviceGroupTab === 'systemd' && s.type !== 'systemd') return false;

      // 2. Docker Subcategory Filter
      if (serviceGroupTab === 'docker' && dockerSubCategory !== 'all') {
        if (dockerSubCategory === 'payment' && !['payment'].includes(s.category)) return false;
        if (dockerSubCategory === 'listener' && !['listener'].includes(s.category)) return false;
        if (dockerSubCategory === 'core' && !['core'].includes(s.category)) return false;
        if (dockerSubCategory === 'storage' && !['storage'].includes(s.category)) return false;
      }

      // 3. Service Search
      if (serviceSearchTerm.trim()) {
        const term = serviceSearchTerm.toLowerCase();
        const inName = s.name.toLowerCase().includes(term);
        const inDisplay = s.displayName.toLowerCase().includes(term);
        const inDesc = s.description.toLowerCase().includes(term);
        const inCategory = s.category.toLowerCase().includes(term);
        return inName || inDisplay || inDesc || inCategory;
      }

      return true;
    });
  }, [serviceGroupTab, dockerSubCategory, serviceSearchTerm]);

  // Helper to generate a live log entry for any service on demand or via stream
  const createServiceLogEntry = (svcName: string): LogEntry => {
    const now = new Date();
    const { timestamp, isoTimestamp, dayOfWeek } = formatLogDate(now);
    const meta = LINUX_SERVICES_META.find(s => s.name === svcName || s.id === svcName);

    const sampleEvents: Record<string, Array<{ level: 'info' | 'warning' | 'error' | 'success'; message: string; durationMs?: number }>> = {
      'qgrow-product-container': [
        { level: 'info', message: `GET /api/v1/products?limit=20&page=1 HTTP/1.1 200 OK (cache=HIT) in 1.2ms`, durationMs: 1.2 },
        { level: 'info', message: `Stock lock verified for SKU PRD-COFFEE-01 (available: 142, locked: 2)`, durationMs: 0.8 },
        { level: 'success', message: `Product variant prices synchronized across 12 branch outlets`, durationMs: 4.1 },
        { level: 'info', message: `Category tree re-indexed for merchantId="MCH-88210" in 2.3ms`, durationMs: 2.3 },
      ],
      'qgrow-qris-container': [
        { level: 'info', message: `GenerateDynamicQRIS ref="QR-${Math.floor(100000 + Math.random() * 900000)}" amount=${Math.floor(20000 + Math.random() * 150000)} fee=750`, durationMs: 2.4 },
        { level: 'success', message: `Callback received from National Switch: status=PAID rrn="${Math.floor(100000000000 + Math.random() * 900000000000)}"`, durationMs: 1.8 },
        { level: 'info', message: `QRIS string parsed: payload_format="01" point_of_initiation="12" merchant_pan="9360052300001892"`, durationMs: 0.9 },
      ],
      'qgrow-ewallet-container': [
        { level: 'info', message: `E-Wallet intent created: channel=GOPAY amount=${Math.floor(25000 + Math.random() * 100000)} fee=500`, durationMs: 3.8 },
        { level: 'success', message: `E-Wallet direct debit settlement verified (HTTP 200 OK)`, durationMs: 2.1 },
        { level: 'info', message: `HMAC SHA256 signature verified for ShopeePay notify payload (valid=true)` },
      ],
      'qgrow-payment-worker-container': [
        { level: 'info', message: `Payment worker consumed message from Kafka topic "qgrow.payments.settlement"` },
        { level: 'success', message: `Webhook dispatch succeeded to merchant URL (HTTP 200 in 34ms)`, durationMs: 34 },
        { level: 'info', message: `Reconciliation batch completed: 48 items processed, 0 pending retry`, durationMs: 12.5 },
      ],
      'qgrow-branch-container': [
        { level: 'info', message: `GET /api/v1/branches/BR-JKT-01/settings 200 OK (sync_latency: 0.9ms)`, durationMs: 0.9 },
        { level: 'info', message: `Cashier device registered: deviceId="POS-TERMINAL-04" branch="Jakarta Selatan"` },
      ],
      'qgrow-order-container': [
        { level: 'info', message: `POST /api/v1/orders created order_id="ORD-${Math.floor(100000 + Math.random() * 900000)}" items=3 total=${Math.floor(45000 + Math.random() * 200000)}`, durationMs: 3.2 },
        { level: 'success', message: `Order status updated to PAID, dispatched event to inventory queue` },
      ],
      'qgrow-customer-container': [
        { level: 'info', message: `Customer profile retrieved for phone="+628129881****" loyalty_tier="GOLD"`, durationMs: 1.1 },
      ],
      'qgrow-promo-container': [
        { level: 'info', message: `Voucher validated: code="HEMAT50" discount_calculated=15000 min_spend=30000`, durationMs: 1.6 },
      ],
      'qgrow-notification-container': [
        { level: 'info', message: `FCM push notification sent to device token token_hash="992a...f1" status=DELIVERED`, durationMs: 18.2 },
      ],
      'qgrow-auth-container': [
        { level: 'info', message: `JWT token issued for userId="usr_98124" role="merchant_admin" expiry=86400s`, durationMs: 0.7 },
      ],
      'container-redis': [
        { level: 'info', message: `DB 0: 64,890 keys in cache. Memory used: 64.9MB. Hit rate: 98.6% (client: 172.20.0.4:52110)` },
      ],
      'nginx': [
        { level: 'info', message: `HTTP/2 200 OK for https://qgrow.id/api/v1/products upstream: 172.20.0.3:8080 in 2.1ms (TLSv1.3 ECDHE-RSA-AES256-GCM-SHA384)`, durationMs: 2.1 },
      ],
      'mariadb': [
        { level: 'info', message: `[Note] InnoDB: Buffer pool hit rate: 994 / 1000. 12 active transactions committed.` },
      ],
      'sshd': [
        { level: 'info', message: `Accepted publickey for root from 182.253.120.44 port 54122 ssh2: RSA SHA256:d8a9...` },
      ],
      'docker': [
        { level: 'info', message: `dockerd: health_check completed for container 5f8d4b21eca1 (qgrow-product): healthy` },
      ],
    };

    const pool = sampleEvents[svcName] || [
      { level: 'info' as const, message: `Heartbeat health check OK for service ${svcName} (uptime active)` },
      { level: 'success' as const, message: `Handshake and socket session refreshed for ${svcName}` },
    ];

    const ev = pool[Math.floor(Math.random() * pool.length)];

    return {
      id: `live-log-${Date.now()}-${Math.random()}`,
      timestamp,
      isoTimestamp,
      dayOfWeek,
      service: svcName,
      level: ev.level,
      message: ev.message,
      durationMs: ev.durationMs,
      host: 'gate.infra.dewacloud.com',
      pid: meta?.pid || 1000,
      raw: `${timestamp} [${dayOfWeek}] [${svcName}] ${ev.level.toUpperCase()}: ${ev.message}`,
    };
  };

  const handleSimulateServiceLog = (svcName?: string) => {
    const target = svcName || (selectedService !== 'all' ? selectedService : 'qgrow-product-container');
    const newEntry = createServiceLogEntry(target);
    setLogs(prev => [newEntry, ...prev]);
    if (onAddLog) onAddLog(newEntry);
  };

  // Live Tail Simulator (appends realistic log entries tailored to selected service)
  useEffect(() => {
    if (!isLiveTail) return;

    const interval = setInterval(() => {
      const targetSvc = selectedService !== 'all' ? selectedService : 'qgrow-product-container';
      const newEntry = createServiceLogEntry(targetSvc);
      setLogs(prev => [newEntry, ...prev]);
      if (onAddLog) onAddLog(newEntry);
    }, 1800);

    return () => clearInterval(interval);
  }, [isLiveTail, selectedService, onAddLog]);

  // Auto scroll in live tail mode
  useEffect(() => {
    if (isLiveTail && logStreamEndRef.current && sortOrder === 'asc') {
      logStreamEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isLiveTail, sortOrder]);

  // CLI Auto scroll
  useEffect(() => {
    if (cliAutoScroll && cliTerminalEndRef.current && viewMode === 'docker-cli') {
      cliTerminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, cliAutoScroll, viewMode]);

  // Filter logs according to all user criteria
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Time Range Filter (only applied if not 'all')
      if (timePreset !== 'all') {
        const logTime = log.isoTimestamp ? new Date(log.isoTimestamp).getTime() : new Date(log.timestamp).getTime();
        if (!isNaN(logTime)) {
          if (logTime < startTimestamp || logTime > endTimestamp) {
            return false;
          }
        }
      }

      // 2. Service Filter
      if (selectedService !== 'all' && log.service !== selectedService) {
        return false;
      }

      // 3. Level Filter
      if (selectedLevel !== 'all' && log.level !== selectedLevel) {
        return false;
      }

      // 4. Day of Week Filter
      if (selectedDay !== 'all') {
        const day = log.dayOfWeek || (log.isoTimestamp ? DAYS_ID[new Date(log.isoTimestamp).getDay()] : '');
        if (day !== selectedDay) return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanQuery = q.replace(/^\{.*?\}\s*\|=\s*["']?/, '').replace(/["']$/, '');
        
        const inMessage = log.message.toLowerCase().includes(cleanQuery);
        const inService = log.service.toLowerCase().includes(cleanQuery);
        const inIp = log.ip ? log.ip.toLowerCase().includes(cleanQuery) : false;
        const inLevel = log.level.toLowerCase().includes(cleanQuery);
        const inTimestamp = log.timestamp.toLowerCase().includes(cleanQuery);
        const inDay = log.dayOfWeek ? log.dayOfWeek.toLowerCase().includes(cleanQuery) : false;

        if (!inMessage && !inService && !inIp && !inLevel && !inTimestamp && !inDay) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const timeA = a.isoTimestamp ? new Date(a.isoTimestamp).getTime() : new Date(a.timestamp).getTime();
      const timeB = b.isoTimestamp ? new Date(b.isoTimestamp).getTime() : new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [logs, startTimestamp, endTimestamp, selectedService, selectedLevel, selectedDay, searchQuery, sortOrder]);

  // Statistics calculation for the current filtered window
  const stats = useMemo(() => {
    const total = filteredLogs.length;
    let errors = 0;
    let warnings = 0;
    let successes = 0;
    let infos = 0;
    let totalLatency = 0;
    let latencyCount = 0;

    filteredLogs.forEach((l) => {
      if (l.level === 'error') errors++;
      else if (l.level === 'warning') warnings++;
      else if (l.level === 'success') successes++;
      else infos++;

      if (l.durationMs) {
        totalLatency += l.durationMs;
        latencyCount++;
      }
    });

    const errorRate = total > 0 ? ((errors / total) * 100).toFixed(1) : '0';
    const warnRate = total > 0 ? ((warnings / total) * 100).toFixed(1) : '0';
    const avgLatency = latencyCount > 0 ? (totalLatency / latencyCount).toFixed(1) : null;

    return { total, errors, warnings, successes, infos, errorRate, warnRate, avgLatency };
  }, [filteredLogs]);

  // Histogram data aggregation
  const histogramData = useMemo(() => {
    if (filteredLogs.length === 0) return [];

    const bucketCount = 14;
    const minTime = startTimestamp;
    const maxTime = Math.min(endTimestamp, Date.now() + 86400000);
    const rangeSpan = Math.max(1000, maxTime - minTime);
    const bucketSize = rangeSpan / bucketCount;

    const buckets = Array.from({ length: bucketCount }, (_, i) => {
      const bStart = new Date(minTime + i * bucketSize);
      const bEnd = new Date(minTime + (i + 1) * bucketSize);
      const label = `${bStart.getDate()}/${bStart.getMonth() + 1} ${String(bStart.getHours()).padStart(2, '0')}:${String(bStart.getMinutes()).padStart(2, '0')}`;
      return {
        timeLabel: label,
        startTime: bStart.getTime(),
        endTime: bEnd.getTime(),
        info: 0,
        warning: 0,
        error: 0,
        success: 0,
        total: 0,
      };
    });

    filteredLogs.forEach((log) => {
      const t = log.isoTimestamp ? new Date(log.isoTimestamp).getTime() : new Date(log.timestamp).getTime();
      const idx = Math.min(bucketCount - 1, Math.max(0, Math.floor((t - minTime) / bucketSize)));
      if (buckets[idx]) {
        if (log.level === 'error') buckets[idx].error++;
        else if (log.level === 'warning') buckets[idx].warning++;
        else if (log.level === 'success') buckets[idx].success++;
        else buckets[idx].info++;
        buckets[idx].total++;
      }
    });

    return buckets;
  }, [filteredLogs, startTimestamp, endTimestamp]);

  const handleHistogramBarClick = (bucket: any) => {
    if (!bucket || !bucket.startTime) return;
    const s = new Date(bucket.startTime);
    const e = new Date(bucket.endTime);

    setStartDate(s.toISOString().substring(0, 10));
    setStartHour(String(s.getHours()).padStart(2, '0'));
    setStartMinute(String(s.getMinutes()).padStart(2, '0'));
    setStartSecond(String(s.getSeconds()).padStart(2, '0'));

    setEndDate(e.toISOString().substring(0, 10));
    setEndHour(String(e.getHours()).padStart(2, '0'));
    setEndMinute(String(e.getMinutes()).padStart(2, '0'));
    setEndSecond(String(e.getSeconds()).padStart(2, '0'));
    setTimePreset('custom');
  };

  const handleZoomIn = () => {
    const center = (startTimestamp + endTimestamp) / 2;
    const halfSpan = (endTimestamp - startTimestamp) / 4;
    const newStart = new Date(center - halfSpan);
    const newEnd = new Date(center + halfSpan);

    setStartDate(newStart.toISOString().substring(0, 10));
    setStartHour(String(newStart.getHours()).padStart(2, '0'));
    setStartMinute(String(newStart.getMinutes()).padStart(2, '0'));
    setStartSecond(String(newStart.getSeconds()).padStart(2, '0'));

    setEndDate(newEnd.toISOString().substring(0, 10));
    setEndHour(String(newEnd.getHours()).padStart(2, '0'));
    setEndMinute(String(newEnd.getMinutes()).padStart(2, '0'));
    setEndSecond(String(newEnd.getSeconds()).padStart(2, '0'));
    setTimePreset('custom');
  };

  const handleZoomOut = () => {
    const center = (startTimestamp + endTimestamp) / 2;
    const halfSpan = (endTimestamp - startTimestamp);
    const newStart = new Date(center - halfSpan);
    const newEnd = new Date(center + halfSpan);

    setStartDate(newStart.toISOString().substring(0, 10));
    setStartHour(String(newStart.getHours()).padStart(2, '0'));
    setStartMinute(String(newStart.getMinutes()).padStart(2, '0'));
    setStartSecond(String(newStart.getSeconds()).padStart(2, '0'));

    setEndDate(newEnd.toISOString().substring(0, 10));
    setEndHour(String(newEnd.getHours()).padStart(2, '0'));
    setEndMinute(String(newEnd.getMinutes()).padStart(2, '0'));
    setEndSecond(String(newEnd.getSeconds()).padStart(2, '0'));
    setTimePreset('custom');
  };

  const handleCopyLog = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportLogs = (format: 'json' | 'csv' | 'log') => {
    let content = '';
    let mimeType = 'text/plain';
    let ext = format;

    if (format === 'json') {
      content = JSON.stringify(filteredLogs, null, 2);
      mimeType = 'application/json';
    } else if (format === 'csv') {
      mimeType = 'text/csv';
      content = 'Timestamp,Day,Service,Level,PID,IP,DurationMs,Message\n';
      filteredLogs.forEach((l) => {
        content += `"${l.timestamp}","${l.dayOfWeek || ''}","${l.service}","${l.level}","${l.pid || ''}","${l.ip || ''}","${l.durationMs || ''}","${l.message.replace(/"/g, '""')}"\n`;
      });
    } else {
      content = filteredLogs.map((l) => l.raw || `${l.timestamp} [${l.dayOfWeek}] [${l.service}] ${l.level.toUpperCase()}: ${l.message}`).join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qgrow-node-${node.nodeId}-${selectedService}-logs.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleInjectErrorSpike = () => {
    const now = new Date();
    const { timestamp, isoTimestamp, dayOfWeek } = formatLogDate(now);

    const spikeService = selectedService !== 'all' ? selectedService : 'qgrow-qris-container';

    const spikeEntries: LogEntry[] = [
      {
        id: `spike-1-${Date.now()}`,
        timestamp,
        isoTimestamp,
        dayOfWeek,
        service: spikeService,
        level: 'error',
        message: `High Severity Alert: Upstream timeout (504 Gateway Timeout) on service ${spikeService} while communicating with payment partner`,
        host: 'gate.infra.dewacloud.com',
        pid: activeServiceMeta?.pid || 1406,
        raw: `${timestamp} [${dayOfWeek}] [${spikeService}] ERROR: 504 Gateway Timeout partner API unreachable`,
      },
      {
        id: `spike-2-${Date.now()}`,
        timestamp,
        isoTimestamp,
        dayOfWeek,
        service: spikeService,
        level: 'warning',
        message: `Circuit breaker tripped for ${spikeService}: automatic failover triggered to secondary standby route`,
        host: 'gate.infra.dewacloud.com',
        pid: activeServiceMeta?.pid || 1406,
        raw: `${timestamp} [${dayOfWeek}] [${spikeService}] WARNING: Circuit breaker open, route degraded`,
      }
    ];

    setLogs(prev => [...spikeEntries, ...prev]);
    if (onAddLog) {
      spikeEntries.forEach(e => onAddLog(e));
    }
  };

  // CLI specific logs respecting tail limit, grep, and sorting (chronological for terminal stream)
  const cliLogs = useMemo(() => {
    if (terminalCleared) return [];

    let list = [...filteredLogs];
    
    // Sort chronological (oldest to newest) for terminal stream
    list.sort((a, b) => {
      const timeA = a.isoTimestamp ? new Date(a.isoTimestamp).getTime() : new Date(a.timestamp).getTime();
      const timeB = b.isoTimestamp ? new Date(b.isoTimestamp).getTime() : new Date(b.timestamp).getTime();
      return timeA - timeB;
    });

    if (cliGrepTerm.trim()) {
      const term = cliGrepTerm.toLowerCase().trim();
      list = list.filter(l => 
        l.message.toLowerCase().includes(term) ||
        l.service.toLowerCase().includes(term) ||
        l.level.toLowerCase().includes(term) ||
        l.timestamp.toLowerCase().includes(term)
      );
    }

    if (cliTailLimit > 0 && list.length > cliTailLimit) {
      list = list.slice(list.length - cliTailLimit);
    }

    return list;
  }, [filteredLogs, terminalCleared, cliGrepTerm, cliTailLimit]);

  // Derive human friendly CLI command line
  const dockerCliCommand = useMemo(() => {
    const isDocker = activeServiceMeta ? activeServiceMeta.type === 'docker' : true;
    
    if (isDocker) {
      const parts = [`docker logs ${selectedService}`];
      if (isLiveTail) parts.push('-f');
      if (showTimestampsInCLI) parts.push('-t');
      
      if (timePreset === 'custom') {
        parts.push(`--since "${startDate}T${startHour}:${startMinute}:${startSecond}"`);
        parts.push(`--until "${endDate}T${endHour}:${endMinute}:${endSecond}"`);
      } else if (timePreset.startsWith('last-')) {
        parts.push(`--since ${timePreset.replace('last-', '')}`);
      }
      
      if (cliTailLimit > 0 && timePreset !== 'custom') parts.push(`--tail ${cliTailLimit}`);
      if (cliGrepTerm.trim()) parts.push(`| grep "${cliGrepTerm}"`);
      return parts.join(' ');
    } else {
      const parts = [`journalctl -u ${selectedService}`];
      if (isLiveTail) parts.push('-f');
      if (timePreset === 'custom') {
        parts.push(`--since "${startDate} ${startHour}:${startMinute}:${startSecond}"`);
        parts.push(`--until "${endDate} ${endHour}:${endMinute}:${endSecond}"`);
      } else if (timePreset.startsWith('last-')) {
        parts.push(`--since "${timePreset.replace('last-', '')} ago"`);
      }
      if (cliTailLimit > 0 && timePreset !== 'custom') parts.push(`-n ${cliTailLimit}`);
      if (cliGrepTerm.trim()) parts.push(`| grep "${cliGrepTerm}"`);
      return parts.join(' ');
    }
  }, [activeServiceMeta, selectedService, isLiveTail, showTimestampsInCLI, timePreset, startDate, startHour, startMinute, startSecond, endDate, endHour, endMinute, endSecond, cliTailLimit, cliGrepTerm]);

  // Keep command input synced when filters change
  useEffect(() => {
    setCommandInput(dockerCliCommand);
  }, [dockerCliCommand]);

  // Execute typed or clicked docker command string
  const handleRunDockerCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    // 1. Detect service
    const matchService = trimmed.match(/docker\s+logs\s+([^\s]+)/i) || trimmed.match(/journalctl\s+-u\s+([^\s]+)/i);
    if (matchService && matchService[1]) {
      const svc = matchService[1].replace(/["']/g, '');
      setSelectedService(svc);
    }

    // 2. Detect --since
    const matchSince = trimmed.match(/--since\s+["']?([^"'\s]+)["']?/i);
    // 3. Detect --until
    const matchUntil = trimmed.match(/--until\s+["']?([^"'\s]+)["']?/i);

    if (matchSince || matchUntil) {
      setTimePreset('custom');
      if (matchSince) {
        const sinceVal = matchSince[1];
        if (sinceVal.includes('T')) {
          const [d, t] = sinceVal.split('T');
          if (d) setStartDate(d);
          if (t) {
            const tParts = t.split(':');
            if (tParts[0]) setStartHour(tParts[0].padStart(2, '0'));
            if (tParts[1]) setStartMinute(tParts[1].padStart(2, '0'));
            if (tParts[2]) setStartSecond(tParts[2].split('.')[0].padStart(2, '0'));
          }
        } else if (sinceVal.endsWith('m') || sinceVal.endsWith('h') || sinceVal.endsWith('d')) {
          handleApplyPreset(`last-${sinceVal}`);
        }
      }

      if (matchUntil) {
        const untilVal = matchUntil[1];
        if (untilVal.includes('T')) {
          const [d, t] = untilVal.split('T');
          if (d) setEndDate(d);
          if (t) {
            const tParts = t.split(':');
            if (tParts[0]) setEndHour(tParts[0].padStart(2, '0'));
            if (tParts[1]) setEndMinute(tParts[1].padStart(2, '0'));
            if (tParts[2]) setEndSecond(tParts[2].split('.')[0].padStart(2, '0'));
          }
        }
      }
    }

    // 4. Detect -f
    if (trimmed.includes(' -f') || trimmed.endsWith(' -f')) {
      setIsLiveTail(true);
    } else if (matchSince && matchUntil) {
      setIsLiveTail(false);
    }

    // 5. Detect -t
    if (trimmed.includes(' -t') || trimmed.endsWith(' -t')) {
      setShowTimestampsInCLI(true);
    }

    // 6. Detect --tail
    const matchTail = trimmed.match(/--tail\s+(\d+)/i) || trimmed.match(/-n\s+(\d+)/i);
    if (matchTail && matchTail[1]) {
      setCliTailLimit(Number(matchTail[1]));
    }

    // 7. Detect grep
    const matchGrep = trimmed.match(/grep\s+["']?([^"']+)["']?/i);
    if (matchGrep && matchGrep[1]) {
      setCliGrepTerm(matchGrep[1].trim());
    } else if (!trimmed.includes('grep')) {
      setCliGrepTerm('');
    }
  };

  return (
    <div className="space-y-4 text-[#E0E2E7]">
      
      {/* TOP HEADER: SERVICE TRACKING DASHBOARD & TIME CONTROLS */}
      <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#1F2229] pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#4E80EE]/10 border border-[#4E80EE]/20 text-[#4E80EE]">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Log Explorer per-Service (Grafana & Loki)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#4E80EE]/15 text-[#4E80EE] border border-[#4E80EE]/30">
                  Per-Service Tracking
                </span>
                {isLiveTail && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#122A1E] text-[#4ADE80] border border-[#1B3F2D] animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] mr-1"></span>
                    LIVE STREAMING
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8D9199]">
                Tracking log terisolasi per-microservice (15 Docker Containers) & Daemon Linux dengan filter presisi, error tracing, dan audit real-time.
              </p>
            </div>
          </div>

          {/* Time Presets & Global Actions */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Quick Presets Dropdown */}
            <div className="flex items-center bg-[#0A0B0E] border border-[#1F2229] rounded-lg p-0.5 text-xs font-mono">
              <select
                id="log-time-preset-select"
                value={timePreset}
                onChange={(e) => handleApplyPreset(e.target.value)}
                className="bg-transparent text-[#E0E2E7] py-1 px-2.5 outline-none cursor-pointer text-xs"
              >
                <option value="last-5m" className="bg-[#0F1117]">5 Menit Terakhir</option>
                <option value="last-15m" className="bg-[#0F1117]">15 Menit Terakhir</option>
                <option value="last-30m" className="bg-[#0F1117]">30 Menit Terakhir</option>
                <option value="last-1h" className="bg-[#0F1117]">1 Jam Terakhir</option>
                <option value="last-3h" className="bg-[#0F1117]">3 Jam Terakhir</option>
                <option value="last-6h" className="bg-[#0F1117]">6 Jam Terakhir</option>
                <option value="last-12h" className="bg-[#0F1117]">12 Jam Terakhir</option>
                <option value="last-24h" className="bg-[#0F1117]">24 Jam Terakhir</option>
                <option value="last-2d" className="bg-[#0F1117]">2 Hari Terakhir</option>
                <option value="last-7d" className="bg-[#0F1117]">7 Hari Terakhir (Semua Log)</option>
                <option value="today" className="bg-[#0F1117]">Hari Ini (00:00 - Now)</option>
                <option value="yesterday" className="bg-[#0F1117]">Kemarin (Full Day)</option>
                <option value="custom" className="bg-[#0F1117]">⚡ Custom Precision Range</option>
              </select>
            </div>

            {/* Granular Time Range Toggle Button */}
            <button
              id="log-toggle-custom-time-btn"
              onClick={() => setIsCustomRangeOpen(!isCustomRangeOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                isCustomRangeOpen || timePreset === 'custom'
                  ? 'bg-[#4E80EE]/15 border-[#4E80EE] text-[#4E80EE]'
                  : 'bg-[#161921] border-[#1F2229] text-[#BFC3C9] hover:text-[#E0E2E7] hover:border-[#30343D]'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-[#4E80EE]" />
              <span className="font-mono text-[11px]">
                {startDate} {startHour}:{startMinute} ({startDayName}) → {endDate} {endHour}:{endMinute} ({endDayName})
              </span>
              {isCustomRangeOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {/* Zoom In & Out */}
            <div className="flex items-center bg-[#0A0B0E] border border-[#1F2229] rounded-lg p-0.5">
              <button
                id="log-zoom-in-btn"
                onClick={handleZoomIn}
                className="p-1 text-[#8D9199] hover:text-[#E0E2E7] hover:bg-[#161921] rounded transition cursor-pointer"
                title="Zoom In 2x"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                id="log-zoom-out-btn"
                onClick={handleZoomOut}
                className="p-1 text-[#8D9199] hover:text-[#E0E2E7] hover:bg-[#161921] rounded transition cursor-pointer"
                title="Zoom Out 2x"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Live Tail Toggle */}
            <button
              id="log-live-tail-toggle-btn"
              onClick={() => setIsLiveTail(!isLiveTail)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                isLiveTail
                  ? 'bg-[#122A1E] text-[#4ADE80] border border-[#1B3F2D]'
                  : 'bg-[#161921] text-[#8D9199] hover:text-[#E0E2E7] border border-[#1F2229]'
              }`}
            >
              {isLiveTail ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span>{isLiveTail ? 'Pause Stream' : 'Live Tail'}</span>
            </button>

            {/* Test Spike Generator */}
            <button
              id="log-inject-spike-btn"
              onClick={handleInjectErrorSpike}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#161921] hover:bg-[#1F2229] border border-[#1F2229] text-xs text-[#E0E2E7] transition cursor-pointer"
              title="Simulate / Inject Test Error on Active Service"
            >
              <Zap className="h-3.5 w-3.5 text-[#FACC15]" />
              <span className="hidden sm:inline">Simulate Spike</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative group">
              <button
                id="log-export-btn"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#161921] hover:bg-[#1F2229] border border-[#1F2229] text-xs text-[#E0E2E7] transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#8D9199]" />
                <span>Export</span>
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-[#0F1117] border border-[#1F2229] rounded-lg shadow-2xl py-1 z-30 hidden group-hover:block text-xs font-mono">
                <button
                  onClick={() => handleExportLogs('log')}
                  className="w-full text-left px-3 py-1.5 text-[#BFC3C9] hover:text-white hover:bg-[#161921]"
                >
                  Export as .LOG ({selectedService})
                </button>
                <button
                  onClick={() => handleExportLogs('json')}
                  className="w-full text-left px-3 py-1.5 text-[#BFC3C9] hover:text-white hover:bg-[#161921]"
                >
                  Export as .JSON
                </button>
                <button
                  onClick={() => handleExportLogs('csv')}
                  className="w-full text-left px-3 py-1.5 text-[#BFC3C9] hover:text-white hover:bg-[#161921]"
                >
                  Export as .CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CUSTOM GRANULAR DATE-TIME PICKER ACCORDION */}
        {isCustomRangeOpen && (
          <div className="p-3.5 bg-[#0A0B0E] border border-[#1F2229] rounded-xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1F2229] pb-2 text-xs">
              <span className="font-semibold text-[#E0E2E7] flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#4E80EE]" />
                Filter Log Presisi: Atur Tanggal, Hari, Jam, Menit, & Detik
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8D9199]">Timezone:</span>
                <button
                  onClick={() => setTimezone(timezone === 'WIB' ? 'UTC' : 'WIB')}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161921] border border-[#1F2229] text-[#4E80EE]"
                >
                  {timezone} (UTC{timezone === 'WIB' ? '+7' : '+0'})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              {/* FROM / START TIME */}
              <div className="bg-[#0F1117] p-3 rounded-lg border border-[#1F2229] space-y-2">
                <div className="flex items-center justify-between text-[#8D9199]">
                  <span className="font-semibold text-[#4ADE80] flex items-center gap-1">
                    <span>FROM (Mulai Dari):</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#161921] text-[#E0E2E7] text-[10px]">
                    Hari {startDayName}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-5 sm:col-span-2">
                    <label className="block text-[10px] text-[#8D9199] mb-1">Tanggal (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setTimePreset('custom');
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded text-[#E0E2E7] focus:border-[#4E80EE] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8D9199] mb-1">Jam (00-23)</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={startHour}
                      onChange={(e) => {
                        setStartHour(e.target.value.padStart(2, '0'));
                        setTimePreset('custom');
                      }}
                      className="w-full px-2 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded text-[#E0E2E7] text-center focus:border-[#4E80EE] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8D9199] mb-1">Menit (00-59)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={startMinute}
                      onChange={(e) => {
                        setStartMinute(e.target.value.padStart(2, '0'));
                        setTimePreset('custom');
                      }}
                      className="w-full px-2 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded text-[#E0E2E7] text-center focus:border-[#4E80EE] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8D9199] mb-1">Detik (00-59)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={startSecond}
                      onChange={(e) => {
                        setStartSecond(e.target.value.padStart(2, '0'));
                        setTimePreset('custom');
                      }}
                      className="w-full px-2 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded text-[#E0E2E7] text-center focus:border-[#4E80EE] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* TO / END TIME */}
              <div className="bg-[#0F1117] p-3 rounded-lg border border-[#1F2229] space-y-2">
                <div className="flex items-center justify-between text-[#8D9199]">
                  <span className="font-semibold text-[#F87171] flex items-center gap-1">
                    <span>TO (Sampai Dengan):</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#161921] text-[#E0E2E7] text-[10px]">
                    Hari {endDayName}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-5 sm:col-span-2">
                    <label className="block text-[10px] text-[#8D9199] mb-1">Tanggal (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setTimePreset('custom');
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded text-[#E0E2E7] focus:border-[#4E80EE] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8D9199] mb-1">Jam (00-23)</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={endHour}
                      onChange={(e) => {
                        setEndHour(e.target.value.padStart(2, '0'));
                        setTimePreset('custom');
                      }}
                      className="w-full px-2 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded text-[#E0E2E7] text-center focus:border-[#4E80EE] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8D9199] mb-1">Menit (00-59)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={endMinute}
                      onChange={(e) => {
                        setEndMinute(e.target.value.padStart(2, '0'));
                        setTimePreset('custom');
                      }}
                      className="w-full px-2 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded text-[#E0E2E7] text-center focus:border-[#4E80EE] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8D9199] mb-1">Detik (00-59)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={endSecond}
                      onChange={(e) => {
                        setEndSecond(e.target.value.padStart(2, '0'));
                        setTimePreset('custom');
                      }}
                      className="w-full px-2 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded text-[#E0E2E7] text-center focus:border-[#4E80EE] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Granular Presets */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1F2229] flex-wrap text-xs font-mono">
              <span className="text-[#8D9199] text-[11px]">Quick Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setStartDate('2026-09-02');
                  setStartHour('06');
                  setStartMinute('48');
                  setStartSecond('00');
                  setEndDate('2026-09-02');
                  setEndHour('06');
                  setEndMinute('48');
                  setEndSecond('59');
                  setTimePreset('custom');
                  setIsLiveTail(false);
                }}
                className="px-2.5 py-1 rounded bg-[#161921] hover:bg-[#1F2229] border border-[#4E80EE]/50 text-[#60A5FA] hover:text-white transition cursor-pointer flex items-center gap-1"
              >
                <span>2026-09-02T06:48:00 s/d 06:48:59 (1 Menit Presisi)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartDate('2026-09-02');
                  setStartHour('00');
                  setStartMinute('00');
                  setStartSecond('00');
                  setEndDate('2026-09-02');
                  setEndHour('23');
                  setEndMinute('59');
                  setEndSecond('59');
                  setTimePreset('custom');
                }}
                className="px-2 py-1 rounded bg-[#161921] hover:bg-[#1F2229] border border-[#1F2229] text-[#BFC3C9] hover:text-white transition cursor-pointer"
              >
                Hari Ini Penuh (02 Sep)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartDate('2026-09-01');
                  setStartHour('00');
                  setStartMinute('00');
                  setStartSecond('00');
                  setEndDate('2026-09-01');
                  setEndHour('23');
                  setEndMinute('59');
                  setEndSecond('59');
                  setTimePreset('custom');
                }}
                className="px-2 py-1 rounded bg-[#161921] hover:bg-[#1F2229] border border-[#1F2229] text-[#BFC3C9] hover:text-white transition cursor-pointer"
              >
                Kemarin (01 Sep)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 🚀 PRIMARY DEDICATED PER-SERVICE TRACKING SELECTOR & DIRECTORY           */}
      {/* ========================================================================= */}
      <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-4 shadow-xl space-y-3.5">
        
        {/* Service Category & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1F2229] pb-3">
          
          {/* Main Service Group Tabs */}
          <div className="flex items-center gap-1.5 bg-[#0A0B0E] p-1 rounded-lg border border-[#1F2229] text-xs font-mono">
            <button
              onClick={() => {
                setServiceGroupTab('docker');
                setDockerSubCategory('all');
              }}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                serviceGroupTab === 'docker'
                  ? 'bg-[#4E80EE] text-white font-bold shadow-md'
                  : 'text-[#8D9199] hover:text-[#E0E2E7]'
              }`}
            >
              <Boxes className="h-3.5 w-3.5" />
              <span>Docker Microservices (15)</span>
            </button>

            <button
              onClick={() => setServiceGroupTab('systemd')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                serviceGroupTab === 'systemd'
                  ? 'bg-[#4E80EE] text-white font-bold shadow-md'
                  : 'text-[#8D9199] hover:text-[#E0E2E7]'
              }`}
            >
              <Server className="h-3.5 w-3.5" />
              <span>System Daemons (11)</span>
            </button>

            <button
              onClick={() => setServiceGroupTab('all')}
              className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                serviceGroupTab === 'all'
                  ? 'bg-[#4E80EE] text-white font-bold shadow-md'
                  : 'text-[#8D9199] hover:text-[#E0E2E7]'
              }`}
            >
              <span>Semua Stack ({LINUX_SERVICES_META.length})</span>
            </button>
          </div>

          {/* Service Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8D9199]" />
            <input
              type="text"
              placeholder="Cari service (cth: qris, wallet, payment, nginx)..."
              value={serviceSearchTerm}
              onChange={(e) => setServiceSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-xs font-mono text-[#E0E2E7] placeholder:text-[#545963] focus:outline-none focus:border-[#4E80EE]"
            />
            {serviceSearchTerm && (
              <button
                onClick={() => setServiceSearchTerm('')}
                className="absolute right-2 top-2 text-[#8D9199] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Docker Subcategories Pills (When Docker tab is active) */}
        {serviceGroupTab === 'docker' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono no-scrollbar">
            <span className="text-[11px] text-[#8D9199] flex-shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3 text-[#4E80EE]" />
              Filter Stack:
            </span>
            {[
              { id: 'all', label: 'Semua 15 Kontainer' },
              { id: 'payment', label: '💳 Payment & QRIS (5)' },
              { id: 'listener', label: '⚡ Listeners & Workers (4)' },
              { id: 'core', label: '📦 Core & Catalog (5)' },
              { id: 'storage', label: '🗄️ Cache & Redis (1)' },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setDockerSubCategory(sub.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition flex-shrink-0 border cursor-pointer ${
                  dockerSubCategory === sub.id
                    ? 'bg-[#161921] border-[#4E80EE] text-[#4E80EE] font-semibold'
                    : 'bg-[#0A0B0E] border-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7]'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Interactive Service Grid / Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar font-mono text-xs">
          
          {/* 'All Services Combined' Card */}
          <div
            onClick={() => setSelectedService('all')}
            className={`p-2.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
              selectedService === 'all'
                ? 'bg-[#4E80EE]/15 border-[#4E80EE] text-white shadow-lg ring-1 ring-[#4E80EE]'
                : 'bg-[#0A0B0E] border-[#1F2229] text-[#8D9199] hover:border-[#30343D] hover:bg-[#161921]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80]"></span>
                <span className="font-bold text-[#E0E2E7] text-[11px]">ALL SERVICES COMBINED</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#161921] text-[#4E80EE] border border-[#1F2229]">
                Aggregated
              </span>
            </div>
            <p className="text-[10px] text-[#8D9199] truncate mb-2">
              Streaming gabungan seluruh microservices & daemons
            </p>
            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#1F2229]/60">
              <span className="text-[#8D9199]">Total logs:</span>
              <span className="font-bold text-[#E0E2E7]">{logs.length}</span>
            </div>
          </div>

          {/* Individual Service Cards */}
          {availableServices.map((s) => {
            const isSelected = selectedService === s.name || selectedService === s.id;
            const countInfo = serviceCounts[s.name] || serviceCounts[s.id] || { total: 0, error: 0, warning: 0, success: 0, info: 0 };

            return (
              <div
                key={s.id}
                onClick={() => setSelectedService(s.name)}
                className={`p-2.5 rounded-lg border transition cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-[#4E80EE]/15 border-[#4E80EE] text-white shadow-lg ring-1 ring-[#4E80EE]'
                    : 'bg-[#0A0B0E] border-[#1F2229] text-[#8D9199] hover:border-[#30343D] hover:bg-[#161921]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        countInfo.error > 0 ? 'bg-[#F87171] animate-pulse' : 'bg-[#4ADE80]'
                      }`} />
                      <span className={`font-semibold text-xs truncate ${isSelected ? 'text-[#4E80EE]' : 'text-[#E0E2E7]'}`}>
                        {s.name}
                      </span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-mono ${
                      s.type === 'docker' ? 'bg-[#1E3A8A]/40 text-[#60A5FA] border border-[#1E3A8A]' : 'bg-[#161921] text-[#8D9199]'
                    }`}>
                      {s.type === 'docker' ? 'Docker' : 'Systemd'}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#8D9199] truncate mb-2">
                    {s.displayName}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#1F2229]/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#8D9199]">{countInfo.total} logs</span>
                    {countInfo.error > 0 && (
                      <span className="px-1.5 py-0.2 rounded bg-[#F87171]/20 text-[#F87171] font-bold text-[9px] border border-[#F87171]/40">
                        {countInfo.error} err
                      </span>
                    )}
                  </div>
                  {s.port && (
                    <span className="text-[#8D9199] text-[10px]">{s.port}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎯 ACTIVE SELECTED SERVICE DEEP TRACKING BANNER & QUICK FILTERS          */}
      {/* ========================================================================= */}
      {activeServiceMeta ? (
        <div className="bg-[#0A0B0E] border border-[#4E80EE]/40 rounded-xl p-4 shadow-xl space-y-3.5 animate-in fade-in">
          
          {/* Header info */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#1F2229] pb-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#4E80EE]/20 border border-[#4E80EE]/30 text-[#4E80EE]">
                {activeServiceMeta.type === 'docker' ? <Boxes className="h-5 w-5" /> : <Server className="h-5 w-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white font-mono">
                    {activeServiceMeta.displayName}
                  </h3>
                  <code className="text-[#4E80EE] bg-[#161921] px-2 py-0.5 rounded text-xs border border-[#1F2229]">
                    {activeServiceMeta.name}
                  </code>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#122A1E] text-[#4ADE80] border border-[#1B3F2D] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse"></span>
                    STATUS: HEALTHY (RUNNING)
                  </span>
                </div>
                <p className="text-xs text-[#8D9199] mt-1">
                  {activeServiceMeta.description}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
              <button
                onClick={() => setSelectedService('all')}
                className="px-2.5 py-1.5 rounded bg-[#161921] hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] border border-[#1F2229] transition cursor-pointer"
              >
                Lihat Semua Service
              </button>
            </div>
          </div>

          {/* Telemetry & Key Tracking Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-[#0F1117] border border-[#1F2229]">
              <span className="text-[10px] text-[#8D9199] block">Total Logs Captured</span>
              <span className="text-sm font-bold text-[#E0E2E7]">{stats.total}</span>
            </div>
            <div 
              onClick={() => setSelectedLevel(selectedLevel === 'error' ? 'all' : 'error')}
              className={`p-2.5 rounded-lg border cursor-pointer transition ${
                selectedLevel === 'error' ? 'bg-[#451B1E] border-[#F87171]' : 'bg-[#0F1117] border-[#1F2229] hover:border-[#F87171]/50'
              }`}
            >
              <span className="text-[10px] text-[#F87171] block">Errors Detected</span>
              <span className="text-sm font-bold text-[#F87171]">{stats.errors} ({stats.errorRate}%)</span>
            </div>
            <div 
              onClick={() => setSelectedLevel(selectedLevel === 'warning' ? 'all' : 'warning')}
              className={`p-2.5 rounded-lg border cursor-pointer transition ${
                selectedLevel === 'warning' ? 'bg-[#3E3314] border-[#FACC15]' : 'bg-[#0F1117] border-[#1F2229] hover:border-[#FACC15]/50'
              }`}
            >
              <span className="text-[10px] text-[#FACC15] block">Warnings / Slow</span>
              <span className="text-sm font-bold text-[#FACC15]">{stats.warnings}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0F1117] border border-[#1F2229]">
              <span className="text-[10px] text-[#8D9199] block">Avg Response Latency</span>
              <span className="text-sm font-bold text-[#4ADE80]">{stats.avgLatency ? `${stats.avgLatency}ms` : '0.9ms'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0F1117] border border-[#1F2229]">
              <span className="text-[10px] text-[#8D9199] block">Container ID / PID</span>
              <span className="text-xs font-semibold text-[#60A5FA] truncate block">
                {activeServiceMeta.containerId || `PID ${activeServiceMeta.pid}`}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0F1117] border border-[#1F2229]">
              <span className="text-[10px] text-[#8D9199] block">Port / Network</span>
              <span className="text-xs font-semibold text-[#E0E2E7] truncate block">
                {activeServiceMeta.port || 'Internal Socket'}
              </span>
            </div>
          </div>

          {/* Quick Tracking Scenario Shortcuts */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono pb-0.5 no-scrollbar">
            <span className="text-[10px] text-[#8D9199] flex-shrink-0">Filter Cepat {activeServiceMeta.name}:</span>
            <button
              onClick={() => {
                setSelectedLevel('all');
                setSearchQuery('');
              }}
              className={`px-2.5 py-1 rounded text-[11px] border transition cursor-pointer flex-shrink-0 ${
                selectedLevel === 'all' && !searchQuery
                  ? 'bg-[#4E80EE] text-white border-[#4E80EE] font-bold'
                  : 'bg-[#0F1117] border-[#1F2229] text-[#BFC3C9] hover:text-white'
              }`}
            >
              Semua Log
            </button>
            <button
              onClick={() => {
                setSelectedLevel('error');
                setSearchQuery('');
              }}
              className={`px-2.5 py-1 rounded text-[11px] border transition cursor-pointer flex-shrink-0 ${
                selectedLevel === 'error'
                  ? 'bg-[#F87171] text-white border-[#F87171] font-bold'
                  : 'bg-[#451B1E]/40 border-[#451B1E] text-[#F87171] hover:bg-[#451B1E]'
              }`}
            >
              🚨 Hanya Errors & Exceptions ({stats.errors})
            </button>
            <button
              onClick={() => {
                setSelectedLevel('warning');
                setSearchQuery('');
              }}
              className={`px-2.5 py-1 rounded text-[11px] border transition cursor-pointer flex-shrink-0 ${
                selectedLevel === 'warning'
                  ? 'bg-[#FACC15] text-black border-[#FACC15] font-bold'
                  : 'bg-[#3E3314]/40 border-[#3E3314] text-[#FACC15] hover:bg-[#3E3314]'
              }`}
            >
              ⚠️ Warnings & Retries
            </button>
            <button
              onClick={() => {
                setSelectedLevel('all');
                setSearchQuery('200');
              }}
              className="px-2.5 py-1 rounded text-[11px] bg-[#0F1117] border border-[#1F2229] text-[#4ADE80] hover:border-[#4ADE80] transition cursor-pointer flex-shrink-0"
            >
              💳 HTTP 200 / Success API
            </button>
            <button
              onClick={() => {
                setSelectedLevel('all');
                setSearchQuery('timeout');
              }}
              className="px-2.5 py-1 rounded text-[11px] bg-[#0F1117] border border-[#1F2229] text-[#BFC3C9] hover:border-[#4E80EE] transition cursor-pointer flex-shrink-0"
            >
              ⏱️ Timeouts
            </button>
          </div>

          {/* Direct CLI Copy Helper */}
          <div className="flex items-center justify-between bg-[#0F1117] px-3 py-2 rounded-lg border border-[#1F2229] text-xs font-mono text-[#8D9199]">
            <div className="flex items-center gap-2 truncate">
              <Terminal className="h-3.5 w-3.5 text-[#4ADE80] flex-shrink-0" />
              <span className="truncate">
                Live Terminal Command: <code className="text-[#4ADE80]">{activeServiceMeta.type === 'docker' ? `docker logs -f ${activeServiceMeta.name}` : `journalctl -u ${activeServiceMeta.journalUnit} -f`}</code>
              </span>
            </div>
            <button
              onClick={() => handleCopyLog(activeServiceMeta.type === 'docker' ? `docker logs -f ${activeServiceMeta.name}` : `journalctl -u ${activeServiceMeta.journalUnit} -f`, 'cli-log-cmd')}
              className="px-2 py-1 rounded hover:bg-[#161921] text-[#E0E2E7] transition flex items-center gap-1 cursor-pointer flex-shrink-0"
              title="Copy terminal command"
            >
              {copiedId === 'cli-log-cmd' ? <Check className="h-3.5 w-3.5 text-[#4ADE80]" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="text-[10px]">Copy CLI</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#0A0B0E] border border-[#1F2229] rounded-xl p-3 flex items-center justify-between text-xs font-mono text-[#8D9199]">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#4E80EE]" />
            <span>Mode Agregasi: Menampilkan seluruh stream log server ({logs.length} total logs)</span>
          </div>
          <span className="text-[11px] text-[#4E80EE]">Pilih salah satu service di atas untuk tracking terisolasi</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 HISTOGRAM TIMELINE (SCOPED TO SELECTED SERVICE)                         */}
      {/* ========================================================================= */}
      {showHistogram && (
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 shadow-xl space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F2229] pb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#E0E2E7] flex items-center gap-1.5 font-mono">
                <Layers className="h-4 w-4 text-[#4E80EE]" />
                Volume Timeline {selectedService !== 'all' ? `(${selectedService})` : '(Semua Service)'}
              </span>
              <span className="text-[10px] text-[#8D9199]">
                (Klik baris diagram untuk zoom ke timestamp tertentu)
              </span>
            </div>

            {/* Metric counters */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-[#8D9199]">
                Total: <strong className="text-[#E0E2E7]">{stats.total}</strong> logs
              </span>
              <span className="text-[#F87171]">
                Errors: <strong>{stats.errors}</strong> ({stats.errorRate}%)
              </span>
              <span className="text-[#FACC15]">
                Warnings: <strong>{stats.warnings}</strong>
              </span>
              <span className="text-[#4ADE80]">
                Success/Info: <strong>{stats.successes + stats.infos}</strong>
              </span>
            </div>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={histogramData} 
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    handleHistogramBarClick(e.activePayload[0].payload);
                  }
                }}
                className="cursor-pointer"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2229" vertical={false} />
                <XAxis 
                  dataKey="timeLabel" 
                  stroke="#545963" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#545963" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0A0B0E] border border-[#1F2229] p-2.5 rounded shadow-xl text-xs font-mono text-[#E0E2E7] space-y-1">
                          <div className="font-semibold text-[#4E80EE] pb-1 border-b border-[#1F2229]">
                            {label}
                          </div>
                          <div className="flex justify-between gap-4 text-[#F87171]">
                            <span>Errors:</span> <strong>{d.error}</strong>
                          </div>
                          <div className="flex justify-between gap-4 text-[#FACC15]">
                            <span>Warnings:</span> <strong>{d.warning}</strong>
                          </div>
                          <div className="flex justify-between gap-4 text-[#4ADE80]">
                            <span>Success/Info:</span> <strong>{d.success + d.info}</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="error" stackId="a" fill="#F87171" name="Error" radius={[0, 0, 0, 0]} />
                <Bar dataKey="warning" stackId="a" fill="#FACC15" name="Warning" radius={[0, 0, 0, 0]} />
                <Bar dataKey="success" stackId="a" fill="#4ADE80" name="Success" radius={[0, 0, 0, 0]} />
                <Bar dataKey="info" stackId="a" fill="#4E80EE" name="Info" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔍 LOGQL QUERY BAR & FILTER TOOLBAR                                      */}
      {/* ========================================================================= */}
      <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 shadow-xl space-y-3 font-mono">
        
        {/* Loki-style Query Header */}
        <div className="flex items-center gap-2 text-xs text-[#8D9199]">
          <Code className="h-4 w-4 text-[#4E80EE]" />
          <span>Loki LogQL Query Expression:</span>
          <code className="text-[#4E80EE] bg-[#0A0B0E] px-2 py-0.5 rounded border border-[#1F2229]">
            {selectedService !== 'all' ? `{service="${selectedService}"}` : '{app="qgrow-stack"}'} {searchQuery ? `|= "${searchQuery}"` : ''}
          </code>
        </div>

        {/* Search Input */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8D9199]" />
            <input
              id="log-search-query-input"
              type="text"
              placeholder='Cari isi pesan, IP, HTTP status, trace ID, atau query log (contoh: "QR-", "timeout", "BCA", "deadlock")...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-xs font-mono text-[#E0E2E7] placeholder:text-[#545963] focus:outline-none focus:border-[#4E80EE]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#8D9199] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Facet Filters: Severity, Day of Week, View Modes */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#1F2229] text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Severity Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8D9199] text-[11px]">Level:</span>
              <select
                id="log-filter-level-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-[#0A0B0E] border border-[#1F2229] rounded px-2 py-1 text-xs text-[#E0E2E7] font-mono outline-none"
              >
                <option value="all">Semua Level</option>
                <option value="error">ERROR</option>
                <option value="warning">WARNING</option>
                <option value="info">INFO</option>
                <option value="success">SUCCESS</option>
              </select>
            </div>

            {/* Day of Week Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#8D9199] text-[11px]">Hari:</span>
              <select
                id="log-filter-day-select"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="bg-[#0A0B0E] border border-[#1F2229] rounded px-2 py-1 text-xs text-[#E0E2E7] font-mono outline-none"
              >
                <option value="all">Semua Hari</option>
                <option value="Senin">Senin (Mon)</option>
                <option value="Selasa">Selasa (Tue)</option>
                <option value="Rabu">Rabu (Wed)</option>
                <option value="Kamis">Kamis (Thu)</option>
                <option value="Jumat">Jumat (Fri)</option>
                <option value="Sabtu">Sabtu (Sat)</option>
                <option value="Minggu">Minggu (Sun)</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(selectedLevel !== 'all' || selectedDay !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedLevel('all');
                  setSelectedDay('all');
                  setSearchQuery('');
                }}
                className="px-2 py-1 text-[11px] text-[#F87171] hover:underline"
              >
                Reset Filter Query
              </button>
            )}
          </div>

          {/* Right Toolbar: View mode toggles & Sorting */}
          <div className="flex items-center gap-2">
            
            {/* Sort direction */}
            <button
              id="log-sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0A0B0E] border border-[#1F2229] hover:bg-[#161921] rounded text-[#BFC3C9] text-xs transition cursor-pointer font-mono"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="h-3 w-3 text-[#4E80EE]" />
              <span>{sortOrder === 'desc' ? 'Terbaru Dahulu' : 'Terlama Dahulu'}</span>
            </button>

            {/* View Mode Buttons */}
            <div className="flex bg-[#0A0B0E] p-0.5 rounded border border-[#1F2229] text-xs">
              <button
                onClick={() => setViewMode('docker-cli')}
                className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 font-semibold ${
                  viewMode === 'docker-cli' ? 'bg-[#4E80EE] text-white shadow-sm ring-1 ring-[#4E80EE]' : 'text-[#8D9199] hover:text-[#E0E2E7]'
                }`}
                title="Interactive Docker Logs -f Live CLI Terminal"
              >
                <Terminal className="h-3.5 w-3.5 text-[#4ADE80]" />
                <span>docker logs -f</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'table' ? 'bg-[#4E80EE] text-white shadow-sm' : 'text-[#8D9199] hover:text-[#E0E2E7]'
                }`}
                title="Structured Table View"
              >
                <Layers className="h-3 w-3" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'raw' ? 'bg-[#4E80EE] text-white shadow-sm' : 'text-[#8D9199] hover:text-[#E0E2E7]'
                }`}
                title="Console Raw Stream View"
              >
                <FileText className="h-3 w-3" />
                <span className="hidden sm:inline">Raw Console</span>
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-2 py-1 rounded transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'json' ? 'bg-[#4E80EE] text-white shadow-sm' : 'text-[#8D9199] hover:text-[#E0E2E7]'
                }`}
                title="JSON Inspector"
              >
                <Code className="h-3 w-3" />
                <span className="hidden sm:inline">JSON</span>
              </button>
            </div>

            {/* Line wrap toggle */}
            <button
              onClick={() => setWrapLines(!wrapLines)}
              className={`p-1 rounded border text-xs cursor-pointer ${
                wrapLines ? 'bg-[#161921] border-[#30343D] text-[#4E80EE]' : 'bg-[#0A0B0E] border-[#1F2229] text-[#8D9199]'
              }`}
              title="Toggle Line Wrap"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📜 LOG STREAM LIST / TABLE VIEWER                                         */}
      {/* ========================================================================= */}
      <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl overflow-hidden shadow-2xl">
        
        {/* Results Count Header */}
        <div className="px-4 py-2.5 bg-[#0A0B0E] border-b border-[#1F2229] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#8D9199]">Menampilkan:</span>
            <span className="font-bold text-[#4E80EE]">
              {viewMode === 'docker-cli' ? `${cliLogs.length} baris stream` : `${filteredLogs.length} baris log`}
            </span>
            <span className="text-[#545963]">|</span>
            <span className="text-[#E0E2E7] font-semibold">
              {selectedService === 'all' ? 'Semua Service' : `Service: ${selectedService}`}
            </span>
            <span className="text-[#545963]">|</span>
            <span className="text-[#8D9199]">Rentang: {startDate} ({startDayName}) s/d {endDate} ({endDayName})</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#8D9199]">
            {viewMode === 'docker-cli' ? (
              <span className="text-[#4ADE80] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-ping"></span>
                Interactive CLI Follow Mode Active
              </span>
            ) : (
              <span>Klik baris untuk inspect JSON & trace details</span>
            )}
          </div>
        </div>

        {/* MODE 0: DOCKER CLI TERMINAL LIVE STREAM VIEW (docker logs -f) */}
        {viewMode === 'docker-cli' && (
          <div className="bg-[#07080B] font-mono text-xs flex flex-col">
            
            {/* Terminal Top Window Bar */}
            <div className="bg-[#0D0F14] px-3.5 py-2.5 border-b border-[#1F2229] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                {/* Window Dots */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                </div>

                {/* Interactive CLI Command Input Bar */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRunDockerCommand(commandInput);
                  }}
                  className="flex items-center gap-2 flex-1 min-w-[300px] max-w-3xl"
                >
                  <span className="text-[#4ADE80] font-bold text-xs select-none">$</span>
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    className="w-full bg-[#050608] px-3 py-1.5 text-xs text-[#E0E2E7] font-mono rounded border border-[#1F2229] focus:border-[#4E80EE] outline-none select-all transition shadow-inner"
                    placeholder="docker logs qgrow-product-container --since &quot;2026-09-02T06:48:00&quot; --until &quot;2026-09-02T06:48:59&quot;"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#4E80EE] hover:bg-[#3B6FD8] text-white text-xs font-semibold rounded font-mono transition cursor-pointer flex-shrink-0 flex items-center gap-1.5 shadow-sm"
                    title="Jalankan Perintah Docker Logs"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Run</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyLog(commandInput, 'docker-cmd')}
                    className="p-1.5 rounded bg-[#161921] hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] transition cursor-pointer flex-shrink-0 border border-[#1F2229]"
                    title="Copy Docker CLI Command"
                  >
                    {copiedId === 'docker-cmd' ? <Check className="h-3.5 w-3.5 text-[#4ADE80]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </form>

                {/* Terminal Utility Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setTerminalCleared(!terminalCleared);
                    }}
                    className="px-2.5 py-1.5 bg-[#161921] hover:bg-[#1F2229] border border-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] rounded text-xs transition cursor-pointer font-mono"
                    title="Clear Terminal Buffer"
                  >
                    {terminalCleared ? 'Restore Output' : 'Clear Screen'}
                  </button>

                  <button
                    onClick={() => setCliAutoScroll(!cliAutoScroll)}
                    className={`px-2.5 py-1.5 border rounded text-xs font-mono transition cursor-pointer flex items-center gap-1 ${
                      cliAutoScroll ? 'bg-[#122A1E] text-[#4ADE80] border-[#1B3F2D]' : 'bg-[#161921] text-[#8D9199] border-[#1F2229]'
                    }`}
                    title="Toggle Auto-Scroll to bottom"
                  >
                    <span>Auto-scroll: {cliAutoScroll ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Quick CLI Command Templates (1-Click Exact Query) */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#8D9199] flex-wrap pt-0.5 border-t border-[#1F2229]/40">
                <span className="text-[10px] font-semibold text-[#8D9199] uppercase tracking-wider">Perintah Cepat:</span>
                <button
                  type="button"
                  onClick={() => {
                    const cmd = `docker logs qgrow-product-container --since "2026-09-02T06:48:00" --until "2026-09-02T06:48:59"`;
                    setCommandInput(cmd);
                    handleRunDockerCommand(cmd);
                  }}
                  className="px-2 py-0.5 rounded bg-[#161921] hover:bg-[#1F2433] hover:border-[#4E80EE] border border-[#30343D] text-[#60A5FA] font-mono text-[11px] transition cursor-pointer flex items-center gap-1"
                >
                  <span>docker logs qgrow-product-container --since "2026-09-02T06:48:00" --until "2026-09-02T06:48:59"</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cmd = `docker logs qgrow-qris-container --since "2026-09-02T06:48:00" --until "2026-09-02T06:48:59"`;
                    setCommandInput(cmd);
                    handleRunDockerCommand(cmd);
                  }}
                  className="px-2 py-0.5 rounded bg-[#161921] hover:bg-[#1F2433] hover:border-[#4E80EE] border border-[#1F2229] text-[#93C5FD] font-mono text-[11px] transition cursor-pointer"
                >
                  <span>qgrow-qris (06:48:00 - 06:48:59)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cmd = `docker logs ${selectedService} -f -t --tail 100`;
                    setCommandInput(cmd);
                    handleRunDockerCommand(cmd);
                  }}
                  className="px-2 py-0.5 rounded bg-[#161921] hover:bg-[#1F2229] border border-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] font-mono text-[11px] transition cursor-pointer"
                >
                  <span>-f -t --tail 100</span>
                </button>
              </div>
            </div>

            {/* Docker CLI Interactive Flag Controls */}
            <div className="bg-[#0A0B0E] p-3 border-b border-[#1F2229] space-y-2.5">
              
              {/* Service Quick-Selector (1-Click Switch across Containers) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-[11px] text-[#8D9199] flex-shrink-0 flex items-center gap-1 font-mono">
                  <Boxes className="h-3.5 w-3.5 text-[#4E80EE]" />
                  Container Target:
                </span>
                {[
                  { id: 'qgrow-product-container', label: 'qgrow-product-container' },
                  { id: 'qgrow-qris-container', label: 'qgrow-qris-container' },
                  { id: 'qgrow-ewallet-container', label: 'qgrow-ewallet-container' },
                  { id: 'qgrow-payment-worker-container', label: 'qgrow-payment-worker-container' },
                  { id: 'qgrow-branch-container', label: 'qgrow-branch-container' },
                  { id: 'container-redis', label: 'container-redis' },
                  { id: 'nginx', label: 'nginx' },
                ].map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition flex-shrink-0 border cursor-pointer ${
                      selectedService === svc.id
                        ? 'bg-[#4E80EE] border-[#4E80EE] text-white font-bold shadow-sm'
                        : 'bg-[#161921] border-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] hover:border-[#30343D]'
                    }`}
                  >
                    <span>{svc.label}</span>
                  </button>
                ))}

                {/* Dropdown for other services */}
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="px-2 py-1 bg-[#161921] border border-[#1F2229] rounded text-xs text-[#60A5FA] font-mono outline-none flex-shrink-0"
                >
                  <optgroup label="Docker Containers (qgrow.id1)">
                    {LINUX_SERVICES_META.filter(s => s.type === 'docker').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="System Services (systemd)">
                    {LINUX_SERVICES_META.filter(s => s.type === 'systemd').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </optgroup>
                  <option value="all">Semua Service Combined (Aggregated)</option>
                </select>
              </div>

              {/* Flag Options: --since, -f, --tail, -t, grep */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1F2229]/60 text-xs">
                
                {/* Time filter --since presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[#8D9199] text-[11px] font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#4E80EE]" />
                    Time Filter (--since):
                  </span>
                  {[
                    { id: 'last-5m', label: '5m' },
                    { id: 'last-15m', label: '15m' },
                    { id: 'last-30m', label: '30m' },
                    { id: 'last-1h', label: '1h' },
                    { id: 'last-6h', label: '6h' },
                    { id: 'last-24h', label: '24h' },
                    { id: 'last-7d', label: '7d' },
                    { id: 'all', label: 'Semua / All' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyPreset(p.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition border cursor-pointer ${
                        timePreset === p.id
                          ? 'bg-[#4E80EE] text-white font-bold border-[#4E80EE]'
                          : 'bg-[#161921] border-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setStartDate('2026-09-02');
                      setStartHour('06');
                      setStartMinute('48');
                      setStartSecond('00');
                      setEndDate('2026-09-02');
                      setEndHour('06');
                      setEndMinute('48');
                      setEndSecond('59');
                      setTimePreset('custom');
                      setIsLiveTail(false);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition border cursor-pointer ${
                      timePreset === 'custom' && startHour === '06' && startMinute === '48'
                        ? 'bg-[#4E80EE] text-white font-bold border-[#4E80EE]'
                        : 'bg-[#161921] border-[#30343D] text-[#60A5FA] hover:text-white'
                    }`}
                    title="2026-09-02T06:48:00 s/d 06:48:59"
                  >
                    06:48 (1m)
                  </button>
                  <button
                    onClick={() => setIsCustomRangeOpen(!isCustomRangeOpen)}
                    className={`px-2 py-0.5 rounded text-[11px] transition border cursor-pointer ${
                      timePreset === 'custom' || isCustomRangeOpen
                        ? 'bg-[#161921] border-[#4E80EE] text-[#4E80EE] font-semibold'
                        : 'bg-[#161921] border-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7]'
                    }`}
                  >
                    Custom Date...
                  </button>
                </div>

                {/* Toggles: -f, --tail, -t, grep */}
                <div className="flex flex-wrap items-center gap-2.5">
                  
                  {/* Follow Mode (-f) Toggle */}
                  <button
                    onClick={() => setIsLiveTail(!isLiveTail)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                      isLiveTail
                        ? 'bg-[#122A1E] text-[#4ADE80] border-[#1B3F2D] shadow-sm'
                        : 'bg-[#161921] text-[#8D9199] border-[#1F2229] hover:text-[#E0E2E7]'
                    }`}
                    title="Toggle follow live streaming flag (-f)"
                  >
                    {isLiveTail ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    <span>-f (Follow: {isLiveTail ? 'Live' : 'Paused'})</span>
                  </button>

                  {/* Tail limit (--tail) */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#8D9199]">--tail:</span>
                    <select
                      value={cliTailLimit}
                      onChange={(e) => setCliTailLimit(Number(e.target.value))}
                      className="bg-[#161921] border border-[#1F2229] rounded px-2 py-0.5 text-xs text-[#E0E2E7] font-mono outline-none"
                    >
                      <option value={50}>50 lines</option>
                      <option value={100}>100 lines</option>
                      <option value={250}>250 lines</option>
                      <option value={500}>500 lines</option>
                      <option value={0}>All logs</option>
                    </select>
                  </div>

                  {/* Timestamps toggle (-t) */}
                  <label className="flex items-center gap-1.5 text-[11px] text-[#BFC3C9] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showTimestampsInCLI}
                      onChange={(e) => setShowTimestampsInCLI(e.target.checked)}
                      className="rounded border-[#1F2229] bg-[#161921] text-[#4E80EE] focus:ring-0"
                    />
                    <span>-t (Timestamps)</span>
                  </label>

                  {/* CLI Grep Filter */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder='| grep "..."'
                      value={cliGrepTerm}
                      onChange={(e) => setCliGrepTerm(e.target.value)}
                      className="pl-2 pr-5 py-0.5 bg-[#161921] border border-[#1F2229] rounded text-xs font-mono text-[#E0E2E7] placeholder:text-[#545963] focus:border-[#4E80EE] outline-none w-28 focus:w-44 transition-all"
                    />
                    {cliGrepTerm && (
                      <button
                        onClick={() => setCliGrepTerm('')}
                        className="absolute right-1.5 top-1 text-[#8D9199] hover:text-white text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* Terminal Body Screen Output */}
            <div className="p-4 bg-[#050608] min-h-[420px] max-h-[640px] overflow-y-auto no-scrollbar font-mono text-xs space-y-1 select-all border-b border-[#1F2229]">
              
              {/* Terminal startup info */}
              <div className="text-[#545963] pb-2 mb-2 border-b border-[#1F2229]/40 space-y-0.5 select-none">
                <div>[Dewacloud Node 51917 - Linux 5.15.0-x86_64 - Docker engine 24.0.7]</div>
                <div>Connected to socket: unix:///var/run/docker.sock | Target container: <span className="text-[#4E80EE]">{selectedService}</span> (ID: {activeServiceMeta?.containerId || '5f8d4b21eca1'})</div>
                <div className="text-[#4ADE80]">Streaming stdout & stderr with follow flag (-f)...</div>
              </div>

              {cliLogs.length === 0 ? (
                <div className="py-10 text-center text-[#8D9199] space-y-3 bg-[#0D0F14]/70 rounded-lg border border-[#1F2229] my-4 p-5 max-w-lg mx-auto">
                  <AlertTriangle className="h-6 w-6 text-[#FACC15] mx-auto opacity-90" />
                  <div>
                    <p className="text-sm font-semibold text-[#E0E2E7]">Tidak ada entri log pada filter waktu aktif</p>
                    <p className="text-xs text-[#8D9199] mt-1">
                      Pilih filter rentang waktu yang lebih luas atau tampilkan seluruh log container.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => handleApplyPreset('all')}
                      className="px-3.5 py-1.5 bg-[#4E80EE] hover:bg-[#3B6FD8] text-white rounded text-xs font-mono font-semibold transition cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Tampilkan Semua Log ({selectedService})</span>
                    </button>
                  </div>
                </div>
              ) : (
                cliLogs.map((log) => {
                  const levelColor = 
                    log.level === 'error' ? 'text-[#F87171] font-bold' :
                    log.level === 'warning' ? 'text-[#FACC15] font-bold' :
                    log.level === 'success' ? 'text-[#4ADE80] font-bold' :
                    'text-[#60A5FA]';

                  return (
                    <div 
                      key={log.id} 
                      className="hover:bg-[#161921]/80 px-1.5 py-0.5 rounded transition flex items-start gap-2 group cursor-pointer"
                      onClick={() => setExpandedRowId(expandedRowId === log.id ? null : log.id)}
                    >
                      {/* Optional timestamp (-t) */}
                      {showTimestampsInCLI && (
                        <span className="text-[#545963] select-none text-[11px] whitespace-nowrap">
                          {log.timestamp}
                        </span>
                      )}

                      {/* Day */}
                      <span className="text-[#8D9199] select-none text-[11px] whitespace-nowrap">
                        [{log.dayOfWeek || 'Rabu'}]
                      </span>

                      {/* Service */}
                      <span className="text-[#38BDF8] select-none text-[11px] whitespace-nowrap">
                        [{log.service}]
                      </span>

                      {/* Level */}
                      <span className={`select-none text-[11px] whitespace-nowrap ${levelColor}`}>
                        [{log.level.toUpperCase()}]
                      </span>

                      {/* Message */}
                      <span className={`text-[#E0E2E7] flex-1 ${wrapLines ? 'break-words' : 'whitespace-pre'}`}>
                        {log.message}
                      </span>

                      {/* Latency badge */}
                      {log.durationMs && (
                        <span className="text-[#4ADE80] text-[10px] select-none whitespace-nowrap opacity-80 group-hover:opacity-100">
                          {log.durationMs}ms
                        </span>
                      )}

                      {/* Copy action on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLog(log.raw || log.message, log.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-[#8D9199] hover:text-white transition"
                        title="Copy log line"
                      >
                        {copiedId === log.id ? <Check className="h-3 w-3 text-[#4ADE80]" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  );
                })
              )}

              {/* Streaming Blinking Cursor */}
              {isLiveTail && (
                <div className="flex items-center gap-2 text-[#4ADE80] text-xs pt-1">
                  <span className="w-2 h-4 bg-[#4ADE80] animate-pulse inline-block" />
                  <span className="text-[11px] text-[#8D9199]">waiting for incoming container events...</span>
                </div>
              )}

              <div ref={cliTerminalEndRef} />
            </div>

            {/* Terminal Status Footer */}
            <div className="bg-[#0A0B0E] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8D9199]">
              <div className="flex items-center gap-3">
                <span>Buffer: <strong className="text-[#E0E2E7]">{cliLogs.length}</strong> lines</span>
                <span>•</span>
                <span>Host: <code className="text-[#4E80EE]">gate.infra.dewacloud.com</code></span>
                <span>•</span>
                <span>PID: <code className="text-[#4ADE80]">{activeServiceMeta?.pid || 1000}</code></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportLogs('log')}
                  className="hover:text-white transition cursor-pointer flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  <span>Export Stream Buffer</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* MODE 1: STRUCTURED TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto max-h-[620px] overflow-y-auto no-scrollbar font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-[#8D9199] space-y-2">
                <AlertTriangle className="h-8 w-8 text-[#FACC15] mx-auto opacity-70" />
                <p className="text-sm font-medium text-[#E0E2E7]">Tidak ada log untuk service atau filter ini</p>
                <p className="text-xs">Coba ubah filter level atau pilih service lain di daftar atas.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-[#0A0B0E] text-[#8D9199] uppercase tracking-wider text-[10px] sticky top-0 z-10 border-b border-[#1F2229]">
                  <tr>
                    <th className="py-2.5 px-3 w-8"></th>
                    <th className="py-2.5 px-3 w-44">Waktu Presisi</th>
                    <th className="py-2.5 px-3 w-48">Microservice / Daemon</th>
                    <th className="py-2.5 px-3 w-20">Level</th>
                    <th className="py-2.5 px-3">Pesan Log / Execution Event</th>
                    <th className="py-2.5 px-3 w-20 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2229]/60">
                  {filteredLogs.map((log, idx) => {
                    const isExpanded = expandedRowId === log.id;
                    const levelBg = 
                      log.level === 'error' ? 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/30' :
                      log.level === 'warning' ? 'bg-[#FACC15]/10 text-[#FACC15] border-[#FACC15]/30' :
                      log.level === 'success' ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30' :
                      'bg-[#4E80EE]/10 text-[#4E80EE] border-[#4E80EE]/30';

                    const borderLeftColor = 
                      log.level === 'error' ? 'border-l-4 border-l-[#F87171]' :
                      log.level === 'warning' ? 'border-l-4 border-l-[#FACC15]' :
                      log.level === 'success' ? 'border-l-4 border-l-[#4ADE80]' :
                      'border-l-4 border-l-[#4E80EE]';

                    return (
                      <React.Fragment key={log.id}>
                        <tr 
                          onClick={() => setExpandedRowId(isExpanded ? null : log.id)}
                          className={`hover:bg-[#161921]/80 transition cursor-pointer ${borderLeftColor} ${
                            isExpanded ? 'bg-[#161921]/90' : idx % 2 === 0 ? 'bg-[#0F1117]' : 'bg-[#0A0B0E]/40'
                          }`}
                        >
                          <td className="py-2 px-2 text-[#545963]">
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </td>
                          <td className="py-2 px-3 text-[#BFC3C9] whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-[#E0E2E7] font-semibold">{log.timestamp}</span>
                              <span className="text-[10px] text-[#8D9199]">Hari {log.dayOfWeek || 'Rabu'}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-[#161921] border border-[#1F2229] text-[#60A5FA] font-semibold truncate max-w-[180px] inline-block">
                              {log.service}
                            </span>
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${levelBg}`}>
                              {log.level}
                            </span>
                          </td>
                          <td className={`py-2 px-3 text-[#E0E2E7] ${wrapLines ? 'break-words' : 'truncate max-w-md'}`}>
                            <span>{log.message}</span>
                            {log.durationMs && (
                              <span className="ml-2 text-[10px] text-[#4ADE80] font-mono">
                                ({log.durationMs}ms)
                              </span>
                            )}
                            {log.ip && (
                              <span className="ml-2 text-[#8D9199] text-[10px]">
                                IP: <code className="text-[#4E80EE]">{log.ip}</code>
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLog(log.raw || log.message, log.id);
                              }}
                              className="p-1 rounded hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] transition cursor-pointer"
                              title="Copy Log Line"
                            >
                              {copiedId === log.id ? <Check className="h-3.5 w-3.5 text-[#4ADE80]" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {/* EXPANDED ROW DETAILS */}
                        {isExpanded && (
                          <tr className="bg-[#0A0B0E] border-b border-[#1F2229]">
                            <td colSpan={6} className="p-4 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1F2229]">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-[#E0E2E7]">Service Payload & Tracing Metadata</span>
                                  <span className="text-[10px] text-[#8D9199] font-mono">ID: {log.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {onAskAI && log.level === 'error' && (
                                    <button
                                      onClick={() => onAskAI(`Tolong diagnosa error server log QGrow microservice berikut: "${log.message}" pada service ${log.service} waktu ${log.timestamp} (${log.dayOfWeek}). Bagaimana penjelasannya dan apa langkah penanganannya?`)}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#4E80EE]/20 hover:bg-[#4E80EE]/30 border border-[#4E80EE]/40 text-xs font-semibold text-[#4E80EE] transition cursor-pointer"
                                    >
                                      <Sparkles className="h-3.5 w-3.5" />
                                      <span>Diagnosa via AI</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleCopyLog(JSON.stringify(log, null, 2), log.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#161921] hover:bg-[#1F2229] text-xs text-[#E0E2E7] border border-[#1F2229] cursor-pointer"
                                  >
                                    <Copy className="h-3 w-3" />
                                    <span>Copy JSON</span>
                                  </button>
                                </div>
                              </div>

                              {/* Key-Value Tag Cloud */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                                <div className="p-2 rounded bg-[#0F1117] border border-[#1F2229]">
                                  <span className="text-[10px] text-[#8D9199] block">Timestamp</span>
                                  <span className="text-[#E0E2E7] font-semibold">{log.timestamp}</span>
                                </div>
                                <div className="p-2 rounded bg-[#0F1117] border border-[#1F2229]">
                                  <span className="text-[10px] text-[#8D9199] block">Hari dalam Minggu</span>
                                  <span className="text-[#4E80EE] font-semibold">{log.dayOfWeek || 'Rabu'}</span>
                                </div>
                                <div className="p-2 rounded bg-[#0F1117] border border-[#1F2229]">
                                  <span className="text-[10px] text-[#8D9199] block">Service Target</span>
                                  <span className="text-[#4ADE80] font-semibold">{log.service}</span>
                                </div>
                                <div className="p-2 rounded bg-[#0F1117] border border-[#1F2229]">
                                  <span className="text-[10px] text-[#8D9199] block">Trace ID</span>
                                  <span className="text-[#FACC15] font-semibold">{log.traceId || 'tr-auto'}</span>
                                </div>
                                {log.ip && (
                                  <div className="p-2 rounded bg-[#0F1117] border border-[#1F2229]">
                                    <span className="text-[10px] text-[#8D9199] block">Client / Peer IP</span>
                                    <span className="text-[#E0E2E7] font-semibold">{log.ip}</span>
                                  </div>
                                )}
                                {log.durationMs && (
                                  <div className="p-2 rounded bg-[#0F1117] border border-[#1F2229]">
                                    <span className="text-[10px] text-[#8D9199] block">Duration / Latency</span>
                                    <span className="text-[#4ADE80] font-semibold">{log.durationMs} ms</span>
                                  </div>
                                )}
                              </div>

                              {/* Raw message block */}
                              <div>
                                <span className="text-[10px] text-[#8D9199] block mb-1">Raw Output Stream Line:</span>
                                <div className="p-2.5 rounded bg-[#0F1117] border border-[#1F2229] text-[#E0E2E7] select-all whitespace-pre-wrap">
                                  {log.raw || `${log.timestamp} [${log.dayOfWeek}] [${log.service}] ${log.level.toUpperCase()}: ${log.message}`}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div ref={logStreamEndRef} />
          </div>
        )}

        {/* MODE 2: RAW CONSOLE STREAM VIEW */}
        {viewMode === 'raw' && (
          <div className="p-4 bg-[#0A0B0E] font-mono text-xs max-h-[620px] overflow-y-auto space-y-1 select-all">
            {filteredLogs.map((log) => {
              const levelColor = 
                log.level === 'error' ? 'text-[#F87171]' :
                log.level === 'warning' ? 'text-[#FACC15]' :
                log.level === 'success' ? 'text-[#4ADE80]' :
                'text-[#4E80EE]';

              return (
                <div key={log.id} className="hover:bg-[#161921]/60 px-2 py-0.5 rounded flex items-start gap-2">
                  <span className="text-[#545963] select-none text-[11px]">{log.timestamp}</span>
                  <span className="text-[#8D9199] select-none text-[11px]">[{log.dayOfWeek || 'Rabu'}]</span>
                  <span className="text-[#60A5FA] select-none text-[11px]">[{log.service}]</span>
                  <span className={`font-bold select-none text-[11px] ${levelColor}`}>[{log.level.toUpperCase()}]</span>
                  <span className={`text-[#E0E2E7] flex-1 ${wrapLines ? 'break-words' : 'whitespace-pre'}`}>
                    {log.message}
                  </span>
                </div>
              );
            })}
            <div ref={logStreamEndRef} />
          </div>
        )}

        {/* MODE 3: JSON FORMAT VIEW */}
        {viewMode === 'json' && (
          <div className="p-4 bg-[#0A0B0E] font-mono text-xs max-h-[620px] overflow-y-auto">
            <pre className="text-[#BFC3C9] whitespace-pre-wrap">
              {JSON.stringify(filteredLogs, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
