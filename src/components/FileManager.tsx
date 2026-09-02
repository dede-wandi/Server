import React, { useState, useMemo } from 'react';
import { RemoteFile, ServerNode } from '../types';
import { 
  FolderTree, 
  Folder, 
  FileText, 
  FileCode, 
  File, 
  Upload, 
  Plus, 
  Edit3, 
  Download, 
  Trash2, 
  ChevronRight, 
  HardDrive, 
  Save, 
  X, 
  Check, 
  ShieldAlert,
  ArrowLeft,
  Search,
  Eye,
  EyeOff,
  CornerDownRight,
  Server,
  FolderOpen
} from 'lucide-react';

interface FileManagerProps {
  node: ServerNode;
  files: RemoteFile[];
  onSaveFile: (fileId: string, newContent: string) => void;
  onCreateFile: (name: string, type: 'file' | 'directory', path: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export const FileManager: React.FC<FileManagerProps> = ({
  node,
  files,
  onSaveFile,
  onCreateFile,
  onDeleteFile,
}) => {
  const [currentDirPath, setCurrentDirPath] = useState<string>('/');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showHidden, setShowHidden] = useState<boolean>(true);
  const [customPathInput, setCustomPathInput] = useState<string>('');
  const [isNavigatingPath, setIsNavigatingPath] = useState<boolean>(false);
  
  const [editingFile, setEditingFile] = useState<RemoteFile | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'directory'>('file');

  // Quick jump presets
  const quickJumps = [
    { label: 'root (/)', path: '/' },
    { label: `/home/${node.username}`, path: `/home/${node.username}` },
    { label: '/var/www/dewacloud-app', path: '/var/www/dewacloud-app' },
    { label: '/etc/nginx', path: '/etc/nginx' },
    { label: '/etc/ssh', path: '/etc/ssh' },
    { label: '/var/log', path: '/var/log' },
    { label: '/opt', path: '/opt' },
    { label: '/tmp', path: '/tmp' },
  ];

  // Filter files in current directory or matching search
  const visibleFiles = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return files.filter(f => {
        if (!showHidden && f.name.startsWith('.')) return false;
        return f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q);
      });
    }

    return files.filter(f => {
      if (!showHidden && f.name.startsWith('.')) return false;
      if (currentDirPath === '/') {
        return f.path.split('/').filter(Boolean).length === 1;
      }
      const parentPath = f.path.substring(0, f.path.lastIndexOf('/')) || '/';
      return parentPath === currentDirPath;
    });
  }, [files, currentDirPath, searchQuery, showHidden]);

  const pathSegments = currentDirPath.split('/').filter(Boolean);

  const handleOpenFolder = (folderPath: string) => {
    setCurrentDirPath(folderPath);
    setSearchQuery('');
  };

  const handleOpenFile = (file: RemoteFile) => {
    setEditingFile(file);
    setEditorContent(file.content || '# Empty file or binary buffer\n');
    setSaveSuccess(false);
  };

  const handleSave = () => {
    if (editingFile) {
      onSaveFile(editingFile.id, editorContent);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleDownloadFile = (file: RemoteFile) => {
    const element = document.createElement('a');
    const fileContent = file.content || `[Remote File ${file.name} from Dewacloud Node ${node.nodeId}]`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(blob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onCreateFile(newItemName.trim(), newItemType, currentDirPath);
    setNewItemName('');
    setIsCreatingNew(false);
  };

  const handleNavigateUp = () => {
    if (currentDirPath === '/') return;
    const lastSlash = currentDirPath.lastIndexOf('/');
    const parent = currentDirPath.substring(0, lastSlash) || '/';
    setCurrentDirPath(parent);
    setSearchQuery('');
  };

  const handleCustomPathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = customPathInput.trim();
    if (!target) return;
    if (!target.startsWith('/')) target = '/' + target;
    setCurrentDirPath(target);
    setIsNavigatingPath(false);
    setCustomPathInput('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: SFTP Root Info & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#0F1117] border border-[#1F2229] rounded-xl p-3.5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80]">
            <HardDrive className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-[#E0E2E7]">SFTP Remote Linux File Explorer</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161921] text-[#4E80EE] border border-[#1F2229]">
                Full System Hierarchy (/)
              </span>
            </div>
            <p className="text-[11px] text-[#8D9199]">
              Jelajahi seluruh direktori dan file server Dewacloud ({node.username}@{node.host}:{node.port})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#545963]" />
            <input
              type="text"
              placeholder="Search files or paths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-xs text-[#E0E2E7] font-mono focus:outline-none focus:border-[#4E80EE] w-44 sm:w-56"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#545963] hover:text-[#E0E2E7]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Toggle Hidden Files */}
          <button
            onClick={() => setShowHidden(!showHidden)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
              showHidden ? 'bg-[#161921] border-[#4E80EE]/40 text-[#4E80EE]' : 'bg-[#0A0B0E] border-[#1F2229] text-[#8D9199]'
            }`}
            title="Toggle Hidden Dotfiles"
          >
            {showHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{showHidden ? 'Hidden: ON' : 'Hidden: OFF'}</span>
          </button>

          {/* New Item */}
          <button
            id="create-new-file-btn"
            onClick={() => setIsCreatingNew(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4E80EE] hover:bg-[#4E80EE]/90 text-white text-xs font-medium transition cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New File / Folder</span>
          </button>
        </div>
      </div>

      {/* Quick Jump Shortcuts */}
      <div className="flex items-center gap-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-xl px-3.5 py-2 overflow-x-auto text-[11px] font-mono">
        <span className="text-[#545963] flex items-center gap-1 mr-1 flex-shrink-0">
          <FolderOpen className="h-3.5 w-3.5" />
          Quick Jumps:
        </span>
        {quickJumps.map((q) => {
          const isActive = currentDirPath === q.path && !searchQuery;
          return (
            <button
              key={q.path}
              onClick={() => handleOpenFolder(q.path)}
              className={`px-2 py-1 rounded transition flex-shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-[#4E80EE]/20 text-[#4E80EE] border border-[#4E80EE]/40 font-semibold' 
                  : 'bg-[#161921] text-[#8D9199] hover:text-[#E0E2E7] border border-[#1F2229]'
              }`}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* Breadcrumb Navigation Bar & Path Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0A0B0E] border border-[#1F2229] rounded-xl px-3.5 py-2 font-mono text-xs">
        {isNavigatingPath ? (
          <form onSubmit={handleCustomPathSubmit} className="flex-1 flex items-center gap-2">
            <span className="text-[#545963]">Go to:</span>
            <input
              type="text"
              placeholder="/etc/nginx or /var/www"
              value={customPathInput}
              onChange={(e) => setCustomPathInput(e.target.value)}
              className="flex-1 px-2.5 py-1 bg-[#161921] border border-[#4E80EE] rounded text-xs text-[#E0E2E7] font-mono focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded bg-[#4E80EE] text-white text-xs font-semibold"
            >
              Jump
            </button>
            <button
              type="button"
              onClick={() => setIsNavigatingPath(false)}
              className="p-1 rounded text-[#8D9199] hover:text-[#E0E2E7]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1.5 text-[#8D9199] overflow-x-auto flex-1">
            <button
              onClick={handleNavigateUp}
              disabled={currentDirPath === '/'}
              className={`p-1 rounded hover:bg-[#1F2229] text-[#BFC3C9] transition mr-1 ${
                currentDirPath === '/' ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title="Up to Parent Directory"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => handleOpenFolder('/')}
              className={`px-1.5 py-0.5 rounded hover:text-white transition cursor-pointer ${
                currentDirPath === '/' ? 'text-[#4E80EE] font-bold bg-[#0F1117]' : 'text-[#8D9199]'
              }`}
            >
              root (/)
            </button>

            {pathSegments.map((segment, index) => {
              const accumulatedPath = '/' + pathSegments.slice(0, index + 1).join('/');
              const isLast = index === pathSegments.length - 1;
              return (
                <React.Fragment key={accumulatedPath}>
                  <ChevronRight className="h-3.5 w-3.5 text-[#545963] flex-shrink-0" />
                  <button
                    onClick={() => handleOpenFolder(accumulatedPath)}
                    className={`px-1.5 py-0.5 rounded hover:text-white transition cursor-pointer ${
                      isLast ? 'text-[#4E80EE] font-bold bg-[#0F1117]' : 'text-[#BFC3C9]'
                    }`}
                  >
                    {segment}
                  </button>
                </React.Fragment>
              );
            })}

            <button
              onClick={() => {
                setCustomPathInput(currentDirPath);
                setIsNavigatingPath(true);
              }}
              className="p-1 text-[#545963] hover:text-[#4E80EE] transition ml-1"
              title="Type custom path"
            >
              <Edit3 className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="text-[11px] text-[#545963] font-sans flex items-center gap-3">
          {searchQuery && (
            <span className="text-[#FACC15] font-mono text-[10px] bg-[#FACC15]/10 px-2 py-0.5 rounded border border-[#FACC15]/20">
              Filter: "{searchQuery}"
            </span>
          )}
          <span>Showing {visibleFiles.length} items</span>
        </div>
      </div>

      {/* File Table / Explorer Grid */}
      <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0A0B0E] text-[#8D9199] uppercase tracking-wider text-[10px] border-b border-[#1F2229]">
              <tr>
                <th className="py-2.5 px-3.5">Name</th>
                <th className="py-2.5 px-3.5">Permissions</th>
                <th className="py-2.5 px-3.5">Owner / Group</th>
                <th className="py-2.5 px-3.5">Size</th>
                <th className="py-2.5 px-3.5">Last Modified</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2229] text-[#BFC3C9]">
              {visibleFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#545963] font-sans text-xs">
                    <p className="font-medium text-[#8D9199]">Direktori ini kosong atau tidak ada item yang cocok dengan filter.</p>
                    <p className="text-[11px] text-[#545963] mt-1">Gunakan tombol 'New File / Folder' untuk menambahkan file di direktori ini.</p>
                  </td>
                </tr>
              ) : (
                visibleFiles.map((file) => {
                  const isDir = file.type === 'directory';
                  return (
                    <tr key={file.id} className="hover:bg-[#161921]/60 transition group">
                      <td className="py-2.5 px-3.5">
                        <button
                          onClick={() => isDir ? handleOpenFolder(file.path) : handleOpenFile(file)}
                          className="flex items-center gap-2.5 text-left group-hover:text-[#4E80EE] transition cursor-pointer"
                        >
                          {isDir ? (
                            <Folder className="h-4 w-4 text-[#FACC15] fill-[#FACC15]/20 flex-shrink-0" />
                          ) : file.name.endsWith('.conf') || file.name.endsWith('.yml') || file.name.endsWith('.json') || file.name.startsWith('.') ? (
                            <FileCode className="h-4 w-4 text-[#4E80EE] flex-shrink-0" />
                          ) : file.name.endsWith('.sh') ? (
                            <FileCode className="h-4 w-4 text-[#4ADE80] flex-shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 text-[#8D9199] flex-shrink-0" />
                          )}
                          <div className="flex flex-col">
                            <span className={`font-semibold ${isDir ? 'text-[#FACC15]' : 'text-[#E0E2E7]'}`}>
                              {file.name}
                            </span>
                            {searchQuery && (
                              <span className="text-[10px] text-[#545963] font-mono">
                                {file.path}
                              </span>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#8D9199]">
                        <span className="bg-[#0A0B0E] px-2 py-0.5 rounded border border-[#1F2229] text-[10px]">
                          {file.permissions}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[#8D9199]">
                        {file.owner}:{file.group}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#8D9199] font-medium">
                        {isDir ? '-' : file.sizeFormatted}
                      </td>
                      <td className="py-2.5 px-3.5 text-[#8D9199]">
                        {file.modified}
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isDir && (
                            <>
                              <button
                                id={`download-file-${file.id}`}
                                onClick={() => handleDownloadFile(file)}
                                className="p-1.5 rounded hover:bg-[#1F2229] text-[#8D9199] hover:text-[#4ADE80] transition cursor-pointer"
                                title="Download File"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              <button
                                id={`edit-file-${file.id}`}
                                onClick={() => handleOpenFile(file)}
                                className="p-1.5 rounded hover:bg-[#1F2229] text-[#4E80EE] hover:text-white transition cursor-pointer"
                                title="Edit in Web Editor"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            id={`delete-file-${file.id}`}
                            onClick={() => onDeleteFile(file.id)}
                            className="p-1.5 rounded hover:bg-[#1F2229] text-[#545963] hover:text-[#F87171] transition cursor-pointer"
                            title="Delete File"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Editor Modal for Remote Files */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0E]/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F1117] border border-[#1F2229] rounded-xl w-full max-w-4xl h-[650px] flex flex-col overflow-hidden shadow-2xl">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0A0B0E] border-b border-[#1F2229]">
              <div className="flex items-center gap-2.5">
                <FileCode className="h-4 w-4 text-[#4E80EE]" />
                <span className="font-mono text-xs font-semibold text-[#E0E2E7] truncate max-w-md">
                  {editingFile.path}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161921] border border-[#1F2229] text-[#BFC3C9]">
                  {editingFile.permissions}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs text-[#4ADE80] font-medium flex items-center gap-1 font-mono">
                    <Check className="h-3.5 w-3.5" />
                    Saved to Remote!
                  </span>
                )}
                <button
                  id="save-editor-file-btn"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4E80EE] hover:bg-[#4E80EE]/90 text-white font-medium text-xs transition cursor-pointer shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={() => setEditingFile(null)}
                  className="p-1.5 rounded text-[#8D9199] hover:text-[#E0E2E7] hover:bg-[#1F2229] transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Editor Textarea */}
            <div className="flex-1 p-4 bg-[#0A0B0E] font-mono text-xs relative">
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none text-[#E0E2E7] resize-none font-mono leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Editor Footer */}
            <div className="px-4 py-2 bg-[#0F1117] border-t border-[#1F2229] flex items-center justify-between text-xs text-[#8D9199] font-mono">
              <span>Lines: {editorContent.split('\n').length}</span>
              <span>Encoding: UTF-8 (LF)</span>
            </div>
          </div>
        </div>
      )}

      {/* New File/Folder Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0B0E]/80 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateSubmit} className="bg-[#0F1117] border border-[#1F2229] rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#E0E2E7]">Create New Item in {currentDirPath}</h3>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="p-1 rounded text-[#8D9199] hover:text-[#E0E2E7] hover:bg-[#1F2229] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#8D9199] mb-1">Item Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewItemType('file')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition ${
                      newItemType === 'file' ? 'bg-[#4E80EE]/20 border-[#4E80EE] text-[#4E80EE]' : 'bg-[#0A0B0E] border-[#1F2229] text-[#8D9199]'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    <span>File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItemType('directory')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition ${
                      newItemType === 'directory' ? 'bg-[#4E80EE]/20 border-[#4E80EE] text-[#4E80EE]' : 'bg-[#0A0B0E] border-[#1F2229] text-[#8D9199]'
                    }`}
                  >
                    <Folder className="h-4 w-4" />
                    <span>Directory / Folder</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8D9199] mb-1">Name</label>
                <input
                  type="text"
                  placeholder={newItemType === 'file' ? 'app.config.json' : 'new-folder'}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#0A0B0E] border border-[#1F2229] rounded-lg text-xs text-[#E0E2E7] font-mono focus:outline-none focus:border-[#4E80EE]"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3.5 py-1.5 rounded-lg bg-[#161921] hover:bg-[#1F2229] text-[#8D9199] hover:text-[#E0E2E7] border border-[#1F2229] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#4E80EE] hover:bg-[#4E80EE]/90 text-white text-xs font-semibold cursor-pointer"
              >
                Create {newItemType === 'file' ? 'File' : 'Folder'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
