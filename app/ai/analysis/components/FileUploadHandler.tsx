// app/ai/analysis/components/FileUploadHandler.tsx
"use client";

import { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, FileSpreadsheet, FileArchive } from "lucide-react";
import { extractTextFromFile } from '@/app/ai/utils/fileUtils';

interface FileUploadHandlerProps {
  onTextExtracted: (text: string) => void;
  onProcessingStateChange?: (isProcessing: boolean) => void;
}

export function FileUploadHandler({ 
  onTextExtracted, 
  onProcessingStateChange 
}: FileUploadHandlerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = ".pdf,.doc,.docx,.txt";

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'txt':
        return <FileText className="h-6 w-6 text-gray-500" />;
      default:
        return <FileArchive className="h-6 w-6 text-gray-500" />;
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setError(null);
    
    // Notify parent component about processing state if the callback exists
    if (onProcessingStateChange) {
      onProcessingStateChange(true);
    }

    try {
      const text = await extractTextFromFile(selectedFile);
      
      if (!text || text.trim() === '') {
        throw new Error("No text could be extracted from this file.");
      }
      
      onTextExtracted(text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to extract text from file: ${errorMessage}`);
      // Pass empty string to indicate extraction failure
      onTextExtracted('');
      console.error(err);
    } finally {
      setLoading(false);
      // Notify parent component about processing state if the callback exists
      if (onProcessingStateChange) {
        onProcessingStateChange(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    await processFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    
    // Check if file type is accepted
    const fileType = droppedFile.name.split('.').pop()?.toLowerCase();
    if (!fileType || !acceptedFileTypes.includes(`.${fileType}`)) {
      setError(`File type .${fileType} is not supported. Please upload a PDF, Word document, or text file.`);
      return;
    }

    await processFile(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onTextExtracted('');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      
      {!file ? (
        <div 
          className="flex h-32 flex-col items-center justify-center rounded-md border-2 border-dashed p-4 cursor-pointer"
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Drag and drop your conversation file or click to upload<br />
            <span className="text-xs">(PDF, Word, or TXT)</span>
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center">
            {getFileIcon(file.name)}
            <div className="ml-2">
              <p className="text-sm font-medium truncate max-w-xs">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={removeFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {loading && (
        <div className="mt-2 text-sm text-blue-600 flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Extracting text from file...
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}