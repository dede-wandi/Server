import React, { useState } from 'react';
import { ServerNode, FirewallRule, SSHKeyItem, LogEntry } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  ExternalLink, 
  Radio, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Download
} from 'lucide-react';

interface SecurityFirewallProps {
  node: ServerNode;
  rules: FirewallRule[];
  sshKeys: SSHKeyItem[];
  logs: LogEntry[];
  onToggleRule: (ruleId: string) => void;
  onAddRule: (rule: Omit<FirewallRule, 'id' | 'created'>) => void;
  onDeleteRule: (ruleId: string) => void;
  onAddSSHKey: (key: Omit<SSHKeyItem, 'id' | 'created' | 'lastUsed'>) => void;
  onDeleteSSHKey: (keyId: string) => void;
}

export const SecurityFirewall: React.FC<SecurityFirewallProps> = ({
  node,
  rules,
  sshKeys,
  logs,
  onToggleRule,
  onAddRule,
  onDeleteRule,
  onAddSSHKey,
  onDeleteSSHKey,
}) => {
  const [activeTab, setActiveTab] = useState<'ports' | 'keys' | 'fail2ban'>('ports');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  // New Rule form state
  const [newRuleName, setNewRuleName] = useState('');
  const [newRulePort, setNewRulePort] = useState('');
  const [newRuleProto, setNewRuleProto] = useState<'TCP' | 'UDP' | 'TCP/UDP'>('TCP');
  const [newRuleAction, setNewRuleAction] = useState<'ALLOW' | 'DENY'>('ALLOW');
  const [newRuleSource, setNewRuleSource] = useState('Anywhere');

  // Key Generator form state
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'ED25519' | 'RSA-4096'>('ED25519');

  const copyKey = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRulePort) return;
    onAddRule({
      name: newRuleName,
      port: isNaN(Number(newRulePort)) ? newRulePort : Number(newRulePort),
      protocol: newRuleProto,
      action: newRuleAction,
      source: newRuleSource,
      status: 'active',
    });
    setNewRuleName('');
    setNewRulePort('');
    setIsAddingRule(false);
  };

  const handleGenerateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    // Generate simulated cryptographic public key fingerprint & key string
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const randomBase64 = btoa(randomHex).substring(0, 44);
    const pubKey = newKeyType === 'ED25519'
      ? `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI${randomBase64} ${newKeyName.toLowerCase().replace(/\s+/g, '-')}`
      : `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQD${randomBase64}... ${newKeyName.toLowerCase().replace(/\s+/g, '-')}`;

    onAddSSHKey({
      name: newKeyName,
      type: newKeyType,
      fingerprint: `SHA256:${randomBase64.substring(0, 32)}`,
      publicKey: pubKey,
    });

    setNewKeyName('');
    setIsGeneratingKey(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80]">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#E0E2E7]">Firewall & Security Center</h2>
            <p className="text-[11px] text-[#8D9199]">
              Pengelolaan UFW, SSH Key Pair, dan Fail2ban Brute-Force Shield untuk Node {node.nodeId}.
            </p>
          </div>
        </div>

        {/* Subtabs */}
        <div className="flex bg-[#0A0B0E] p-0.5 rounded-lg border border-[#1F2229] text-xs">
          <button
            onClick={() => setActiveTab('ports')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ports' ? 'bg-[#4E80EE] text-white shadow-sm' : 'text-[#8D9199] hover:text-[#E0E2E7]'
            }`}
          >
            <span>Firewall Rules (UFW)</span>
          </button>
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'keys' ? 'bg-[#4E80EE] text-white shadow-sm' : 'text-[#8D9199] hover:text-[#E0E2E7]'
            }`}
          >
            <span>SSH Key Pairs ({sshKeys.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('fail2ban')}
            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fail2ban' ? 'bg-[#4E80EE] text-white shadow-sm' : 'text-[#8D9199] hover:text-[#E0E2E7]'
            }`}
          >
            <span>Fail2ban Intrusion Guard</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FIREWALL & OPEN PORTS */}
      {activeTab === 'ports' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#8D9199]">Port Listening Map:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#4E80EE]/10 text-[#4E80EE] border border-[#4E80EE]/30">
                SSH Gate: 3022
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161921] text-[#BFC3C9] border border-[#1F2229]">
                HTTP: 80
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161921] text-[#BFC3C9] border border-[#1F2229]">
                HTTPS: 443
              </span>
            </div>

            <button
              id="open-add-firewall-rule-btn"
              onClick={() => setIsAddingRule(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4E80EE] hover:bg-[#4E80EE]/90 text-white text-xs font-medium transition cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Firewall Rule</span>
            </button>
          </div>

          <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0A0B0E] text-[#8D9199] uppercase tracking-wider text-[10px] border-b border-[#1F2229]">
                  <tr>
                    <th className="py-2.5 px-3.5">Service / Description</th>
                    <th className="py-2.5 px-3.5">Port</th>
                    <th className="py-2.5 px-3.5">Protocol</th>
                    <th className="py-2.5 px-3.5">Action</th>
                    <th className="py-2.5 px-3.5">Source IP</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2229] text-[#BFC3C9]">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-[#161921]/60 transition">
                      <td className="py-2.5 px-3.5 font-sans font-medium text-[#E0E2E7]">
                        {rule.name}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-[#4E80EE]">
                        {rule.port}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#8D9199]">
                        {rule.protocol}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rule.action === 'ALLOW' ? 'bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30' : 'bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/30'
                        }`}>
                          {rule.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#8D9199]">
                        {rule.source}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <button
                          onClick={() => onToggleRule(rule.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-medium transition cursor-pointer ${
                            rule.status === 'active'
                              ? 'bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30'
                              : 'bg-[#161921] text-[#8D9199] border border-[#1F2229]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${rule.status === 'active' ? 'bg-[#4ADE80]' : 'bg-[#545963]'}`}></span>
                          {rule.status}
                        </button>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          onClick={() => onDeleteRule(rule.id)}
                          className="p-1 rounded text-[#545963] hover:text-[#F87171] transition cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SSH KEY PAIRS */}
      {activeTab === 'keys' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#E0E2E7]">Authorized SSH Public Keys</h3>
              <p className="text-xs text-[#8D9199]">Kunci publik yang diizinkan untuk login ke <code className="text-[#4E80EE] font-mono">{node.username}@{node.host}:{node.port}</code></p>
            </div>

            <button
              id="open-add-ssh-key-btn"
              onClick={() => setIsGeneratingKey(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4E80EE] hover:bg-[#4E80EE]/90 text-white text-xs font-medium transition cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Generate / Add SSH Key</span>
            </button>
          </div>

          <div className="space-y-3">
            {sshKeys.map((key) => (
              <div key={key.id} className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-[#4E80EE]" />
                    <span className="text-sm font-semibold text-[#E0E2E7]">{key.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161921] text-[#BFC3C9] border border-[#1F2229]">
                      {key.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#8D9199]">
                    <span>Dibuat: {key.created}</span>
                    <span>•</span>
                    <span className="text-[#4ADE80]">{key.lastUsed}</span>
                  </div>
                </div>

                <div className="bg-[#0A0B0E] p-2.5 rounded-lg border border-[#1F2229] font-mono text-xs text-[#BFC3C9] flex items-center justify-between gap-2">
                  <code className="text-[#8D9199] truncate select-all">{key.publicKey}</code>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      id={`copy-key-${key.id}`}
                      onClick={() => copyKey(key.publicKey, key.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#161921] hover:bg-[#1F2229] text-xs text-[#E0E2E7] border border-[#1F2229] transition cursor-pointer"
                    >
                      {copiedKeyId === key.id ? (
                        <>
                          <Check className="h-3 w-3 text-[#4ADE80]" />
                          <span className="text-[#4ADE80] text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-[#8D9199]" />
                          <span className="text-[11px]">Copy Public Key</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteSSHKey(key.id)}
                      className="p-1 rounded text-[#545963] hover:text-[#F87171] transition cursor-pointer"
                      title="Remove Key"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#545963] flex items-center gap-1">
                  <span>Fingerprint:</span>
                  <span className="text-[#8D9199]">{key.fingerprint}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FAIL2BAN INTRUSION SHIELD */}
      {activeTab === 'fail2ban' && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5">
              <span className="text-xs text-[#8D9199] font-medium">Jail Status: sshd (Port 3022)</span>
              <div className="text-lg font-bold font-mono text-[#4ADE80] mt-1">ACTIVE (Protected)</div>
              <p className="text-[10px] text-[#545963] mt-1">Max retry: 5 attempts / ban time 24h</p>
            </div>
            <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5">
              <span className="text-xs text-[#8D9199] font-medium">Total Banned IPs</span>
              <div className="text-lg font-bold font-mono text-[#F87171] mt-1">18 Attacks Blocked</div>
              <p className="text-[10px] text-[#545963] mt-1">3 active IP bans right now</p>
            </div>
            <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5">
              <span className="text-xs text-[#8D9199] font-medium">Last Intrusion Check</span>
              <div className="text-lg font-bold font-mono text-[#4E80EE] mt-1">00:48:05 Today</div>
              <p className="text-[10px] text-[#545963] mt-1">Automatic packet drop via IPTables</p>
            </div>
          </div>

          <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 shadow-lg space-y-3">
            <h3 className="text-sm font-semibold text-[#E0E2E7]">Recent Security Logs & Auth Events</h3>
            <div className="space-y-2 font-mono text-xs">
              {logs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-[#0A0B0E] border border-[#1F2229] flex items-start gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                    log.level === 'warning' ? 'bg-[#FACC15]/10 text-[#FACC15] border border-[#FACC15]/30' :
                    log.level === 'error' ? 'bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/30' :
                    log.level === 'success' ? 'bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30' :
                    'bg-[#161921] text-[#8D9199]'
                  }`}>
                    {log.level}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[#8D9199] text-[11px]">
                      <span className="text-[#4E80EE] font-semibold">{log.service}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="text-[#E0E2E7] mt-0.5">{log.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {isAddingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0E]/80 backdrop-blur-sm p-4">
          <form onSubmit={handleAddRuleSubmit} className="bg-[#0F1117] border border-[#1F2229] rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-semibold text-[#E0E2E7]">Tambah Aturan Firewall UFW</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8D9199] mb-1 font-medium">Nama / Deskripsi Service</label>
                <input
                  type="text"
                  placeholder="e.g. Postgres DB / Staging Web"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] focus:outline-none focus:border-[#4E80EE]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8D9199] mb-1 font-medium">Port</label>
                  <input
                    type="text"
                    placeholder="e.g. 5432"
                    value={newRulePort}
                    onChange={(e) => setNewRulePort(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] font-mono focus:outline-none focus:border-[#4E80EE]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#8D9199] mb-1 font-medium">Protokol</label>
                  <select
                    value={newRuleProto}
                    onChange={(e: any) => setNewRuleProto(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] focus:outline-none focus:border-[#4E80EE]"
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                    <option value="TCP/UDP">TCP/UDP</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#8D9199] mb-1 font-medium">Aksi</label>
                  <select
                    value={newRuleAction}
                    onChange={(e: any) => setNewRuleAction(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] focus:outline-none focus:border-[#4E80EE]"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="DENY">DENY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#8D9199] mb-1 font-medium">Source IP</label>
                  <input
                    type="text"
                    placeholder="Anywhere atau IP tertentu"
                    value={newRuleSource}
                    onChange={(e) => setNewRuleSource(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] font-mono focus:outline-none focus:border-[#4E80EE]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingRule(false)}
                className="px-3.5 py-1.5 rounded-lg bg-[#161921] hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] border border-[#1F2229] text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#4E80EE] hover:bg-[#4E80EE]/90 text-white text-xs font-semibold cursor-pointer"
              >
                Simpan Aturan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Generate SSH Key Modal */}
      {isGeneratingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0E]/80 backdrop-blur-sm p-4">
          <form onSubmit={handleGenerateKeySubmit} className="bg-[#0F1117] border border-[#1F2229] rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-semibold text-[#E0E2E7]">Generate / Tambah SSH Key Pair</h3>
            <p className="text-xs text-[#8D9199]">
              Buat pasangan kunci OpenSSH untuk akses aman tanpa password ke server.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8D9199] mb-1 font-medium">Key Label / Identitas</label>
                <input
                  type="text"
                  placeholder="e.g. CI/CD GitHub Actions Deployer"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] focus:outline-none focus:border-[#4E80EE]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#8D9199] mb-1 font-medium">Tipe Enkripsi</label>
                <select
                  value={newKeyType}
                  onChange={(e: any) => setNewKeyType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] font-mono focus:outline-none focus:border-[#4E80EE]"
                >
                  <option value="ED25519">ED25519 (Direkomendasikan - Paling Cepat & Aman)</option>
                  <option value="RSA-4096">RSA-4096 (Kompatibilitas Legacy PuTTY/OpenSSH)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsGeneratingKey(false)}
                className="px-3.5 py-1.5 rounded-lg bg-[#161921] hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] border border-[#1F2229] text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#4E80EE] hover:bg-[#4E80EE]/90 text-white text-xs font-semibold cursor-pointer"
              >
                Generate Key Pair
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
