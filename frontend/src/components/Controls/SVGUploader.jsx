/**
 * SVGUploader.jsx — Drag-Drop SVG Map Uploader
 */
import React, { useRef, useState, useCallback } from 'react';
import { Upload, FileImage, X } from 'lucide-react';
import useKineticStore from '../../hooks/useKineticStore';
import { useVenueGraph } from '../../hooks/useVenueGraph';

export function SVGUploader({ className = '' }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const uploadedSvgName = useKineticStore((s) => s.uploadedSvgName);
  const uploadedSvgContent = useKineticStore((s) => s.uploadedSvgContent);
  const nodes = useKineticStore((s) => s.nodes);

  const { handleSvgUpload, clearSvg } = useVenueGraph();

  const processFile = useCallback((file) => {
    setError(null);
    if (!file || !file.name.toLowerCase().endsWith('.svg')) {
      setError('Only .SVG files are accepted.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const svgText = e.target.result;

      // Validate SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      if (doc.querySelector('parsererror')) {
        setError('Invalid SVG file. Could not parse geometry.');
        return;
      }
      if (!doc.querySelector('svg')) {
        setError('No root <svg> element found in file.');
        return;
      }

      const result = handleSvgUpload(svgText, file.name);
      if (!result.success) {
        setError(result.error);
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  }, [handleSvgUpload]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {uploadedSvgContent ? (
        <div className="p-3 rounded bg-[#00F5FF]/10 border border-[#00F5FF]/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden">
              <FileImage className="w-4 h-4 text-[#00F5FF] shrink-0" />
              <span className="text-xs font-mono font-bold text-[#F0EBE3] truncate">{uploadedSvgName}</span>
            </div>
            <button
              onClick={() => { clearSvg(); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="p-1 hover:bg-[#00F5FF]/20 rounded transition-colors text-[#8A7F72] hover:text-[#F0EBE3]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-[#00F5FF] font-mono">
            ✓ Spatial mesh generated ({nodes.length} nodes parsed)
          </p>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 rounded border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
            isDragOver
              ? 'border-[#00F5FF] bg-[#00F5FF]/10'
              : 'border-[#2E2820] bg-[#1E1A17]/50 hover:border-[#00F5FF]/60'
          }`}
        >
          <Upload className="w-5 h-5 text-[#00F5FF]" />
          <p className="text-xs text-[#F0EBE3] font-mono text-center">Drag & Drop custom SVG map</p>
          <p className="text-[10px] text-[#8A7F72] font-mono">Parses bounding paths & walkable mesh</p>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".svg" className="hidden" onChange={handleFileInput} />

      {error && (
        <div className="py-2 px-3 rounded bg-[#FF2D55]/10 border border-[#FF2D55]/40">
          <p className="text-[10px] font-mono text-[#FF2D55]">{error}</p>
        </div>
      )}
    </div>
  );
}

export default SVGUploader;
