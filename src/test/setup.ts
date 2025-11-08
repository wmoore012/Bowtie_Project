import '@testing-library/jest-dom';

// Minimal polyfill for ResizeObserver required by @xyflow/react in jsdom
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as any).ResizeObserver = ResizeObserver as any;
}
