import React from 'react';
import { ServerNode, MetricPoint } from '../types';
import { 
  Cpu, 
  Database, 
  HardDrive, 
  Network, 
  Server, 
  Flame, 
  Zap, 
  Clock, 
  Gauge, 
  ArrowDownLeft, 
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

interface MetricsOverviewProps {
  node: ServerNode;
  history: MetricPoint[];
  currentMetrics: MetricPoint;
  uptimeSeconds: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  node,
  history,
  currentMetrics,
  uptimeSeconds,
}) => {
  const formatUptime = (totalSec: number) => {
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  const ramUsedGb = ((currentMetrics.memory / 100) * node.specs.ramTotalGb).toFixed(2);
  const diskUsedGb = ((currentMetrics.disk / 100) * node.specs.diskTotalGb).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Quick Status Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* CPU Card */}
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#545963] uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-[#4E80EE]" />
              CPU Utilization
            </span>
            <span className="text-[10px] font-mono font-medium text-[#4E80EE] bg-[#161921] px-1.5 py-0.5 rounded border border-[#1F2229]">
              {node.specs.cpuCores} vCPUs
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xl font-bold font-mono text-[#E0E2E7] tracking-tight">
              {currentMetrics.cpu.toFixed(1)}%
            </div>
            <div className="text-[11px] text-[#8D9199] font-mono">
              Load: {currentMetrics.loadAvg[0].toFixed(2)}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-[#0A0B0E] rounded h-1.5 overflow-hidden border border-[#1F2229]">
            <div 
              className={`h-full transition-all duration-500 rounded ${
                currentMetrics.cpu > 80 ? 'bg-[#F87171]' : currentMetrics.cpu > 50 ? 'bg-[#FACC15]' : 'bg-[#4E80EE]'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, currentMetrics.cpu))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#545963] mt-2 font-mono">
            <span>Temp: ~42°C</span>
            <span>Freq: 2.45 GHz</span>
          </div>
        </div>

        {/* RAM Card */}
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#545963] uppercase tracking-wider flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-[#4E80EE]" />
              Memory (RAM)
            </span>
            <span className="text-[10px] font-mono font-medium text-[#BFC3C9] bg-[#161921] px-1.5 py-0.5 rounded border border-[#1F2229]">
              {node.specs.ramTotalGb} GB Total
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xl font-bold font-mono text-[#E0E2E7] tracking-tight">
              {ramUsedGb} <span className="text-xs text-[#8D9199] font-normal">/ {node.specs.ramTotalGb} GB</span>
            </div>
            <div className="text-[11px] font-mono text-[#4E80EE] font-medium">
              {currentMetrics.memory.toFixed(1)}%
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-[#0A0B0E] rounded h-1.5 overflow-hidden border border-[#1F2229]">
            <div 
              className={`h-full transition-all duration-500 rounded ${
                currentMetrics.memory > 85 ? 'bg-[#F87171]' : currentMetrics.memory > 70 ? 'bg-[#FACC15]' : 'bg-[#4E80EE]'
              }`}
              style={{ width: `${currentMetrics.memory}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#545963] mt-2 font-mono">
            <span>Cached: 1.84 GB</span>
            <span>Swap: 240 MB / 2 GB</span>
          </div>
        </div>

        {/* Storage NVMe Card */}
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#545963] uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-[#4ADE80]" />
              NVMe Storage
            </span>
            <span className="text-[10px] font-mono font-medium text-[#4ADE80] bg-[#122A1E] px-1.5 py-0.5 rounded border border-[#1B3F2D]">
              {node.specs.diskTotalGb} GB Gen4
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xl font-bold font-mono text-[#E0E2E7] tracking-tight">
              {diskUsedGb} <span className="text-xs text-[#8D9199] font-normal">/ {node.specs.diskTotalGb} GB</span>
            </div>
            <div className="text-[11px] font-mono text-[#4ADE80] font-medium">
              {currentMetrics.disk.toFixed(1)}%
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-[#0A0B0E] rounded h-1.5 overflow-hidden border border-[#1F2229]">
            <div 
              className="h-full bg-[#4ADE80] rounded transition-all duration-500"
              style={{ width: `${currentMetrics.disk}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#545963] mt-2 font-mono">
            <span>IOPS: {currentMetrics.iops} ops/s</span>
            <span>Free: {(node.specs.diskTotalGb - parseFloat(diskUsedGb)).toFixed(1)} GB</span>
          </div>
        </div>

        {/* Network & Uptime Card */}
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#545963] uppercase tracking-wider flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-[#FACC15]" />
              Network & Uptime
            </span>
            <span className="text-[10px] font-mono font-semibold text-[#4ADE80] bg-[#122A1E] px-1.5 py-0.5 rounded border border-[#1B3F2D] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]"></span>
              Healthy
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-base font-bold font-mono text-[#E0E2E7] truncate" title={formatUptime(uptimeSeconds)}>
              {formatUptime(uptimeSeconds)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#1F2229] font-mono text-xs">
            <div className="flex items-center gap-1 text-[#4ADE80]">
              <ArrowDownLeft className="h-3.5 w-3.5 text-[#4ADE80]" />
              <span>{currentMetrics.networkInMb.toFixed(2)} MB/s</span>
            </div>
            <div className="flex items-center gap-1 text-[#4E80EE] justify-end">
              <ArrowUpRight className="h-3.5 w-3.5 text-[#4E80EE]" />
              <span>{currentMetrics.networkOutMb.toFixed(2)} MB/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts: CPU & RAM Timeline + Network Bandwidth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* CPU & Memory History Chart */}
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-[#E0E2E7] flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-[#4E80EE]" />
                Live CPU & Memory Trend (%)
              </h3>
              <p className="text-[11px] text-[#8D9199] mt-0.5">Real-time resource utilization telemetry</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-[#4E80EE]"></span>
                <span className="text-[#8D9199] text-[11px]">CPU</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-[#BFC3C9]"></span>
                <span className="text-[#8D9199] text-[11px]">RAM</span>
              </div>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4E80EE" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4E80EE" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8D9199" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8D9199" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2229" />
                <XAxis dataKey="time" stroke="#545963" tick={{ fontSize: 10, fill: '#8D9199' }} />
                <YAxis domain={[0, 100]} stroke="#545963" tick={{ fontSize: 10, fill: '#8D9199' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1117',
                    borderColor: '#1F2229',
                    borderRadius: '6px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
                  }}
                  itemStyle={{ color: '#E0E2E7' }}
                  labelStyle={{ color: '#8D9199' }}
                />
                <Area type="monotone" dataKey="cpu" name="CPU Usage %" stroke="#4E80EE" strokeWidth={1.5} fillOpacity={1} fill="url(#cpuGradient)" />
                <Area type="monotone" dataKey="memory" name="RAM Usage %" stroke="#BFC3C9" strokeWidth={1.5} fillOpacity={1} fill="url(#memGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network Bandwidth In/Out Chart */}
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-[#E0E2E7] flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5 text-[#4ADE80]" />
                Network Throughput (MB/s)
              </h3>
              <p className="text-[11px] text-[#8D9199] mt-0.5">Inbound & Outbound traffic on interface eth0</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-[#4ADE80]"></span>
                <span className="text-[#8D9199] text-[11px]">Inbound (RX)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-[#4E80EE]"></span>
                <span className="text-[#8D9199] text-[11px]">Outbound (TX)</span>
              </div>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2229" />
                <XAxis dataKey="time" stroke="#545963" tick={{ fontSize: 10, fill: '#8D9199' }} />
                <YAxis stroke="#545963" tick={{ fontSize: 10, fill: '#8D9199' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1117',
                    borderColor: '#1F2229',
                    borderRadius: '6px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
                  }}
                  itemStyle={{ color: '#E0E2E7' }}
                  labelStyle={{ color: '#8D9199' }}
                />
                <Line type="monotone" dataKey="networkInMb" name="Inbound RX (MB/s)" stroke="#4ADE80" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="networkOutMb" name="Outbound TX (MB/s)" stroke="#4E80EE" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Core Breakdown & Hardware Specs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 4 CPU Core Visualizer */}
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-[#E0E2E7] mb-3 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-[#4E80EE]" />
            vCPU Core Distribution
          </h3>
          <div className="space-y-2.5">
            {currentMetrics.cpuCores.map((load, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#8D9199]">Core #{idx} (Thread {idx})</span>
                  <span className={`font-semibold ${load > 80 ? 'text-[#F87171]' : load > 50 ? 'text-[#FACC15]' : 'text-[#4E80EE]'}`}>
                    {load.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[#0A0B0E] rounded h-1.5 overflow-hidden border border-[#1F2229]">
                  <div
                    className={`h-full transition-all duration-300 rounded ${
                      load > 80 ? 'bg-[#F87171]' : load > 50 ? 'bg-[#FACC15]' : 'bg-[#4E80EE]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(3, load))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load Average & System Health */}
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-[#E0E2E7] mb-3 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#FACC15]" />
            System Load & Kernel Info
          </h3>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-[#161921] border border-[#1F2229]">
              <span className="text-[#8D9199]">Load Average:</span>
              <span className="text-[#4E80EE] font-semibold">
                {currentMetrics.loadAvg[0].toFixed(2)}, {currentMetrics.loadAvg[1].toFixed(2)}, {currentMetrics.loadAvg[2].toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-[#161921] border border-[#1F2229]">
              <span className="text-[#8D9199]">Operating System:</span>
              <span className="text-[#E0E2E7] truncate max-w-[170px]" title={node.os}>{node.os}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-[#161921] border border-[#1F2229]">
              <span className="text-[#8D9199]">Kernel Version:</span>
              <span className="text-[#E0E2E7] truncate max-w-[170px]" title={node.kernel}>{node.kernel}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-[#161921] border border-[#1F2229]">
              <span className="text-[#8D9199]">Node Architecture:</span>
              <span className="text-[#4ADE80] font-semibold">x86_64 (KVM Hypervisor)</span>
            </div>
          </div>
        </div>

        {/* Cloud Infrastructure Details */}
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-[#E0E2E7] mb-3 flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-[#4E80EE]" />
            Dewacloud Infrastructure Spec
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#8D9199]">
              <span className="text-[#545963]">Node Identity:</span>
              <span className="font-mono text-[#4E80EE] font-semibold">#{node.nodeId}</span>
            </div>
            <div className="flex items-center justify-between text-[#8D9199]">
              <span className="text-[#545963]">Provider:</span>
              <span className="text-[#E0E2E7] font-medium">{node.provider}</span>
            </div>
            <div className="flex items-center justify-between text-[#8D9199]">
              <span className="text-[#545963]">Data Center:</span>
              <span className="text-[#8D9199]">{node.region}</span>
            </div>
            <div className="flex items-center justify-between text-[#8D9199]">
              <span className="text-[#545963]">Dedicated Public IP:</span>
              <span className="font-mono text-[#4ADE80]">{node.ipAddress}</span>
            </div>
            <div className="flex items-center justify-between text-[#8D9199]">
              <span className="text-[#545963]">Bandwidth Allowance:</span>
              <span className="font-mono text-[#BFC3C9]">1.4 TB / {node.specs.bandwidthLimitTb} TB</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
