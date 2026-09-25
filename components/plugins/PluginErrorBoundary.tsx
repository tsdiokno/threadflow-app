// components/plugins/PluginErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, ShieldAlert } from 'lucide-react';

interface Props {
  pluginId?: string;
  pluginName?: string;
  fallbackMessage?: string;
  onDisablePlugin?: (pluginId: string) => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class PluginErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected plugin execution error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[PluginSandbox] Error caught in plugin "${this.props.pluginId || 'unknown'}":`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-100 flex flex-col items-center text-center gap-3 shadow-sm animate-in fade-in">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div className="max-w-md">
            <h4 className="text-sm font-bold">
              Plugin Sandboxed: {this.props.pluginName || 'Extension Error'}
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
              {this.props.fallbackMessage ||
                'This extension encountered an unexpected execution fault. The ThreadFlow runtime caught it safely so your messages and workspace remain completely intact.'}
            </p>
            {this.state.errorMessage && (
              <pre className="mt-2 text-[11px] font-mono bg-rose-100/80 dark:bg-rose-900/80 px-3 py-1.5 rounded-lg text-rose-800 dark:text-rose-200 overflow-x-auto text-left max-h-24">
                {this.state.errorMessage}
              </pre>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={this.handleRetry}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw size={13} />
              Retry Render
            </button>
            {this.props.pluginId && this.props.onDisablePlugin && (
              <button
                type="button"
                onClick={() => this.props.onDisablePlugin?.(this.props.pluginId!)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <AlertOctagon size={13} />
                Disable Plugin
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
