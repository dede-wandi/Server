import React, { useState, useEffect, useCallback } from 'react';
import { ServerNode, MetricPoint, SystemProcess, SystemService, RemoteFile, LogEntry, FirewallRule, SSHKeyItem, DockerContainer } from './types';
import { 
  DEFAULT_NODE, 
  INITIAL_SERVICES, 
  INITIAL_PROCESSES, 
  INITIAL_FILES, 
  INITIAL_LOGS, 
  INITIAL_FIREWALL_RULES, 
  INITIAL_SSH_KEYS,
  INITIAL_DOCKER_CONTAINERS
} from './data/initialData';
import { Header } from './components/Header';
import { ConnectionCard } from './components/ConnectionCard';
import { MetricsOverview } from './components/MetricsOverview';
import { WebTerminal } from './components/WebTerminal';
import { ServiceProcessManager } from './components/ServiceProcessManager';
import { FileManager } from './components/FileManager';
import { SecurityFirewall } from './components/SecurityFirewall';
import { GrafanaLogExplorer } from './components/GrafanaLogExplorer';
import { DevOpsAIAssistant } from './components/DevOpsAIAssistant';
import { NodeSettingsModal } from './components/NodeSettingsModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [node, setNode] = useState<ServerNode>(() => {
    const saved = localStorage.getItem('dewacloud_current_node');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nodeId === '79773') {
          return DEFAULT_NODE;
        }
        return parsed;
      } catch (e) {
        return DEFAULT_NODE;
      }
    }
    return DEFAULT_NODE;
  });

  const [services, setServices] = useState<SystemService[]>(() => {
    const saved = localStorage.getItem('dewacloud_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [dockerContainers, setDockerContainers] = useState<DockerContainer[]>(() => {
    const saved = localStorage.getItem('dewacloud_docker_containers');
    return saved ? JSON.parse(saved) : INITIAL_DOCKER_CONTAINERS;
  });

  const [processes, setProcesses] = useState<SystemProcess[]>(() => {
    const saved = localStorage.getItem('dewacloud_processes');
    return saved ? JSON.parse(saved) : INITIAL_PROCESSES;
  });

  const [files, setFiles] = useState<RemoteFile[]>(() => {
    const saved = localStorage.getItem('dewacloud_files');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 15) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_FILES;
  });

  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>(INITIAL_FIREWALL_RULES);
  const [sshKeys, setSSHKeys] = useState<SSHKeyItem[]>(INITIAL_SSH_KEYS);

  const [isLiveUpdating, setIsLiveUpdating] = useState<boolean>(true);
  const [refreshRateSec, setRefreshRateSec] = useState<number>(3);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(1234500);
  const [pingLatency, setPingLatency] = useState<number | null>(16);
  const [isCheckingPing, setIsCheckingPing] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');

  // Generate initial metric timeline history (past 15 data points)
  const [metricsHistory, setMetricsHistory] = useState<MetricPoint[]>(() => {
    const points: MetricPoint[] = [];
    const now = Date.now();
    for (let i = 15; i >= 0; i--) {
      const t = new Date(now - i * 5000);
      const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;
      const baseCpu = 22 + Math.sin(i * 0.6) * 12 + (Math.random() * 8);
      const baseMem = 42 + Math.cos(i * 0.4) * 4 + (Math.random() * 2);
      points.push({
        time: timeStr,
        cpu: Math.min(100, Math.max(5, baseCpu)),
        cpuCores: [
          Math.min(100, Math.max(4, baseCpu + (Math.random() * 10 - 5))),
          Math.min(100, Math.max(4, baseCpu + (Math.random() * 8 - 4))),
          Math.min(100, Math.max(4, baseCpu + (Math.random() * 12 - 6))),
          Math.min(100, Math.max(4, baseCpu + (Math.random() * 6 - 3))),
        ],
        memory: baseMem,
        memUsedGb: (baseMem / 100) * 8,
        disk: 35.6,
        networkInMb: 2.8 + (Math.random() * 3.4),
        networkOutMb: 8.4 + (Math.random() * 6.2),
        loadAvg: [0.42, 0.58, 0.65],
        iops: Math.floor(1100 + Math.random() * 600),
      });
    }
    return points;
  });

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Live Metric Telemetry Engine
  useEffect(() => {
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      setUptimeSeconds(prev => prev + refreshRateSec);

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      setMetricsHistory(prev => {
        const last = prev[prev.length - 1];
        const cpuNoise = (Math.random() - 0.48) * 8;
        const newCpu = Math.min(95, Math.max(8, (last ? last.cpu : 25) + cpuNoise));
        const memNoise = (Math.random() - 0.5) * 1.5;
        const newMem = Math.min(90, Math.max(35, (last ? last.memory : 42) + memNoise));
        const newNetIn = Math.max(0.4, 2.5 + (Math.random() * 4.5));
        const newNetOut = Math.max(1.1, 7.2 + (Math.random() * 8.0));

        const newPoint: MetricPoint = {
          time: timeStr,
          cpu: newCpu,
          cpuCores: [
            Math.min(100, Math.max(3, newCpu + (Math.random() * 12 - 6))),
            Math.min(100, Math.max(3, newCpu + (Math.random() * 10 - 5))),
            Math.min(100, Math.max(3, newCpu + (Math.random() * 8 - 4))),
            Math.min(100, Math.max(3, newCpu + (Math.random() * 14 - 7))),
          ],
          memory: newMem,
          memUsedGb: (newMem / 100) * node.specs.ramTotalGb,
          disk: 35.6 + (Math.random() * 0.1),
          networkInMb: newNetIn,
          networkOutMb: newNetOut,
          loadAvg: [
            Math.max(0.1, 0.40 + (newCpu / 80)),
            0.55,
            0.62,
          ],
          iops: Math.floor(1250 + Math.random() * 700),
        };

        const updated = [...prev.slice(1), newPoint];
        return updated;
      });
    }, refreshRateSec * 1000);

    return () => clearInterval(interval);
  }, [isLiveUpdating, refreshRateSec, node.specs.ramTotalGb]);

  // Ping Latency Checker
  const handleCheckPing = useCallback(async () => {
    setIsCheckingPing(true);
    try {
      const res = await fetch('/api/node/ping-check', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPingLatency(data.latencyMs);
        showToast(`Gateway ${node.host}:${node.port} terhubung (${data.latencyMs} ms)`, 'success');
      }
    } catch (e) {
      // Offline fallback calculation
      const fakeLatency = Math.floor(Math.random() * 6) + 14;
      setPingLatency(fakeLatency);
      showToast(`Gateway ${node.host}:${node.port} terhubung (~${fakeLatency} ms)`, 'success');
    } finally {
      setIsCheckingPing(false);
    }
  }, [node.host, node.port]);

  // Service Management Handlers
  const handleRestartService = (serviceId: string) => {
    setServices(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, status: 'reloading' } : s))
    );
    showToast(`Restarting service ${serviceId}...`, 'info');

    setTimeout(() => {
      setServices(prev =>
        prev.map(s => (s.id === serviceId ? { ...s, status: 'active', uptime: '10s' } : s))
      );
      showToast(`Service restarted successfully!`, 'success');
    }, 1200);
  };

  const handleToggleService = (serviceId: string) => {
    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          const nextStatus = s.status === 'active' ? 'inactive' : 'active';
          showToast(`Service ${s.name} ${nextStatus === 'active' ? 'started' : 'stopped'}.`, 'info');
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  // Docker Container Handlers
  const handleRestartContainer = (containerId: string) => {
    setDockerContainers(prev =>
      prev.map(c => (c.id === containerId ? { ...c, status: 'Restarting...', state: 'restarting' } : c))
    );
    showToast(`Docker restarting container...`, 'info');
    setTimeout(() => {
      setDockerContainers(prev =>
        prev.map(c => (c.id === containerId ? { ...c, status: 'Up 5 seconds', state: 'running' } : c))
      );
      showToast(`Container restarted successfully!`, 'success');
    }, 1200);
  };

  const handleToggleContainer = (containerId: string) => {
    setDockerContainers(prev =>
      prev.map(c => {
        if (c.id === containerId) {
          const nextState = c.state === 'running' ? 'exited' : 'running';
          const nextStatus = nextState === 'running' ? 'Up 10 seconds' : 'Exited (0) Just now';
          showToast(`Container ${c.name} ${nextState === 'running' ? 'started' : 'stopped'}.`, 'info');
          return { ...c, state: nextState, status: nextStatus };
        }
        return c;
      })
    );
  };

  // Process Kill Handler
  const handleKillProcess = (pid: number) => {
    setProcesses(prev => prev.filter(p => p.pid !== pid));
    showToast(`Process PID ${pid} terminated via SIGKILL.`, 'success');
  };

  // File Management Handlers
  const handleSaveFile = (fileId: string, newContent: string) => {
    setFiles(prev =>
      prev.map(f =>
        f.id === fileId
          ? {
              ...f,
              content: newContent,
              size: newContent.length,
              sizeFormatted: `${(newContent.length / 1024).toFixed(1)} KB`,
              modified: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : f
      )
    );
    showToast(`File saved to remote SFTP filesystem!`, 'success');
  };

  const handleCreateFile = (name: string, type: 'file' | 'directory', currentDir: string) => {
    const fullPath = currentDir === '/' ? `/${name}` : `${currentDir}/${name}`;
    const newFile: RemoteFile = {
      id: `f-${Date.now()}`,
      name,
      path: fullPath,
      type,
      size: type === 'directory' ? 4096 : 0,
      sizeFormatted: type === 'directory' ? '4.0 KB' : '0 B',
      permissions: type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--',
      owner: node.username,
      group: node.username,
      modified: new Date().toISOString().replace('T', ' ').substring(0, 16),
      content: type === 'file' ? '# New file\n' : undefined,
    };
    setFiles(prev => [...prev, newFile]);
    showToast(`Created ${type} ${name}`, 'success');
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    showToast(`Item removed from SFTP path.`, 'info');
  };

  // Firewall Handlers
  const handleToggleRule = (ruleId: string) => {
    setFirewallRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r))
    );
    showToast(`Firewall rule updated.`, 'info');
  };

  const handleAddRule = (rule: Omit<FirewallRule, 'id' | 'created'>) => {
    const newRule: FirewallRule = {
      ...rule,
      id: `fw-${Date.now()}`,
      created: new Date().toISOString().substring(0, 10),
    };
    setFirewallRules(prev => [...prev, newRule]);
    showToast(`Aturan UFW untuk port ${rule.port} ditambahkan.`, 'success');
  };

  const handleDeleteRule = (ruleId: string) => {
    setFirewallRules(prev => prev.filter(r => r.id !== ruleId));
    showToast(`Firewall rule deleted.`, 'info');
  };

  // SSH Key Handlers
  const handleAddSSHKey = (key: Omit<SSHKeyItem, 'id' | 'created' | 'lastUsed'>) => {
    const newKey: SSHKeyItem = {
      ...key,
      id: `key-${Date.now()}`,
      created: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lastUsed: 'Not used yet',
    };
    setSSHKeys(prev => [newKey, ...prev]);
    showToast(`SSH Key ${key.name} berhasil dibuat & disimpan ke authorized_keys!`, 'success');
  };

  const handleDeleteSSHKey = (keyId: string) => {
    setSSHKeys(prev => prev.filter(k => k.id !== keyId));
    showToast(`SSH Key dihapus dari server.`, 'info');
  };

  const handleUpdateNode = (updated: ServerNode) => {
    setNode(updated);
    localStorage.setItem('dewacloud_current_node', JSON.stringify(updated));
    showToast(`Konfigurasi Node ${updated.nodeId} disimpan.`, 'success');
  };

  const handleResetDefaults = () => {
    setNode(DEFAULT_NODE);
    localStorage.removeItem('dewacloud_current_node');
    showToast(`Reset ke pengaturan default Node 51917.`, 'info');
  };

  const currentMetrics = metricsHistory[metricsHistory.length - 1] || metricsHistory[0];

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-[#E0E2E7] flex flex-col font-sans selection:bg-[#4E80EE]/30 selection:text-white">
      
      {/* Top Header & Tab Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentNode={node}
        isLiveUpdating={isLiveUpdating}
        setIsLiveUpdating={setIsLiveUpdating}
        refreshRateSec={refreshRateSec}
        setRefreshRateSec={setRefreshRateSec}
        pingLatency={pingLatency}
        isCheckingPing={isCheckingPing}
        onCheckPing={handleCheckPing}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Connection Details Card (Always visible or compact) */}
        <ConnectionCard
          node={node}
          onOpenTerminal={() => setActiveTab('terminal')}
          onOpenSFTP={() => setActiveTab('files')}
          onPingCheck={handleCheckPing}
          isCheckingPing={isCheckingPing}
          pingLatency={pingLatency}
        />

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <MetricsOverview
            node={node}
            history={metricsHistory}
            currentMetrics={currentMetrics}
            uptimeSeconds={uptimeSeconds}
          />
        )}

        {activeTab === 'logs' && (
          <GrafanaLogExplorer
            node={node}
            logs={logs}
            onAskAI={(prompt) => {
              setAiPrompt(prompt);
              setActiveTab('ai-diagnostics');
            }}
            onAddLog={(newLog) => {
              setLogs(prev => [newLog, ...prev]);
            }}
          />
        )}

        {activeTab === 'terminal' && (
          <WebTerminal node={node} />
        )}

        {activeTab === 'services' && (
          <ServiceProcessManager
            services={services}
            processes={processes}
            dockerContainers={dockerContainers}
            onRestartService={handleRestartService}
            onToggleService={handleToggleService}
            onKillProcess={handleKillProcess}
            onRestartContainer={handleRestartContainer}
            onToggleContainer={handleToggleContainer}
          />
        )}

        {activeTab === 'files' && (
          <FileManager
            node={node}
            files={files}
            onSaveFile={handleSaveFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
          />
        )}

        {activeTab === 'security' && (
          <SecurityFirewall
            node={node}
            rules={firewallRules}
            sshKeys={sshKeys}
            logs={logs}
            onToggleRule={handleToggleRule}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
            onAddSSHKey={handleAddSSHKey}
            onDeleteSSHKey={handleDeleteSSHKey}
          />
        )}

        {activeTab === 'ai-diagnostics' && (
          <DevOpsAIAssistant node={node} initialPrompt={aiPrompt} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F2229] bg-[#0A0B0E] py-3.5 px-4 sm:px-6 lg:px-8 text-xs text-[#8D9199] flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#BFC3C9]">Dewacloud Infrastructure Monitor</span>
          <span className="text-[#545963]">•</span>
          <span className="font-mono text-[#4E80EE]">Node #{node.nodeId}</span>
          <span className="text-[#545963]">•</span>
          <span className="font-mono text-[#8D9199]">{node.host}:{node.port}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Status: <span className="text-[#4ADE80] font-medium">Synchronized</span></span>
          <span className="text-[#545963]">•</span>
          <span className="font-mono">OpenSSH 9.6p1</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <NodeSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentNode={node}
        onUpdateNode={handleUpdateNode}
        onResetDefaults={handleResetDefaults}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md text-xs font-medium ${
            toastMessage.type === 'success'
              ? 'bg-[#0F1117]/95 border-[#1B3F2D] text-[#4ADE80]'
              : toastMessage.type === 'error'
              ? 'bg-[#0F1117]/95 border-[#451B1E] text-[#F87171]'
              : 'bg-[#0F1117]/95 border-[#4E80EE]/40 text-[#9EB9F7]'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-[#4ADE80] flex-shrink-0" />
            ) : (
              <Info className="h-4 w-4 text-[#4E80EE] flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-[#8D9199] hover:text-white p-0.5 cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
