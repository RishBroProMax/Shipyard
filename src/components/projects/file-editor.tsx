"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  FileCode,
  Plus,
  Upload,
  Trash2,
  Save,
  Rocket,
  CheckCircle2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";

interface ProjectFile {
  name: string;
  path: string;
  size: number;
  updatedAt: string;
}

interface FileEditorProps {
  projectId: string;
  onDeployRequested?: () => void;
  onFileSaved?: () => void;
}

export function FileEditor({ projectId, onDeployRequested, onFileSaved }: FileEditorProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("index.html");
  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch file list
  const fetchFiles = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/files`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
        if (data.files && data.files.length > 0 && !selectedFilePath) {
          setSelectedFilePath(data.files[0].path);
        }
      }
    } catch {}
  };

  // Fetch selected file content
  const fetchFileContent = async (filePath: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/files/${filePath}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
        setOriginalContent(data.content);
      }
    } catch {}
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  useEffect(() => {
    if (selectedFilePath) {
      fetchFileContent(selectedFilePath);
    }
  }, [selectedFilePath]);

  const isModified = content !== originalContent;

  const handleSave = async () => {
    if (!selectedFilePath) return;
    setIsSaving(true);
    try {
      await fetch(`/api/projects/${projectId}/files/${selectedFilePath}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setOriginalContent(content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      if (onFileSaved) onFileSaved();
      fetchFiles();
    } catch {
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndDeploy = async () => {
    await handleSave();
    if (onDeployRequested) onDeployRequested();
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    try {
      await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: newFileName.trim(), content: "" }),
      });
      const createdPath = newFileName.trim();
      setNewFileName("");
      setIsCreatingFile(false);
      await fetchFiles();
      setSelectedFilePath(createdPath);
    } catch {}
  };

  const handleDeleteFile = async (filePath: string) => {
    if (confirm(`Delete file '${filePath}'?`)) {
      try {
        await fetch(`/api/projects/${projectId}/files/${filePath}`, {
          method: "DELETE",
        });
        await fetchFiles();
        if (selectedFilePath === filePath) {
          setSelectedFilePath("index.html");
        }
      } catch {}
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append("files", fileList[i]);
    }

    try {
      await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        body: formData,
      });
      await fetchFiles();
      if (fileList[0]) {
        setSelectedFilePath(fileList[0].name);
      }
    } catch {
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith(".html") || name.endsWith(".htm")) return "🌐";
    if (name.endsWith(".css")) return "🎨";
    if (name.endsWith(".js") || name.endsWith(".ts")) return "⚡";
    if (name.endsWith(".json")) return "⚙️";
    return "📄";
  };

  return (
    <div className="h-[650px] border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950 flex flex-col md:flex-row">
      {/* Left Sidebar: File Tree */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col bg-zinc-950/80">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-200 font-mono">Project Files</span>
          </div>

          <div className="flex items-center gap-1">
            <label
              title="Upload HTML/CSS/JS files"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".html,.htm,.css,.js,.ts,.json,.txt,.svg"
              />
            </label>
            <button
              onClick={() => setIsCreatingFile(true)}
              title="Create new file"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* New File Input */}
        {isCreatingFile && (
          <form onSubmit={handleCreateFile} className="p-2 border-b border-zinc-800 bg-zinc-900">
            <input
              type="text"
              autoFocus
              placeholder="e.g. style.css"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full px-2 py-1 bg-black border border-zinc-700 rounded text-xs text-zinc-200 font-mono focus:outline-none"
            />
            <div className="flex justify-end gap-1 mt-1">
              <button
                type="button"
                onClick={() => setIsCreatingFile(false)}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 px-1.5 py-0.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-[10px] bg-zinc-200 text-zinc-950 font-semibold px-2 py-0.5 rounded"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 text-xs font-mono">
          {files.map((file) => {
            const isSelected = selectedFilePath === file.path;
            return (
              <div
                key={file.path}
                onClick={() => setSelectedFilePath(file.path)}
                className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-zinc-800 text-zinc-100 font-medium"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">{getFileIcon(file.name)}</span>
                  <span className="truncate">{file.path}</span>
                </div>

                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100">
                  <span className="text-[10px] text-zinc-500">
                    {(file.size / 1024).toFixed(1)}k
                  </span>
                  {file.path !== "index.html" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.path);
                      }}
                      className="text-zinc-600 hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Code Editor */}
      <div className="flex-1 flex flex-col bg-black">
        {/* Editor Controls Bar */}
        <div className="px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-zinc-300 font-semibold">{selectedFilePath || "No file selected"}</span>
            {isModified && (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes"></span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving || !isModified}
              className="px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            <button
              onClick={handleSaveAndDeploy}
              disabled={isSaving}
              className="px-3 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Save & Redeploy</span>
            </button>
          </div>
        </div>

        {/* Text Area / Code Buffer */}
        <div className="flex-1 relative flex">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            className="flex-1 p-4 bg-black text-zinc-200 font-mono text-xs leading-relaxed resize-none focus:outline-none selection:bg-zinc-800"
            placeholder="Write your HTML, CSS, or JavaScript code here..."
          />
        </div>
      </div>
    </div>
  );
}
