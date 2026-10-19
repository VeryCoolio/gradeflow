import type { StoragePort } from "./localRepository";

// Auch der Zugriff auf das Storage-Objekt kann bereits eine SecurityError werfen.
export const browserStorage: StoragePort = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
  removeItem: (key) => window.localStorage.removeItem(key),
};
