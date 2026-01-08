
import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (base64: string) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      // Extract the raw base64 data for the API
      const base64Data = base64.split(',')[1];
      onFileSelect(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center text-center
          ${dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-white'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:border-indigo-400 hover:bg-slate-50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleChange} 
        />

        {preview ? (
          <div className="w-full space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-md mx-auto max-w-md">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                 <button 
                  onClick={() => { setPreview(null); if (inputRef.current) inputRef.current.value = ''; }}
                  className="bg-white/90 hover:bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-lg"
                 >
                  Change Image
                 </button>
              </div>
            </div>
            <p className="text-slate-600 font-medium">Ready to analyze!</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Upload your textbook page</h3>
            <p className="text-slate-500 mb-8 max-w-xs">Drag and drop an image of a page, or click to browse files from your device.</p>
            <button 
              onClick={onButtonClick}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              Select File
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
