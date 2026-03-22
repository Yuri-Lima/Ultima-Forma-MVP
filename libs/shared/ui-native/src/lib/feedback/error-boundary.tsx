import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { NativeErrorState } from './error-state';

interface NativeErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface NativeErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class NativeErrorBoundary extends Component<NativeErrorBoundaryProps, NativeErrorBoundaryState> {
  constructor(props: NativeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): NativeErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <NativeErrorState
          title="An unexpected error occurred"
          message={this.state.error?.message ?? 'Something went wrong'}
          onRetry={this.handleRetry}
          retryLabel="Reload"
        />
      );
    }
    return this.props.children;
  }
}
