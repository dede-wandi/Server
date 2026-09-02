import React, { useState } from 'react';
import { ServerNode } from '../types';
import { 
  Terminal, 
  HardDrive, 
  Key, 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  FileCode, 
  Shield, 
  HelpCircle, 
  CheckCircle2, 
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface ConnectionCardProps {
  node: ServerNode;
  onOpenTerminal: () => void;
  onOpenSFTP: () => void;
  onPingCheck: () => void;
  isCheckingPing: boolean;
  pingLatency: number | null;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  node,
  onOpenTerminal,
  onOpenSFTP,
  onPingCheck,
  isCheckingPing,
  pingLatency,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<'ssh' | 'putty' | 'filezilla' | 'rsync'>('ssh');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateSSHConfig = () => {
    return `# ~/.ssh/config entry for Dewacloud Node ${node.nodeId}
Host dewacloud-node-${node.nodeId}
    HostName ${node.host}
    Port ${node.port}
    User ${node.username}
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 3`;
  };

  const generateFileZillaXML = () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<FileZilla3 version="3.67.0" platform="all">
  <Servers>
    <Server>
      <Host>${node.host}</Host>
      <Port>${node.port}</Port>
      <Protocol>1</Protocol>
      <Type>0</Type>
      <User>${node.username}</User>
      <Logontype>5</Logontype>
      <Name>Dewacloud Node ${node.nodeId}</Name>
      <RemoteDir>${node.path}</RemoteDir>
    </Server>
  </Servers>
</FileZilla3>`;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-4 shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#1F2229]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#161921] border border-[#1F2229] text-[#4E80EE]">
            <Key className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#E0E2E7]">SFTP / SSH Connection Details</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#161921] text-[#4E80EE] border border-[#1F2229]">
                Node {node.nodeId}
              </span>
            </div>
            <p className="text-xs text-[#8D9199]">
              Kredensial resmi gateway Dewacloud untuk akses SSH Shell, SFTP File Transfer, dan DevOps automation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="connection-test-reachability-btn"
            onClick={onPingCheck}
            disabled={isCheckingPing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161921] hover:bg-[#1F2229] text-xs font-medium text-[#E0E2E7] border border-[#1F2229] transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCheckingPing ? 'animate-spin text-[#4E80EE]' : 'text-[#8D9199]'}`} />
            <span>{isCheckingPing ? 'Testing Gateway...' : 'Test Gateway Status'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Connection Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 py-3">
        {/* Host */}
        <div className="bg-[#161921] border border-[#1F2229] rounded p-2.5 relative group">
          <span className="text-[10px] font-bold text-[#545963] uppercase tracking-wider block mb-1">Host</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#4E80EE] truncate" title={node.host}>
              {node.host}
            </span>
            <button
              id="copy-host-btn"
              onClick={() => copyToClipboard(node.host, 'host')}
              className="p-1 text-[#8D9199] hover:text-white rounded hover:bg-[#1F2229] transition cursor-pointer"
              title="Copy Host"
            >
              {copiedField === 'host' ? <Check className="h-3.5 w-3.5 text-[#4ADE80]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Port */}
        <div className="bg-[#161921] border border-[#1F2229] rounded p-2.5 relative group">
          <span className="text-[10px] font-bold text-[#545963] uppercase tracking-wider block mb-1">Port</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#4ADE80]">
              {node.port}
            </span>
            <button
              id="copy-port-btn"
              onClick={() => copyToClipboard(node.port.toString(), 'port')}
              className="p-1 text-[#8D9199] hover:text-white rounded hover:bg-[#1F2229] transition cursor-pointer"
              title="Copy Port"
            >
              {copiedField === 'port' ? <Check className="h-3.5 w-3.5 text-[#4ADE80]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Username */}
        <div className="bg-[#161921] border border-[#1F2229] rounded p-2.5 relative group">
          <span className="text-[10px] font-bold text-[#545963] uppercase tracking-wider block mb-1">Username</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#BFC3C9]">
              {node.username}
            </span>
            <button
              id="copy-user-btn"
              onClick={() => copyToClipboard(node.username, 'user')}
              className="p-1 text-[#8D9199] hover:text-white rounded hover:bg-[#1F2229] transition cursor-pointer"
              title="Copy Username"
            >
              {copiedField === 'user' ? <Check className="h-3.5 w-3.5 text-[#4ADE80]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Remote Path */}
        <div className="bg-[#161921] border border-[#1F2229] rounded p-2.5 relative group">
          <span className="text-[10px] font-bold text-[#545963] uppercase tracking-wider block mb-1">Remote Path</span>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-[#FACC15]">
              {node.path}
            </span>
            <button
              id="copy-path-btn"
              onClick={() => copyToClipboard(node.path, 'path')}
              className="p-1 text-[#8D9199] hover:text-white rounded hover:bg-[#1F2229] transition cursor-pointer"
              title="Copy Path"
            >
              {copiedField === 'path' ? <Check className="h-3.5 w-3.5 text-[#4ADE80]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Connection Strings (SSH Command & SFTP Link) */}
      <div className="space-y-2.5 pt-1">
        {/* SSH Gate Command */}
        <div className="bg-[#161921] border border-[#1F2229] rounded p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#E0E2E7] flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-[#4E80EE]" />
              SSH Gate Command
            </span>
            <span className="text-[10px] text-[#545963] font-mono">Terminal / Bash / PowerShell</span>
          </div>
          <div className="flex items-center justify-between gap-2 bg-[#0A0B0E] rounded px-3 py-1.5 border border-[#1F2229] font-mono text-xs">
            <code className="text-[#4E80EE] select-all overflow-x-auto whitespace-nowrap">
              {node.sshCommand}
            </code>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                id="copy-ssh-command-btn"
                onClick={() => copyToClipboard(node.sshCommand, 'sshCmd')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1F2229] hover:bg-[#2A2E38] text-xs text-[#E0E2E7] transition cursor-pointer border border-[#30343D]"
              >
                {copiedField === 'sshCmd' ? (
                  <>
                    <Check className="h-3 w-3 text-[#4ADE80]" />
                    <span className="text-[#4ADE80] text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-[#8D9199]" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
              <button
                id="launch-ssh-terminal-btn"
                onClick={onOpenTerminal}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#4E80EE] hover:bg-[#3B6ECC] text-xs font-semibold text-white transition cursor-pointer shadow-sm"
              >
                <Terminal className="h-3 w-3" />
                <span className="text-[11px]">Launch Shell</span>
              </button>
            </div>
          </div>
        </div>

        {/* SFTP / FISH Link */}
        <div className="bg-[#161921] border border-[#1F2229] rounded p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#E0E2E7] flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-[#4ADE80]" />
              SFTP / FISH Link
            </span>
            <span className="text-[10px] text-[#545963] font-mono">FileZilla / WinSCP / Cyberduck</span>
          </div>
          <div className="flex items-center justify-between gap-2 bg-[#0A0B0E] rounded px-3 py-1.5 border border-[#1F2229] font-mono text-xs">
            <code className="text-[#4ADE80] select-all overflow-x-auto whitespace-nowrap">
              {node.sftpLink}
            </code>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                id="copy-sftp-link-btn"
                onClick={() => copyToClipboard(node.sftpLink, 'sftpLink')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1F2229] hover:bg-[#2A2E38] text-xs text-[#E0E2E7] transition cursor-pointer border border-[#30343D]"
              >
                {copiedField === 'sftpLink' ? (
                  <>
                    <Check className="h-3 w-3 text-[#4ADE80]" />
                    <span className="text-[#4ADE80] text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-[#8D9199]" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
              <button
                id="open-sftp-explorer-btn"
                onClick={onOpenSFTP}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1F2229] hover:bg-[#2A2E38] text-xs font-semibold text-[#4ADE80] border border-[#1B3F2D] transition cursor-pointer shadow-sm"
              >
                <FolderOpen className="h-3 w-3" />
                <span className="text-[11px]">Browse SFTP</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication & Quick Setup Guides (Tabs: OpenSSH, PuTTY, FileZilla, RSYNC) */}
      <div className="mt-3.5 pt-3.5 border-t border-[#1F2229]">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-[#4E80EE]" />
            <span className="text-xs font-semibold text-[#8D9199]">
              Authentication: <span className="text-[#E0E2E7]">{node.authType}</span>
            </span>
          </div>

          <div className="flex bg-[#161921] p-0.5 rounded border border-[#1F2229] text-xs">
            <button
              onClick={() => setActiveGuideTab('ssh')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                activeGuideTab === 'ssh' ? 'bg-[#1F2229] text-[#4E80EE] border border-[#30343D]' : 'text-[#8D9199] hover:text-[#E0E2E7]'
              }`}
            >
              OpenSSH Config
            </button>
            <button
              onClick={() => setActiveGuideTab('putty')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                activeGuideTab === 'putty' ? 'bg-[#1F2229] text-[#4E80EE] border border-[#30343D]' : 'text-[#8D9199] hover:text-[#E0E2E7]'
              }`}
            >
              PuTTY (.ppk)
            </button>
            <button
              onClick={() => setActiveGuideTab('filezilla')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                activeGuideTab === 'filezilla' ? 'bg-[#1F2229] text-[#4E80EE] border border-[#30343D]' : 'text-[#8D9199] hover:text-[#E0E2E7]'
              }`}
            >
              FileZilla XML
            </button>
            <button
              onClick={() => setActiveGuideTab('rsync')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                activeGuideTab === 'rsync' ? 'bg-[#1F2229] text-[#4E80EE] border border-[#30343D]' : 'text-[#8D9199] hover:text-[#E0E2E7]'
              }`}
            >
              RSYNC / SCP
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-[#0A0B0E] rounded p-3 border border-[#1F2229] text-xs">
          {activeGuideTab === 'ssh' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#BFC3C9] font-medium">Tambahkan ke file konfigurasi <code className="text-[#4E80EE] font-mono">~/.ssh/config</code>:</span>
                <button
                  id="download-ssh-config-btn"
                  onClick={() => downloadFile(generateSSHConfig(), 'config', 'text/plain')}
                  className="inline-flex items-center gap-1 text-[11px] text-[#4E80EE] hover:text-[#9EB9F7] font-semibold cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Download Config Snippet
                </button>
              </div>
              <pre className="bg-[#161921] p-2.5 rounded border border-[#1F2229] text-[#E0E2E7] font-mono text-[11px] overflow-x-auto">
                {generateSSHConfig()}
              </pre>
              <p className="text-[11px] text-[#8D9199]">
                Setelah disimpan, Anda cukup mengetik <code className="text-[#4E80EE] font-mono">ssh dewacloud-node-{node.nodeId}</code> tanpa perlu menghafal port dan hostname.
              </p>
            </div>
          )}

          {activeGuideTab === 'putty' && (
            <div className="space-y-2">
              <span className="text-[#BFC3C9] font-medium">Panduan Koneksi Menggunakan PuTTY / Pageant di Windows:</span>
              <ol className="list-decimal list-inside space-y-1 text-[#8D9199] text-[11px]">
                <li>Buka <strong>PuTTY Configuration</strong>.</li>
                <li>Pada <strong>Host Name (or IP address)</strong> masukkan: <code className="text-[#4E80EE] font-mono">{node.host}</code></li>
                <li>Pada <strong>Port</strong> masukkan: <code className="text-[#4ADE80] font-mono">{node.port}</code></li>
                <li>Masuk ke menu <strong>Connection &gt; Data</strong>, isi <strong>Auto-login username</strong>: <code className="text-[#BFC3C9] font-mono">{node.username}</code></li>
                <li>Masuk ke <strong>Connection &gt; SSH &gt; Auth &gt; Credentials</strong>, browse file private key <code className="text-[#FACC15] font-mono">.ppk</code> Anda.</li>
                <li>Simpan Session dengan nama <code className="text-white font-mono">Dewacloud-Node-{node.nodeId}</code> lalu klik <strong>Open</strong>.</li>
              </ol>
            </div>
          )}

          {activeGuideTab === 'filezilla' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#BFC3C9] font-medium">Impor Site Manager untuk FileZilla Client:</span>
                <button
                  id="download-filezilla-xml-btn"
                  onClick={() => downloadFile(generateFileZillaXML(), `dewacloud-node-${node.nodeId}-site.xml`, 'application/xml')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1F2229] hover:bg-[#2A2E38] text-[#4E80EE] border border-[#30343D] font-medium cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  Download FileZilla XML
                </button>
              </div>
              <p className="text-[11px] text-[#8D9199]">
                Di FileZilla, buka menu <strong>File &gt; Import &gt; FileZilla Site Manager XML</strong> dan pilih file yang didownload. FileZilla akan langsung menghubungkan SFTP ke remote root path <code className="text-[#4E80EE] font-mono">{node.path}</code>.
              </p>
            </div>
          )}

          {activeGuideTab === 'rsync' && (
            <div className="space-y-2">
              <span className="text-[#BFC3C9] font-medium">Sinkronisasi Folder & File Cepat (RSYNC & SCP):</span>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="bg-[#161921] p-2 rounded border border-[#1F2229]">
                  <span className="text-[#545963]"># Upload folder lokal ke server:</span>
                  <div className="text-[#4E80EE] select-all">
                    rsync -avz -e &quot;ssh -p {node.port}&quot; ./dist/ {node.username}@{node.host}:/var/www/dewacloud-app/
                  </div>
                </div>
                <div className="bg-[#161921] p-2 rounded border border-[#1F2229]">
                  <span className="text-[#545963]"># Download backup database dari server:</span>
                  <div className="text-[#4ADE80] select-all">
                    scp -P {node.port} {node.username}@{node.host}:/var/backups/db-backup.sql.gz ./local-backup/
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
