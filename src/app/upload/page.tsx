'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, FileJson, FileText, ArrowRight, Loader2, Banknote } from 'lucide-react';
import { saveAnalysis } from '@/lib/sessionStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Papa from 'papaparse';

const acceptedTypes = ['.csv', '.xlsx', '.xls', '.json'];
function getFileIcon(n: string) { if (n.endsWith('.json')) return FileJson; if (n.endsWith('.xlsx') || n.endsWith('.xls')) return FileSpreadsheet; return FileText; }
function getFileColor(n: string) { if (n.endsWith('.json')) return 'text-amber-500'; if (n.endsWith('.xlsx') || n.endsWith('.xls')) return 'text-emerald-500'; return 'text-emerald-600'; }

// Basic client-side JSON parser for transactions
function parseJSON(text: string) {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('JSON must be an array of transaction objects');
  return data.map((tx, i) => {
    const amount = tx.amount || tx.Amount || tx.debit || tx.Debit || tx.credit || tx.Credit || 0;
    const numAmt = typeof amount === 'string' ? parseFloat(amount.replace(/[,$]/g, '')) : amount;
    return {
      date: tx.date || tx.Date || '',
      description: tx.description || tx.Description || tx.narration || tx.Narration || '',
      amount: Math.abs(numAmt),
      type: (tx.type || tx.Type || (numAmt >= 0 ? 'INCOME' : 'EXPENSE')).toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE',
    };
  });
}

// Convert PapaParse result to standard format
function formatPapa(data: any[]) {
  return data.filter(r => r.Date || r.date || r.Description || r.description).map(tx => {
    const amountStr = String(tx.Amount || tx.amount || tx.Debit || tx.debit || tx.Credit || tx.credit || 0);
    const numAmt = parseFloat(amountStr.replace(/[,$]/g, ''));
    return {
      date: tx.Date || tx.date || '',
      description: tx.Description || tx.description || tx.Narration || tx.narration || '',
      amount: Math.abs(numAmt),
      type: (tx.Type || tx.type || (numAmt >= 0 ? 'INCOME' : 'EXPENSE')).toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE',
    };
  });
}

