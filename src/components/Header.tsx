import React from 'react';
import { ServerNode } from '../types';
import { 
  Server, 
  Terminal, 
  Activity, 
  Layers, 
  FolderTree, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Wifi, 
  Radio, 
  Sliders,
  Flame
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentNode: ServerNode;
  isLiveUpdating: boolean;
  setIsLiveUpdating: (val: boolean) => void;
  refreshRateSec: number;
  setRefreshRateSec: (rate: number) => void;
  pingLatency: number | null;
  isCheckingPing: boolean;
  onCheckPing: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentNode,
  isLiveUpdating,
  setIsLiveUpdating,
  refreshRateSec,
  setRefreshRateSec,
  pingLatency,
  isCheckingPing,
  onCheckPing,
  onOpenSettings,
}) => {
  const [copiedSSH, setCopiedSSH] = React.useState(false);

  const handleCopySSH = () => {
    navigator.clipboard.writeText(currentNode.sshCommand);
    setCopiedSSH(true);
    setTimeout(() => setCopiedSSH(false), 2000);
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Metrics', icon: Activity },
    { id: 'logs', label: 'Log Explorer (Grafana)', icon: Flame },
    { id: 'terminal', label: 'SSH Web Terminal', icon: Terminal },
    { id: 'services', label: 'Services & Processes', icon: Layers },
    { id: 'files', label: 'SFTP File Explorer', icon: FolderTree },
    { id: 'security', label: 'Firewall & Security', icon: ShieldCheck },
    { id: 'ai-diagnostics', label: 'DevOps AI Advisor', icon: Sparkles },
  ];

  return (
    <header className="border-b border-[#1F2229] bg-[#0A0B0E]/95 backdrop-blur-md sticky top-0 z-30">
      {/* Top Bar: Brand, Node Switcher, Live Telemetry Status, Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Node Badge */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#161921] border border-[#1F2229] flex items-center justify-center shadow-sm text-[#4E80EE]">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-[#E0E2E7] flex items-center gap-2">
                  Dewacloud Server Dashboard
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#122A1E] text-[#4ADE80] border border-[#1B3F2D] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] mr-1.5 animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8D9199]">
                <span className="font-mono text-[#4E80EE] font-semibold">Node ID: {currentNode.nodeId}</span>
                <span className="text-[#545963]">•</span>
                <span className="font-mono text-[#BFC3C9]">{currentNode.username}@{currentNode.host}:{currentNode.port}</span>
                <span className="text-[#545963]">•</span>
                <span className="hidden sm:inline text-[#8D9199]">{currentNode.region}</span>
              </div>
            </div>
          </div>

          {/* Controls: Quick SSH Copy, Ping Latency, Refresh Interval */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick SSH Copy Button */}
            <button
              id="header-copy-ssh-btn"
              onClick={handleCopySSH}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#161921] border border-[#1F2229] text-xs font-mono text-[#E0E2E7] hover:text-white hover:border-[#4E80EE]/50 hover:bg-[#1F2229] transition-all cursor-pointer shadow-sm"
              title="Click to copy exact SSH command"
            >
              {copiedSSH ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#4ADE80]" />
                  <span className="text-[#4ADE80]">SSH Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#8D9199]" />
                  <span className="truncate max-w-[170px] sm:max-w-[210px]">{currentNode.sshCommand}</span>
                </>
              )}
            </button>

            {/* Ping & Gateway Latency */}
            <button
              id="header-ping-check-btn"
              onClick={onCheckPing}
              disabled={isCheckingPing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#161921] border border-[#1F2229] text-xs text-[#E0E2E7] hover:border-[#30343D] transition cursor-pointer"
              title="Click to check ping latency to gate.infra.dewacloud.com:3022"
            >
              <Wifi className={`h-3.5 w-3.5 ${isCheckingPing ? 'text-[#FACC15] animate-spin' : pingLatency ? 'text-[#4ADE80]' : 'text-[#8D9199]'}`} />
              <span className="font-mono font-medium">
                {isCheckingPing ? 'Pinging...' : pingLatency ? `${pingLatency} ms` : '18 ms'}
              </span>
            </button>

            {/* Live Toggle & Interval */}
            <div className="flex items-center bg-[#161921] border border-[#1F2229] rounded p-0.5">
              <button
                id="header-live-toggle-btn"
                onClick={() => setIsLiveUpdating(!isLiveUpdating)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  isLiveUpdating
                    ? 'bg-[#122A1E] text-[#4ADE80] border border-[#1B3F2D]'
                    : 'text-[#8D9199] hover:text-[#E0E2E7]'
                }`}
              >
                <Radio className={`h-3 w-3 ${isLiveUpdating ? 'text-[#4ADE80] animate-pulse' : 'text-[#545963]'}`} />
                <span>{isLiveUpdating ? 'Live' : 'Paused'}</span>
              </button>

              <select
                id="header-refresh-interval-select"
                value={refreshRateSec}
                onChange={(e) => setRefreshRateSec(Number(e.target.value))}
                className="bg-transparent text-xs text-[#E0E2E7] border-none outline-none py-1 px-1 cursor-pointer font-mono"
              >
                <option value={1} className="bg-[#0F1117] text-[#E0E2E7]">1s</option>
                <option value={3} className="bg-[#0F1117] text-[#E0E2E7]">3s</option>
                <option value={5} className="bg-[#0F1117] text-[#E0E2E7]">5s</option>
                <option value={10} className="bg-[#0F1117] text-[#E0E2E7]">10s</option>
              </select>
            </div>

            {/* Settings button */}
            <button
              id="header-node-settings-btn"
              onClick={onOpenSettings}
              className="p-1.5 rounded bg-[#161921] border border-[#1F2229] text-[#8D9199] hover:text-white hover:border-[#30343D] transition cursor-pointer"
              title="Server & Connection Settings"
            >
              <Sliders className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1F2229] text-[#4E80EE] border border-[#30343D] shadow-sm'
                    : 'text-[#8D9199] hover:text-[#E0E2E7] hover:bg-[#161921] border border-transparent'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#4E80EE]' : 'text-[#8D9199]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
