'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center">
            <AlertTriangle size={32} style={{ color: 'var(--danger)' }} />
            <p className="mt-3 text-sm font-medium" style={{ color: 'var(--text)' }}>
              В этом блоке произошла ошибка
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {this.state.error?.message || 'Неизвестная ошибка'}
            </p>
            <button onClick={this.handleReset} className="btn-primary mt-4">
              Попробовать снова
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}