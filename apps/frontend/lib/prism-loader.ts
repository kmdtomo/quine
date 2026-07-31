type PrismOptions = {
  animationType?: "rotate" | "hover" | "3drotate";
  timeScale?: number;
  height?: number;
  baseWidth?: number;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  noise?: number;
  glow?: number;
  bloom?: number;
  hoverStrength?: number;
  inertia?: number;
  transparent?: boolean;
  suspendWhenOffscreen?: boolean;
  offset?: { x?: number; y?: number };
};

type CreatePrism = (container: HTMLElement, options?: PrismOptions) => () => void;

declare global {
  interface Window {
    __quinePrismResolve?: (fn: CreatePrism) => void;
    __quinePrismReject?: (err: unknown) => void;
  }
}

let loadPromise: Promise<CreatePrism> | null = null;

export function loadCreatePrism(): Promise<CreatePrism> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Prism loader called on server"));
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<CreatePrism>((resolve, reject) => {
    window.__quinePrismResolve = resolve;
    window.__quinePrismReject = reject;
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
import { createPrism } from "/lp/prism.js";
if (window.__quinePrismResolve) window.__quinePrismResolve(createPrism);
`;
    script.addEventListener("error", (e) => reject(e));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export type { PrismOptions };
