import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
import ErrorFallback from './lib/components/ErrorFallback.svelte';

const APP_VERSION = '0.0.1';

function logError(message: string, error: unknown): void {
  const detail = {
    message,
    stack: error instanceof Error ? error.stack : String(error),
    timestamp: new Date().toISOString(),
    appVersion: APP_VERSION,
  };
  console.error('[App Error]', detail);
}

function mountFallback(target: HTMLElement, error: Error): void {
  target.innerHTML = '';
  mount(ErrorFallback, { target, props: { error } });
}

function mountApp(): void {
  const target = document.getElementById('app');
  if (!target) {
    throw new Error('Mount target #app not found in index.html');
  }
  try {
    mount(App, { target });
  } catch (err) {
    logError('App failed to mount', err);
    mountFallback(target, err instanceof Error ? err : new Error(String(err)));
  }
}

window.onerror = (_event, _source, _lineno, _colno, error) => {
  logError('Unhandled error', error ?? 'Unknown error');
  const target = document.getElementById('app');
  if (target) {
    mountFallback(target, error instanceof Error ? error : new Error('An unexpected error occurred'));
  }
};

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  logError('Unhandled promise rejection', event.reason);
};

mountApp();
