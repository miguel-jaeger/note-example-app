'use client';

import { useState, useEffect } from 'react';
import { insforgeClient } from '../lib/insforge';

interface ConnectionStatusProps {
  onStatusChange?: (isConnected: boolean) => void;
}

export function ConnectionStatus({ onStatusChange }: ConnectionStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    setErrorMessage('');

    try {
      const { ok, error } = await insforgeClient.healthCheck();

      if (ok) {
        setStatus('connected');
        onStatusChange?.(true);
      } else {
        setStatus('error');
        const errorMsg = error instanceof Error ? error.message : String(error);
        setErrorMessage(errorMsg || 'Failed to connect to InsForge');
        onStatusChange?.(false);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Network error');
      onStatusChange?.(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-colors ${
        status === 'connected'
          ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
          : status === 'error'
          ? 'bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700'
          : 'bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            status === 'connected'
              ? 'bg-green-500 animate-pulse'
              : status === 'error'
              ? 'bg-red-500'
              : 'bg-yellow-500 animate-pulse'
          }`}
        />
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              status === 'connected'
                ? 'text-green-800 dark:text-green-200'
                : status === 'error'
                ? 'text-red-800 dark:text-red-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }`}
          >
            {status === 'connected'
              ? 'Connected to InsForge'
              : status === 'error'
              ? 'Connection Error'
              : 'Checking connection...'}
          </p>
          {errorMessage && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-xs">{errorMessage}</p>
          )}
        </div>
        <div className="flex gap-2">
          {status === 'error' && (
            <button
              onClick={checkConnection}
              className="text-xs px-2 py-1 bg-white dark:bg-zinc-700 rounded hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors"
            >
              Retry
            </button>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Backend: {process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://7vxqqu38.us-east.insforge.app'}
      </div>
    </div>
  );
}
