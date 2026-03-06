'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CSVUploaderProps {
  onUpload: (file: File, cashBalance: number) => void;
  isLoading?: boolean;
}

export default function CSVUploader({ onUpload, isLoading }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cashBalance, setCashBalance] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please upload a CSV file');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setError('');
    } else if (file) {
      setError('Please upload a CSV file');
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedFile) {
      setError('Please select a CSV file');
      return;
    }
    const balance = parseFloat(cashBalance);
    if (isNaN(balance) || balance < 0) {
      setError('Please enter a valid cash balance');
      return;
    }
    setError('');
    onUpload(selectedFile, balance);
  }, [selectedFile, cashBalance, onUpload]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: 640, margin: '0 auto' }}
    >
      {/* Upload Zone */}
      <div
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div style={{ fontSize: 48, marginBottom: 'var(--space-md)' }}>📊</div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ fontSize: 48, marginBottom: 'var(--space-md)' }}>📁</div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
                Drop your bank statement CSV here
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
                or click to browse — supports most bank export formats
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cash Balance Input */}
      <div style={{ marginTop: 'var(--space-lg)' }}>
        <label className="label">Current Cash Balance ($)</label>
        <input
          type="number"
          className="input"
          placeholder="e.g., 150000"
          value={cashBalance}
          onChange={(e) => setCashBalance(e.target.value)}
          min="0"
          step="1000"
        />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
          Enter your startup&apos;s current bank balance for accurate runway calculations
        </p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 'var(--space-md)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--status-critical-bg)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: 'var(--status-critical)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button
        className="btn btn-primary btn-lg"
        style={{ width: '100%', marginTop: 'var(--space-lg)' }}
        onClick={handleSubmit}
        disabled={isLoading || !selectedFile}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {isLoading ? (
          <>
            <span className="animate-pulse">⏳</span>
            Analyzing your finances...
          </>
        ) : (
          <>
            🚀 Analyze Financial Health
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
