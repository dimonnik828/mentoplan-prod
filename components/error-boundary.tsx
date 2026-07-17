'use client';

import React from 'react';
import { sendAnalyticsEvent } from '@/lib/analytics-bus';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Отправляем ошибку в аналитику через общую шину
    sendAnalyticsEvent({
      type: 'error',
      path: window.location.pathname,
      data: {
        message: error.message,
        source: 'react_error_boundary',
        componentStack: errorInfo.componentStack,
      },
    });

    // По желанию можно оставить вывод в консоль
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-12 gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Что-то пошло не так при загрузке</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-sm font-medium text-primary hover:underline"
            >
              Попробовать снова
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}