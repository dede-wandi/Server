import React, { useState } from 'react';
import { ServerNode } from '../types';
import { 
  Sliders, 
  X, 
  Save, 
  Server, 
  ShieldCheck, 
  FileText, 
  Check, 
  Copy,
  RotateCcw
} from 'lucide-react';

interface NodeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNode: ServerNode;
  onUpdateNode: (updated: ServerNode) => void;
  onResetDefaults: () => void;
}

export const NodeSettingsModal: React.FC<NodeSettingsModalProps> = ({
  isOpen,
  onClose,
  currentNode,
  onUpdateNode,
  onResetDefaults,
}) => {
  const [formData, setFormData] = useState<ServerNode>({ ...currentNode });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // re-derive sshCommand & sftpLink if host/port/username changed
    const updated = {
      ...formData,
      sshCommand: `ssh ${formData.username}@${formData.host} -p ${formData.port}`,
      sftpLink: `${formData.username}@${formData.host}:${formData.port}`,
    };
    onUpdateNode(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0E]/80 backdrop-blur-sm p-4">
      <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0B0E] border-b border-[#1F2229]">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#4E80EE]" />
            <h3 className="text-xs font-semibold text-[#E0E2E7]">Konfigurasi Node & Kredensial Dewacloud</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8D9199] hover:text-[#E0E2E7] hover:bg-[#161921] transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[#8D9199] font-medium mb-1">Node ID</label>
              <input
                type="text"
                value={formData.nodeId}
                onChange={(e) => setFormData({ ...formData, nodeId: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] font-mono focus:outline-none focus:border-[#4E80EE]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8D9199] font-medium mb-1">Label / Nama Node</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] focus:outline-none focus:border-[#4E80EE]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="block text-[#8D9199] font-medium mb-1">Host / Gateway</label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] font-mono focus:outline-none focus:border-[#4E80EE]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8D9199] font-medium mb-1">Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] font-mono focus:outline-none focus:border-[#4E80EE]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[#8D9199] font-medium mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] font-mono focus:outline-none focus:border-[#4E80EE]"
                required
              />
            </div>
            <div>
              <label className="block text-[#8D9199] font-medium mb-1">Default Remote Path</label>
              <input
                type="text"
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] font-mono focus:outline-none focus:border-[#4E80EE]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#8D9199] font-medium mb-1">Metode Autentikasi</label>
            <input
              type="text"
              value={formData.authType}
              onChange={(e) => setFormData({ ...formData, authType: e.target.value })}
              className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-[#E0E2E7] focus:outline-none focus:border-[#4E80EE]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1F2229]">
            <button
              type="button"
              onClick={() => {
                onResetDefaults();
                onClose();
              }}
              className="inline-flex items-center gap-1 text-[#8D9199] hover:text-[#E0E2E7] cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset ke Node 51917</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-[#161921] hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] border border-[#1F2229] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#4E80EE] hover:bg-[#4E80EE]/90 text-white font-semibold cursor-pointer shadow-sm"
              >
                {savedSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
