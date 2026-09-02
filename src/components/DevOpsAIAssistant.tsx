import React, { useState } from 'react';
import { ServerNode } from '../types';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Terminal, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  FileCode, 
  Bot, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface DevOpsAIAssistantProps {
  node: ServerNode;
  initialPrompt?: string;
}

export const DevOpsAIAssistant: React.FC<DevOpsAIAssistantProps> = ({ node, initialPrompt }) => {
  const [query, setQuery] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState<string>('general');

  React.useEffect(() => {
    if (initialPrompt) {
      setQuery(initialPrompt);
      handleAskAI(initialPrompt, 'log-analysis');
    }
  }, [initialPrompt]);

  const presetPrompts = [
    {
      title: 'Full Node Health Audit',
      type: 'general',
      prompt: `Lakukan audit komprehensif untuk Dewacloud Node ID ${node.nodeId} (${node.os}, 4 vCPU, 8GB RAM, 120GB NVMe). Berikan checklist kesiapan production dan rekomendasi optimasi.`,
      icon: Zap,
    },
    {
      title: 'SSH & Firewall Security Check',
      type: 'log-analysis',
      prompt: `Bagaimana cara mengamankan port SSH ${node.port} pada host ${node.host}? Buatkan konfigurasi sshd_config dan aturan UFW terbaik agar tidak mudah diserang brute force.`,
      icon: ShieldAlert,
    },
    {
      title: 'Nginx & PM2 Cluster Tuning',
      type: 'optimization',
      prompt: `Buatkan konfigurasi Nginx reverse proxy dengan caching optimal dan PM2 startup script untuk nodejs app pada spesifikasi 4 vCPU dan 8GB RAM.`,
      icon: Cpu,
    },
    {
      title: 'Automated Backup Cron Script',
      type: 'script',
      prompt: `Buatkan bash script lengkap untuk backup harian database MySQL dan folder /var/www ke remote storage dengan rotasi log 7 hari di Dewacloud.`,
      icon: FileCode,
    },
  ];

  const handleAskAI = async (customPrompt?: string, taskType?: string) => {
    const promptToSend = customPrompt || query;
    if (!promptToSend.trim()) return;

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: promptToSend,
          type: taskType || selectedTaskType,
          serverContext: node,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalysisResult(data.analysis);
      } else {
        setAnalysisResult(`❌ Gagal mengambil respon AI: ${data.error || 'Terjadi kesalahan sistem'}`);
      }
    } catch (err: any) {
      setAnalysisResult(`⚠️ Error koneksi: ${err.message}. Memuat rekomendasi offline...`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAnalysis = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#4E80EE]/10 border border-[#4E80EE]/30 text-[#4E80EE]">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#E0E2E7]">DevOps AI Diagnostic Advisor</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#4E80EE]/10 text-[#4E80EE] border border-[#4E80EE]/30">
                  Gemini Flash 3.7
                </span>
              </div>
              <p className="text-[11px] text-[#8D9199]">
                Asisten cerdas untuk troubleshooting, tuning performa Linux, pembuatan bash script, dan audit konfigurasi Dewacloud.
              </p>
            </div>
          </div>
        </div>

        {/* Preset Prompt Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3.5 pt-3.5 border-t border-[#1F2229]">
          {presetPrompts.map((p, i) => {
            const Icon = p.icon;
            return (
              <button
                key={i}
                id={`preset-prompt-${i}`}
                onClick={() => {
                  setQuery(p.prompt);
                  setSelectedTaskType(p.type);
                  handleAskAI(p.prompt, p.type);
                }}
                className="p-2.5 bg-[#0A0B0E] hover:bg-[#161921] border border-[#1F2229] hover:border-[#4E80EE]/50 rounded-lg text-left transition group cursor-pointer shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-[#E0E2E7] group-hover:text-[#4E80EE]">
                  <Icon className="h-3.5 w-3.5 text-[#4E80EE] flex-shrink-0" />
                  <span>{p.title}</span>
                </div>
                <p className="text-[10px] text-[#8D9199] line-clamp-2">{p.prompt}</p>
              </button>
            );
          })}
        </div>

        {/* Search & Prompt Input */}
        <div className="mt-3.5 flex gap-2">
          <div className="relative flex-1">
            <input
              id="ai-prompt-input"
              type="text"
              placeholder="Tanyakan masalah server, perintah bash, atau analisis performa..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              className="w-full pl-3 pr-10 py-2 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-xs text-[#E0E2E7] placeholder:text-[#545963] focus:outline-none focus:border-[#4E80EE] font-sans"
            />
          </div>
          <button
            id="ai-submit-prompt-btn"
            onClick={() => handleAskAI()}
            disabled={isLoading || !query.trim()}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md ${
              isLoading || !query.trim()
                ? 'bg-[#161921] text-[#545963] border border-[#1F2229] cursor-not-allowed'
                : 'bg-[#4E80EE] hover:bg-[#4E80EE]/90 text-white shadow-[#4E80EE]/20'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Analisis AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Response Card / Analysis Viewer */}
      {(isLoading || analysisResult) && (
        <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#1F2229]">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#4E80EE]" />
              <span className="text-xs font-semibold text-[#E0E2E7]">Hasil Analisis & Rekomendasi DevOps</span>
            </div>

            {analysisResult && (
              <button
                id="copy-ai-analysis-btn"
                onClick={copyAnalysis}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#161921] hover:bg-[#1F2229] text-xs text-[#E0E2E7] border border-[#1F2229] transition cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3 w-3 text-[#4ADE80]" />
                    <span className="text-[#4ADE80] text-[11px]">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-[#8D9199]" />
                    <span className="text-[11px]">Copy Solusi</span>
                  </>
                )}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-[#8D9199] text-xs">
              <RefreshCw className="h-6 w-6 text-[#4E80EE] animate-spin" />
              <span>Menghubungkan ke Gemini AI & memeriksa konfigurasi Node {node.nodeId}...</span>
            </div>
          ) : (
            <div className="text-xs text-[#BFC3C9] leading-relaxed font-sans prose prose-invert max-w-none space-y-3">
              <div className="bg-[#0A0B0E] p-3.5 rounded-lg border border-[#1F2229] whitespace-pre-wrap font-mono text-xs text-[#BFC3C9]">
                {analysisResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
