import '@testing-library/jest-dom/vitest';

// Robust localStorage polyfill for Node/jsdom where methods may be missing
(() => {
  try {
    const w: any = window;
    const ls = w.localStorage;
    const needsPatch = !ls ||
      typeof ls.getItem !== 'function' ||
      typeof ls.setItem !== 'function' ||
      typeof ls.removeItem !== 'function' ||
      typeof ls.clear !== 'function' ||
      typeof ls.key !== 'function';
    if (needsPatch) {
      const store = new Map<string, string>();
      const storage: Storage = {
        get length() { return store.size as any; },
        clear() { store.clear(); },
        getItem(key: string) {
          const v = store.get(String(key));
          return v === undefined ? null : v;
        },
        key(index: number) {
          const keys = Array.from(store.keys());
          return keys[index] ?? null;
        },
        removeItem(key: string) { store.delete(String(key)); },
        setItem(key: string, value: string) { store.set(String(key), String(value)); },
      } as any;
      Object.defineProperty(w, 'localStorage', { value: storage, configurable: true });
    }
  } catch {}
})();


// Minimal polyfill for ResizeObserver required by @xyflow/react in jsdom
if (!('ResizeObserver' in globalThis)) {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as any).ResizeObserver = ResizeObserver as any;
}

// Provide non-zero layout metrics so libraries that measure containers (e.g., React Flow)
// can render in jsdom. We only override for React Flow containers to minimize side effects.
(() => {
  const proto = (globalThis as any).HTMLElement?.prototype;
  if (!proto) return;
  const originalGetBoundingClientRect = proto.getBoundingClientRect;
  Object.defineProperty(proto, 'getBoundingClientRect', {
    configurable: true,
    value: function getBoundingClientRectPatched(this: HTMLElement) {
      const cl = (this as HTMLElement).classList;
      if (cl && (cl.contains('react-flow') || cl.contains('react-flow__renderer') || cl.contains('react-flow__pane'))) {
        return {
          x: 0,
          y: 0,
          width: 1024,
          height: 768,
          top: 0,
          left: 0,
          right: 1024,
          bottom: 768,
          toJSON() {},
        } as DOMRect;
      }
      return originalGetBoundingClientRect.call(this);
    },
  });

  // Offsets used by some libraries; give them sane defaults
  Object.defineProperty(proto, 'offsetWidth', { configurable: true, get() { return 1024; } });
  Object.defineProperty(proto, 'offsetHeight', { configurable: true, get() { return 768; } });
})();
