import React, { useState } from 'react';
import { CSHARP_FILES } from '../../data/csharpCode';
import { CodeFile } from '../../types';
import { 
  Copy, 
  Check, 
  FileCode2, 
  FolderTree, 
  Download, 
  Search, 
  Layers, 
  FileText, 
  Code2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [selectedFileId, setSelectedFileId] = useState<string>(CSHARP_FILES[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const selectedFile = CSHARP_FILES.find(f => f.id === selectedFileId) || CSHARP_FILES[0];

  const categories = ['All', 'Models', 'Data', 'Program', 'Controllers', 'Views', 'Config'];

  const filteredFiles = CSHARP_FILES.filter(file => {
    const matchCategory = selectedCategory === 'All' || file.category === selectedCategory;
    const matchSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        file.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename.split('/').pop() || 'code.cs';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ASP.NET Core 8 C# Source Code Repository</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Complete, production-ready source files with EF Core 8, direct DbContext injection, Data Annotations, and Razor Views.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-emerald-300" />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                Copy File Code
              </>
            )}
          </button>
          <button
            onClick={handleDownloadFile}
            className="inline-flex items-center px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl border border-slate-300 transition"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: File Tree + Code Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: File Explorer Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 rtl:right-3 rtl:left-auto" />
            <input
              type="text"
              placeholder="Search source files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rtl:pr-9 rtl:pl-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* File list */}
          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredFiles.map(file => {
              const isSelected = file.id === selectedFileId;
              const isModel = file.category === 'Models';
              const isController = file.category === 'Controllers';
              const isView = file.category === 'Views';
              const isData = file.category === 'Data';

              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left rtl:text-right p-3 rounded-xl transition flex items-start space-x-3 rtl:space-x-reverse border ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                      : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <FileCode2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    isModel ? 'text-emerald-600' :
                    isController ? 'text-indigo-600' :
                    isView ? 'text-amber-600' :
                    isData ? 'text-blue-600' : 'text-slate-500'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold truncate block">{file.filename}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isModel ? 'bg-emerald-100 text-emerald-700' :
                        isController ? 'bg-indigo-100 text-indigo-700' :
                        isView ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {file.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{file.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg overflow-hidden flex flex-col">
          
          {/* File Top Bar */}
          <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-sm font-semibold text-slate-200">{selectedFile.filename}</span>
              <span className="text-xs text-slate-500">({selectedFile.language.toUpperCase()})</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Description banner */}
          <div className="bg-slate-850 px-5 py-2.5 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>{selectedFile.description}</span>
          </div>

          {/* Code block */}
          <div className="p-5 overflow-x-auto max-h-[620px] bg-slate-900">
            <pre className="font-mono text-xs leading-relaxed text-slate-200">
              <code>{selectedFile.code}</code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
