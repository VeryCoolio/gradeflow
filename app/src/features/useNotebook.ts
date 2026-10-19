import { useEffect, useMemo, useRef, useState } from "react";
import { browserStorage } from "../infrastructure/local/browserStorage";
import {
  LocalRepository,
  NOTEBOOK_STORAGE_KEY,
} from "../infrastructure/local/localRepository";
import {
  NotebookCoordinator,
  type NotebookAccess,
} from "../infrastructure/local/notebookCoordinator";
import type { NotebookV1 } from "../infrastructure/local/schema";

export function useNotebook(injected?: LocalRepository) {
  const writeAllowed = useRef(Boolean(injected));
  const coordinator = useRef<NotebookCoordinator | null>(null);
  const repository = useMemo(
    () =>
      injected ??
      new LocalRepository(
        browserStorage,
        undefined,
        () => writeAllowed.current,
      ),
    [injected],
  );
  const [initial] = useState(() => {
    try {
      return { notebook: repository.load(), error: "" };
    } catch (error) {
      return {
        notebook: null,
        error:
          error instanceof Error
            ? error.message
            : "Die lokalen Daten können nicht gelesen werden.",
      };
    }
  });
  const [notebook, setNotebook] = useState<NotebookV1 | null>(initial.notebook);
  const [error, setError] = useState(initial.error);
  const [access, setAccess] = useState<NotebookAccess>(
    injected ? "writable" : "waiting",
  );

  useEffect(() => {
    if (injected) return;
    const refresh = () => {
      try {
        setNotebook(repository.load());
        setError("");
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Die lokalen Daten können nicht gelesen werden.",
        );
      }
    };
    const current = new NotebookCoordinator(navigator.locks, (next) => {
      writeAllowed.current = next === "writable";
      setAccess(next);
      if (next === "writable") refresh();
    });
    coordinator.current = current;
    const onStorage = (event: StorageEvent) => {
      if (event.key === NOTEBOOK_STORAGE_KEY || event.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    queueMicrotask(() => current.request());
    return () => {
      writeAllowed.current = false;
      current.stop();
      window.removeEventListener("storage", onStorage);
    };
  }, [injected, repository]);

  return {
    repository,
    notebook,
    setNotebook,
    error,
    setError,
    access,
    canWrite: access === "writable",
    requestAccess: () => coordinator.current?.request(),
  };
}