export default function UploadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cashBalance, setCashBalance] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAccepted = (f: File) => acceptedTypes.some(ext => f.name.toLowerCase().endsWith(ext));
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f && isAccepted(f)) { setSelectedFile(f); setError(''); } else setError('Upload CSV, Excel, or JSON'); }, []);
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f && isAccepted(f)) { setSelectedFile(f); setError(''); } else if (f) setError('Upload CSV, Excel, or JSON'); }, []);

  const sendToAI = async (transactions: any[], balance: number) => {
    setStatus('AI Engine formatting constraints...');
    const res = await fetch('/api/analyze-statement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions, cashBalance: balance })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to analyze data');
    if (!data.success || !data.analysis) throw new Error('AI analysis failed');
    
    saveAnalysis(data.analysis);
    setStatus('Done! Redirecting to dashboard...');
    setTimeout(() => router.push('/dashboard/overview'), 800);
  };

  const handleSubmit = async () => {
    if (!selectedFile) { setError('Please select a file'); return; }
    const balance = cashBalance ? parseFloat(cashBalance) : 0;
    if (isNaN(balance) || balance < 0) { setError('Enter a valid cash balance'); return; }
    
    setError(''); 
    setIsLoading(true);

    try {
      const fileName = selectedFile.name.toLowerCase();
      
      if (fileName.endsWith('.csv')) {
        setStatus('Parsing CSV locally (saving bandwidth)...');
        Papa.parse(selectedFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length && results.data.length === 0) {
              setError('CSV Parse Error: ' + results.errors[0].message);
              setIsLoading(false);
              return;
            }
            try {
              const txs = formatPapa(results.data);
              sendToAI(txs, balance).catch(e => { setError(e.message); setIsLoading(false); });
            } catch (e) {
              setError('Error converting CSV data formatting');
              setIsLoading(false);
            }
          },
          error: (err) => {
            setError(err.message);
            setIsLoading(false);
          }
        });
      } else if (fileName.endsWith('.json')) {
        setStatus('Parsing JSON locally...');
        const text = await selectedFile.text();
        const txs = parseJSON(text);
        await sendToAI(txs, balance);
      } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        // Fallback to server for excel conversion, then we get array, then we send to analyze-statement
        setStatus('Uploading Excel for conversion...');
        const fd = new FormData(); 
        fd.append('file', selectedFile);
        const r1 = await fetch('/api/upload', { method: 'POST', body: fd }); 
        const d1 = await r1.json(); 
        if (!r1.ok) throw new Error(d1.error);
        await sendToAI(d1.transactions, balance);
      }
    } catch (err) { 
      setStatus(''); 
      setIsLoading(false); 
      setError(err instanceof Error ? err.message : 'Error'); 
    }
  };

  const Icon = selectedFile ? getFileIcon(selectedFile.name) : Upload;
  const clr = selectedFile ? getFileColor(selectedFile.name) : 'text-emerald-300';

  return (
    <div className="min-h-screen bg-[#f6faf7]">
      <nav className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600"><Banknote className="h-3 w-3 text-white" strokeWidth={2.5} /></div>
            <span className="text-[14px] font-bold text-emerald-950">BurnSight</span>
          </Link>
        </div>
      </nav>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <h1 className="text-lg font-bold tracking-tight text-emerald-950">Upload Financial Data</h1>
          <p className="mt-1 text-sm text-emerald-700/40">CSV, Excel (.xlsx), and JSON supported.</p>
        </div>
        <div className="mb-5 flex items-center justify-center gap-2">
          {[{ l: 'CSV', c: 'bg-emerald-50 text-emerald-700 border-emerald-200' }, { l: 'Excel', c: 'bg-emerald-50 text-emerald-600 border-emerald-200' }, { l: 'JSON', c: 'bg-amber-50 text-amber-700 border-amber-200' }].map(f => (
            <span key={f.l} className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-bold', f.c)}>{f.l}</span>
          ))}
        </div>
        <div className={cn('flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all sm:py-12',
          isDragging ? 'border-emerald-400 bg-emerald-50/50' : 'border-emerald-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
        )} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
          <input ref={fileInputRef} type="file" accept={acceptedTypes.join(',')} onChange={handleFileSelect} className="hidden" />
          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div key="s" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Icon className={cn('mx-auto mb-3 h-10 w-10', clr)} strokeWidth={1.5} />
                <p className="text-sm font-bold text-emerald-900">{selectedFile.name}</p>
                <p className="mt-0.5 text-[12px] text-emerald-600/40">{(selectedFile.size / 1024).toFixed(1)} KB — click to change</p>
              </motion.div>
            ) : (
              <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Upload className="mx-auto mb-3 h-10 w-10 text-emerald-300" strokeWidth={1.5} />
                <p className="text-sm font-medium text-emerald-800">Drop file here or click to browse</p>
                <p className="mt-0.5 text-[12px] text-emerald-600/40">CSV, Excel (.xlsx), or JSON</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-5">
          <label className="mb-1.5 block text-[13px] font-medium text-emerald-800">Current Cash Balance ($) <span className="text-emerald-500/50 font-normal">(optional)</span></label>
          <input type="number" placeholder="e.g. 150000" value={cashBalance} onChange={e => setCashBalance(e.target.value)} min="0" step="1000"
            className="w-full rounded-lg border border-emerald-200 bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none placeholder:text-emerald-400/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
        </div>
        <AnimatePresence>{error && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-600">{error}</motion.div>}</AnimatePresence>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSubmit} disabled={isLoading || !selectedFile}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-40">
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> {status || 'Analyzing...'}</> : <>Analyze Financial Health <ArrowRight className="h-3.5 w-3.5" /></>}
        </motion.button>
        {status && !isLoading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center text-[13px] font-medium text-emerald-700">{status}</motion.div>}
        
        <div className="mt-10 glow-green rounded-xl border border-emerald-200/60 bg-white p-5 shadow-sm">
          <p className="mb-3 text-[13px] font-bold text-emerald-900">Supported Formats</p>
          <div className="grid grid-cols-1 gap-4 text-[12px] text-emerald-700/50 sm:grid-cols-3">
            <div><div className="mb-1 flex items-center gap-1.5 font-bold text-emerald-600"><FileText className="h-3.5 w-3.5" /> CSV</div><p>Fast client-side parse. Standard bank export.</p></div>
            <div><div className="mb-1 flex items-center gap-1.5 font-bold text-emerald-600"><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</div><p>.xlsx files. First sheet with headers used automatically.</p></div>
            <div><div className="mb-1 flex items-center gap-1.5 font-bold text-amber-600"><FileJson className="h-3.5 w-3.5" /> JSON</div><p>Array of objects with date, description, amount fields.</p></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
