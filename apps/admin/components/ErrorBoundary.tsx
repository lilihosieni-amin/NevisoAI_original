'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Full-page Persian fallback for render/runtime crashes (ARD §16.2). */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    // eslint-disable-next-line no-console
    console.error('[error-boundary]', error);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            fontFamily: 'var(--font)',
            background: 'var(--paper)',
            color: 'var(--ink)',
          }}
        >
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>مشکلی پیش آمد</h1>
          <p style={{ color: 'var(--ink-3)' }}>لطفاً دوباره تلاش کنید.</p>
          <button className="btn btn-accent" onClick={this.handleRetry}>
            تلاش دوباره
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
