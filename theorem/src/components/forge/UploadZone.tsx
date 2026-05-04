'use client';
import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Cpu, Zap, CheckCircle, AlertCircle, X } from 'lucide-react';

type ForgeState = 'idle' | 'uploading' | 'parsing' | 'analyzing' | 'done' | 'error';

interface Props {
  onTextExtracted: (text: string, fileName: string) => void;
}

const STATE_LABELS: Record<ForgeState, string> = {
  idle: 'Drop your study material into the forge.',
  uploading: 'Uploading your material…',
  parsing: 'Extracting text from PDF…',
  analyzing: 'AI is reading your material…',
  done: 'Material processed successfully.',
  error: 'Something went wrong. Try again.',
};

const STATE_ICONS: Partial<Record<ForgeState, React.FC<{ size: number; color?: string }>>> = {
  uploading: Upload,
  parsing: FileText,
  analyzing: Cpu,
  done: CheckCircle,
  error: AlertCircle,
};

async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}

export default function UploadZone({ onTextExtracted }: Props) {
  const [state, setState] = useState<ForgeState>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) {
      setErrorMsg('Only PDF files are supported.');
      setState('error');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File must be under 20 MB.');
      setState('error');
      return;
    }

    setFileName(file.name);
    setErrorMsg('');

    try {
      setState('uploading');
      setProgress(20);
      await new Promise(r => setTimeout(r, 400));

      setState('parsing');
      setProgress(50);
      const text = await extractTextFromPDF(file);

      setState('analyzing');
      setProgress(80);
      await new Promise(r => setTimeout(r, 600));

      setProgress(100);
      setState('done');
      onTextExtracted(text, file.name);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to extract text. The PDF may be scanned/image-based.');
      setState('error');
    }
  }, [onTextExtracted]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setState('idle');
    setFileName('');
    setProgress(0);
    setErrorMsg('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const isDone = state === 'done';
  const isProcessing = ['uploading', 'parsing', 'analyzing'].includes(state);
  const IconComp = STATE_ICONS[state];

  return (
    <div>
      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => state === 'idle' && fileRef.current?.click()}
        style={{
          cursor: state === 'idle' ? 'pointer' : 'default',
          borderColor: isDone ? 'var(--success)' : state === 'error' ? 'var(--error)' : undefined,
        }}
      >
        <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
          >
            {/* Icon */}
            <div style={{
              width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isDone ? 'rgba(34,197,94,0.12)' : state === 'error' ? 'rgba(239,68,68,0.12)' : 'var(--ember-subtle)',
              border: `1px solid ${isDone ? 'rgba(34,197,94,0.3)' : state === 'error' ? 'rgba(239,68,68,0.3)' : 'var(--ember-border)'}`,
            }}>
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                >
                  {IconComp && <IconComp size={24} color="var(--ember)" />}
                </motion.div>
              ) : (
                state === 'idle' ? <Upload size={24} color="var(--ember)" /> :
                state === 'done' ? <CheckCircle size={24} color="var(--success)" /> :
                state === 'error' ? <AlertCircle size={24} color="var(--error)" /> :
                IconComp ? <IconComp size={24} color="var(--ember)" /> : null
              )}
            </div>

            {/* Label */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: isDone ? 'var(--success)' : state === 'error' ? 'var(--error)' : 'var(--text)',
                fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.95rem',
              }}>
                {STATE_LABELS[state]}
              </p>
              {fileName && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fileName}</p>
              )}
              {errorMsg && (
                <p style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '0.25rem' }}>{errorMsg}</p>
              )}
              {state === 'idle' && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  PDF files up to 20 MB
                </p>
              )}
            </div>

            {/* Actions */}
            {state === 'idle' && (
              <button
                className="btn btn-outline-ember btn-sm"
                onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
              >
                Browse file
              </button>
            )}
            {(isDone || state === 'error') && (
              <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); reset(); }}>
                <X size={14} /> Upload different file
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      {isProcessing && (
        <div style={{ marginTop: '0.75rem' }}>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'right' }}>
            {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
