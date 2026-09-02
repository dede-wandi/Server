import React, { useState } from 'react';
import { SystemService, SystemProcess, DockerContainer } from '../types';
import { 
  Layers, 
  Play, 
  RotateCw, 
  Square, 
  Search, 
  Filter, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  Database, 
  Shield, 
  X,
  RefreshCw,
  Box,
  Copy,
  Check,
  FileText,
  Info,
  ExternalLink,
  Activity
} from 'lucide-react';

interface ServiceProcessManagerProps {
  services: SystemService[];
  processes: SystemProcess[];
  dockerContainers: DockerContainer[];
  onRestartService: (serviceId: string) => void;
  onToggleService: (serviceId: string) => void;
  onKillProcess: (pid: number) => void;
  onRestartContainer?: (containerId: string) => void;
  onToggleContainer?: (containerId: string) => void;
}

export const ServiceProcessManager: React.FC<ServiceProcessManagerProps> = ({
  services,
  processes,
  dockerContainers,
  onRestartService,
  onToggleService,
  onKillProcess,
  onRestartContainer,
  onToggleContainer,
}) => {
  const [subTab, setSubTab] = useState<'docker' | 'services' | 'processes'>('docker');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dockerCategoryFilter, setDockerCategoryFilter] = useState<string>('all');
  const [selectedServiceLog, setSelectedServiceLog] = useState<SystemService | null>(null);
  const [selectedDockerLog, setSelectedDockerLog] = useState<DockerContainer | null>(null);
  const [selectedDockerInspect, setSelectedDockerInspect] = useState<DockerContainer | null>(null);
  const [killPidModal, setKillPidModal] = useState<SystemProcess | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredContainers = (dockerContainers || []).filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.shortId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.image.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.command.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = dockerCategoryFilter === 'all' || c.category === dockerCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredProcesses = processes.filter(p => {
    return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.pid.toString().includes(searchTerm) ||
           p.command.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#4E80EE]/10 border border-[#4E80EE]/30 text-[#4E80EE]">
            <Box className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#E0E2E7]">Containers & Workload Manager</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#4E80EE]/15 text-[#9EB9F7] border border-[#4E80EE]/30">
                15 Live Containers
              </span>
            </div>
            <p className="text-[11px] text-[#8D9199]">
              Pantau status real-time microservices Docker (qgrow.id1 stack), systemd daemon, dan konsumsi CPU/RAM.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#0A0B0E] p-0.5 rounded-lg border border-[#1F2229] text-xs">
            <button
              id="subtab-docker-btn"
              onClick={() => { setSubTab('docker'); setSearchTerm(''); }}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'docker'
                  ? 'bg-[#4E80EE] text-white shadow-sm font-semibold'
                  : 'text-[#8D9199] hover:text-[#E0E2E7]'
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>Docker Containers ({dockerContainers?.length || 15})</span>
            </button>
            <button
              id="subtab-services-btn"
              onClick={() => { setSubTab('services'); setSearchTerm(''); }}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'services'
                  ? 'bg-[#4E80EE] text-white shadow-sm font-semibold'
                  : 'text-[#8D9199] hover:text-[#E0E2E7]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>System Services ({services.length})</span>
            </button>
            <button
              id="subtab-processes-btn"
              onClick={() => { setSubTab('processes'); setSearchTerm(''); }}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'processes'
                  ? 'bg-[#4E80EE] text-white shadow-sm font-semibold'
                  : 'text-[#8D9199] hover:text-[#E0E2E7]'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Processes ({processes.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0F1117] border border-[#1F2229] rounded-xl p-2.5">
        <div className="relative w-full sm:w-80">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#545963]" />
          <input
            id="service-process-search-input"
            type="text"
            placeholder={
              subTab === 'docker'
                ? 'Cari container (e.g. qgrow-product, qris, redis, 5f8d)...'
                : subTab === 'services'
                ? 'Cari service (e.g. nginx, ssh, docker)...'
                : 'Cari proses / PID / user...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-xs text-[#E0E2E7] placeholder:text-[#545963] focus:outline-none focus:border-[#4E80EE] transition"
          />
        </div>

        {subTab === 'docker' && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            <span className="text-[#545963] text-[11px] font-medium mr-1">Stack:</span>
            {[
              { id: 'all', label: 'All (15)' },
              { id: 'payment', label: 'Payment & QRIS' },
              { id: 'listener', label: 'Listeners & Workers' },
              { id: 'core', label: 'Core Microservices' },
              { id: 'storage', label: 'Redis Cache' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setDockerCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer text-xs whitespace-nowrap ${
                  dockerCategoryFilter === cat.id
                    ? 'bg-[#4E80EE]/20 text-[#4E80EE] border border-[#4E80EE]/40 font-medium'
                    : 'bg-[#0A0B0E] text-[#8D9199] hover:text-[#E0E2E7] border border-[#1F2229]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {subTab === 'services' && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            <span className="text-[#545963] text-[11px] font-medium mr-1">Kategori:</span>
            {['all', 'web', 'database', 'runtime', 'security', 'system'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md capitalize transition cursor-pointer text-xs ${
                  categoryFilter === cat
                    ? 'bg-[#4E80EE]/20 text-[#4E80EE] border border-[#4E80EE]/40 font-medium'
                    : 'bg-[#0A0B0E] text-[#8D9199] hover:text-[#E0E2E7] border border-[#1F2229]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SUBTAB 0: DOCKER CONTAINERS (15 Active Microservices) */}
      {subTab === 'docker' && (
        <div className="space-y-3">
          <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#1F2229] bg-[#0A0B0E] text-[#8D9199] uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3.5">Container ID</th>
                    <th className="py-2.5 px-3.5 font-sans">Name & Category</th>
                    <th className="py-2.5 px-3.5">Image Repository</th>
                    <th className="py-2.5 px-3.5">Command</th>
                    <th className="py-2.5 px-3.5">Status / Uptime</th>
                    <th className="py-2.5 px-3.5">CPU %</th>
                    <th className="py-2.5 px-3.5">Memory</th>
                    <th className="py-2.5 px-3.5 text-right font-sans">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2229]">
                  {filteredContainers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#161921]/60 transition">
                      <td className="py-2.5 px-3.5">
                        <button
                          onClick={() => handleCopy(c.shortId, c.id)}
                          className="inline-flex items-center gap-1 font-bold text-[#4E80EE] hover:text-[#9EB9F7] cursor-pointer"
                          title="Click to copy container ID"
                        >
                          {c.shortId}
                          {copiedId === c.id ? <Check className="h-3 w-3 text-[#4ADE80]" /> : <Copy className="h-3 w-3 text-[#545963]" />}
                        </button>
                      </td>
                      <td className="py-2.5 px-3.5 font-sans">
                        <div className="font-semibold text-[#E0E2E7] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></span>
                          {c.name}
                        </div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono mt-0.5 uppercase tracking-wider ${
                          c.category === 'payment'
                            ? 'bg-[#4E80EE]/10 text-[#4E80EE] border border-[#4E80EE]/20'
                            : c.category === 'listener'
                            ? 'bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/20'
                            : c.category === 'storage'
                            ? 'bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/20'
                            : 'bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20'
                        }`}>
                          {c.category || 'microservice'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#8D9199] max-w-xs truncate" title={c.image}>
                        <span className="text-[#BFC3C9]">{c.image}</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#545963] max-w-[140px] truncate" title={c.command}>
                        {c.command}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20 inline-flex items-center gap-1">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="font-semibold text-[#E0E2E7]">{c.cpuUsage || '1.1%'}</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#8D9199]">
                        <span className="text-[#E0E2E7]">{c.memUsage || '110 MB'}</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`docker-logs-btn-${c.shortId}`}
                            onClick={() => setSelectedDockerLog(c)}
                            className="p-1.5 rounded bg-[#161921] hover:bg-[#1F2229] text-[#4E80EE] hover:text-white border border-[#1F2229] text-xs transition cursor-pointer"
                            title="docker logs"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`docker-inspect-btn-${c.shortId}`}
                            onClick={() => setSelectedDockerInspect(c)}
                            className="p-1.5 rounded bg-[#161921] hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] border border-[#1F2229] text-xs transition cursor-pointer"
                            title="docker inspect"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`docker-restart-btn-${c.shortId}`}
                            onClick={() => onRestartContainer && onRestartContainer(c.id)}
                            className="p-1.5 rounded bg-[#161921] hover:bg-[#1F2229] text-[#8D9199] hover:text-[#FACC15] border border-[#1F2229] text-xs transition cursor-pointer"
                            title="docker restart"
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 1: SYSTEM SERVICES GRID */}
      {subTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 shadow-lg flex flex-col justify-between hover:border-[#4E80EE]/40 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h3 className="text-sm font-semibold text-[#E0E2E7] flex items-center gap-1.5">
                      {srv.displayName}
                    </h3>
                    <span className="font-mono text-[11px] text-[#8D9199]">{srv.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 ${
                    srv.status === 'active'
                      ? 'bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30'
                      : srv.status === 'reloading'
                      ? 'bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/30'
                      : 'bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${srv.status === 'active' ? 'bg-[#4ADE80]' : 'bg-[#F87171]'}`}></span>
                    {srv.status}
                  </span>
                </div>

                <p className="text-xs text-[#8D9199] mb-3 line-clamp-2">
                  {srv.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#0A0B0E] p-2 rounded-lg border border-[#1F2229] mb-3">
                  <div>
                    <span className="text-[#545963] text-[10px] block">Port:</span>
                    <span className="font-mono font-medium text-[#E0E2E7]">{srv.port ? `:${srv.port}` : 'System'}</span>
                  </div>
                  <div>
                    <span className="text-[#545963] text-[10px] block">Memory:</span>
                    <span className="font-mono font-medium text-[#E0E2E7]">{srv.memoryUsageMb} MB</span>
                  </div>
                  <div>
                    <span className="text-[#545963] text-[10px] block">Uptime:</span>
                    <span className="text-[#8D9199] text-[11px] truncate block">{srv.uptime}</span>
                  </div>
                  <div>
                    <span className="text-[#545963] text-[10px] block">Version:</span>
                    <span className="font-mono text-[#8D9199] text-[11px] truncate block">{srv.version}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1F2229] text-xs">
                <button
                  id={`view-log-${srv.id}`}
                  onClick={() => setSelectedServiceLog(srv)}
                  className="inline-flex items-center gap-1 text-[#8D9199] hover:text-[#4E80EE] transition cursor-pointer font-medium"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Journalctl Log</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    id={`restart-service-${srv.id}`}
                    onClick={() => onRestartService(srv.id)}
                    className="p-1.5 rounded bg-[#161921] hover:bg-[#1F2229] text-[#8D9199] hover:text-[#FACC15] border border-[#1F2229] transition cursor-pointer"
                    title="Restart Service"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>

                  <button
                    id={`toggle-service-${srv.id}`}
                    onClick={() => onToggleService(srv.id)}
                    className={`p-1.5 rounded border transition cursor-pointer ${
                      srv.status === 'active'
                        ? 'bg-[#F87171]/10 text-[#F87171] border-[#F87171]/30 hover:bg-[#F87171]/20'
                        : 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30 hover:bg-[#4ADE80]/20'
                    }`}
                    title={srv.status === 'active' ? 'Stop Service' : 'Start Service'}
                  >
                    {srv.status === 'active' ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: ACTIVE PROCESSES TABLE */}
      {subTab === 'processes' && (
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#1F2229] bg-[#0A0B0E] text-[#8D9199] uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3.5">PID</th>
                  <th className="py-2.5 px-3.5 font-sans">Command / Name</th>
                  <th className="py-2.5 px-3.5">User</th>
                  <th className="py-2.5 px-3.5">CPU %</th>
                  <th className="py-2.5 px-3.5">MEM %</th>
                  <th className="py-2.5 px-3.5">Threads</th>
                  <th className="py-2.5 px-3.5">Uptime</th>
                  <th className="py-2.5 px-3.5 text-right font-sans">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2229]">
                {filteredProcesses.map((proc) => (
                  <tr key={proc.pid} className="hover:bg-[#161921]/60 transition">
                    <td className="py-2.5 px-3.5 font-bold text-[#4E80EE]">{proc.pid}</td>
                    <td className="py-2.5 px-3.5 font-sans font-medium text-[#E0E2E7] max-w-xs truncate" title={proc.command}>
                      {proc.name}
                      <span className="block text-[11px] font-mono text-[#545963] truncate">{proc.command}</span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        proc.user === 'root' ? 'bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/20' : 'bg-[#161921] text-[#8D9199] border border-[#1F2229]'
                      }`}>
                        {proc.user}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`font-semibold ${proc.cpu > 5 ? 'text-[#F87171]' : 'text-[#E0E2E7]'}`}>
                        {proc.cpu.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className={`font-semibold ${proc.mem > 8 ? 'text-[#4E80EE]' : 'text-[#E0E2E7]'}`}>
                        {proc.mem.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-[#8D9199]">{proc.threads}</td>
                    <td className="py-2.5 px-3.5 text-[#8D9199]">{proc.uptime}</td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        id={`kill-proc-${proc.pid}`}
                        onClick={() => setKillPidModal(proc)}
                        className="px-2.5 py-1 rounded bg-[#F87171]/10 hover:bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/30 text-[11px] font-sans font-medium transition cursor-pointer"
                      >
                        Kill PID
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Docker Container Log Modal */}
      {selectedDockerLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0E]/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0A0B0E] border-b border-[#1F2229]">
              <div className="flex items-center gap-2 font-mono text-xs text-[#4E80EE]">
                <Box className="h-4 w-4" />
                <span>docker logs {selectedDockerLog.name} --tail 50 -f</span>
              </div>
              <button
                onClick={() => setSelectedDockerLog(null)}
                className="p-1 rounded text-[#8D9199] hover:text-[#E0E2E7] hover:bg-[#1F2229] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 bg-[#0A0B0E] font-mono text-xs text-[#BFC3C9] space-y-1 max-h-96 overflow-y-auto leading-relaxed">
              <div className="text-[#545963]">-- Log streaming for {selectedDockerLog.name} (Image: {selectedDockerLog.image}) --</div>
              <div>[2026-09-02T08:28:40.114Z] [INFO] Worker cluster node initialized (PID 1)</div>
              <div>[2026-09-02T08:28:40.820Z] [INFO] Redis cache connection verified (container-redis:6379 pool=10)</div>
              <div>[2026-09-02T08:28:41.010Z] [INFO] Database connection pool established (MariaDB / Internal VPC)</div>
              <div>[2026-09-02T08:28:41.312Z] [INFO] Applied migration schema v2.14.0 successfully</div>
              <div className="text-[#4ADE80]">[2026-09-02T08:28:42.840Z] [INFO] Microservice listening on {selectedDockerLog.ports || 'internal overlay network'}</div>
              <div>[2026-09-02T08:30:15.220Z] [INFO] [HealthCheck] GET /healthz 200 OK duration=0.8ms</div>
              <div>[2026-09-02T08:35:00.005Z] [INFO] Processed async job queue batch (records=48)</div>
              <div>[2026-09-02T08:42:19.412Z] [INFO] Kafka message acknowledged offset=89104 topic=qgrow.events.processed</div>
            </div>
            <div className="px-4 py-3 bg-[#0F1117] border-t border-[#1F2229] flex justify-between items-center text-xs">
              <span className="text-[#8D9199]">Container ID: <span className="font-mono text-[#E0E2E7]">{selectedDockerLog.shortId}</span></span>
              <button
                onClick={() => setSelectedDockerLog(null)}
                className="px-4 py-1.5 rounded-lg bg-[#161921] hover:bg-[#1F2229] text-[#E0E2E7] border border-[#1F2229] text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Docker Inspect Modal */}
      {selectedDockerInspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0E]/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0A0B0E] border-b border-[#1F2229]">
              <div className="flex items-center gap-2 font-mono text-xs text-[#4E80EE]">
                <Info className="h-4 w-4" />
                <span>docker inspect {selectedDockerInspect.name}</span>
              </div>
              <button
                onClick={() => setSelectedDockerInspect(null)}
                className="p-1 rounded text-[#8D9199] hover:text-[#E0E2E7] hover:bg-[#1F2229] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 bg-[#0A0B0E] font-mono text-xs text-[#4ADE80] max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify({
                  Id: selectedDockerInspect.id,
                  Created: "2026-09-02T03:15:22.9814421Z",
                  Path: selectedDockerInspect.command.replace(/"/g, ''),
                  State: {
                    Status: selectedDockerInspect.state,
                    Running: true,
                    Uptime: selectedDockerInspect.status,
                    Pid: 5840,
                  },
                  Image: selectedDockerInspect.image,
                  Name: `/${selectedDockerInspect.name}`,
                  NetworkSettings: {
                    IPAddress: "172.20.0.8",
                    Ports: selectedDockerInspect.ports,
                    NetworkName: "qgrow_internal_net"
                  }
                }, null, 2)}
              </pre>
            </div>
            <div className="px-4 py-3 bg-[#0F1117] border-t border-[#1F2229] flex justify-end">
              <button
                onClick={() => setSelectedDockerInspect(null)}
                className="px-4 py-1.5 rounded-lg bg-[#161921] hover:bg-[#1F2229] text-[#E0E2E7] border border-[#1F2229] text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Journal / Log Modal */}
      {selectedServiceLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0E]/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0A0B0E] border-b border-[#1F2229]">
              <div className="flex items-center gap-2 font-mono text-xs text-[#4E80EE]">
                <Terminal className="h-4 w-4" />
                <span>journalctl -u {selectedServiceLog.name} -n 20 --no-pager</span>
              </div>
              <button
                onClick={() => setSelectedServiceLog(null)}
                className="p-1 rounded text-[#8D9199] hover:text-[#E0E2E7] hover:bg-[#1F2229] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 bg-[#0A0B0E] font-mono text-xs text-[#BFC3C9] space-y-1 max-h-96 overflow-y-auto">
              <div className="text-[#545963]">-- Logs begin at Wed 2026-08-19 18:00:00 UTC. --</div>
              <div>[2026-09-02 00:50:12] {selectedServiceLog.name}[1405]: Started {selectedServiceLog.displayName}.</div>
              <div>[2026-09-02 00:52:45] {selectedServiceLog.name}[1405]: Configuration re-read without errors.</div>
              <div>[2026-09-02 00:54:10] {selectedServiceLog.name}[1405]: Worker processes synchronized. Memory footprint: {selectedServiceLog.memoryUsageMb}MB.</div>
              <div className="text-[#4ADE80]">[2026-09-02 00:55:00] {selectedServiceLog.name}[1405]: Status: active (running), 0 crashed threads.</div>
            </div>
            <div className="px-4 py-3 bg-[#0F1117] border-t border-[#1F2229] flex justify-end">
              <button
                onClick={() => setSelectedServiceLog(null)}
                className="px-4 py-1.5 rounded-lg bg-[#161921] hover:bg-[#1F2229] text-[#E0E2E7] border border-[#1F2229] text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kill Process Confirmation Modal */}
      {killPidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0E]/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-full bg-[#F87171]/10 border border-[#F87171]/30 text-[#F87171]">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#E0E2E7]">Konfirmasi Kill Process</h3>
                <p className="text-xs text-[#8D9199]">Kirim sinyal SIGKILL (kill -9) ke PID ini?</p>
              </div>
            </div>
            <div className="bg-[#0A0B0E] p-3 rounded-lg border border-[#1F2229] font-mono text-xs space-y-1 mb-4">
              <div className="text-[#8D9199]">PID: <span className="text-[#E0E2E7] font-bold">{killPidModal.pid}</span></div>
              <div className="text-[#8D9199]">Process: <span className="text-[#4E80EE]">{killPidModal.name}</span></div>
              <div className="text-[#8D9199] truncate">Command: <span className="text-[#BFC3C9]">{killPidModal.command}</span></div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setKillPidModal(null)}
                className="px-3.5 py-1.5 rounded-lg bg-[#161921] hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] border border-[#1F2229] text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                id="confirm-kill-process-btn"
                onClick={() => {
                  onKillProcess(killPidModal.pid);
                  setKillPidModal(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#F87171] hover:bg-[#F87171]/90 text-white text-xs font-semibold cursor-pointer shadow-sm"
              >
                Kill -9 Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
