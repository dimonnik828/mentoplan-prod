'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="card p-8 max-w-md w-full text-center">
        <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: 'var(--danger)' }} />
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Что-то пошло не так</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Произошла ошибка при загрузке страницы. Попробуйте обновить.
        </p>
        <button onClick={reset} className="btn-primary flex items-center gap-2 mx-auto">
          <RefreshCw size={16} /> Попробовать снова
        </button>
      </div>
    </div>
  );
}