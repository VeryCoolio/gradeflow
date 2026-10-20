import { useCallback, useEffect, useRef, useState } from "react";
import type { StoragePort } from "../infrastructure/local/localRepository";
import type { NotebookV1 } from "../infrastructure/local/schema";
import {
  readWorkspacePosition,
  resolveWorkspace,
  workspaceHash,
  WORKSPACE_STORAGE_KEY,
  type WorkspacePosition,
} from "../infrastructure/local/workspacePosition";

export function useWorkspace(
  notebook: NotebookV1 | null,
  storage: StoragePort | undefined,
  canWrite: boolean,
  syncUrl = true,
  beforeChange: () => boolean = () => true,
) {
  const [initial] = useState(() =>
    resolveWorkspace(
      readWorkspacePosition(
        storage,
        storage && syncUrl ? window.location.hash : "",
      ),
      notebook,
    ),
  );
  const [position, setPosition] = useState(initial.position);
  const [warning, setWarning] = useState(initial.notice);
  const previous = useRef<WorkspacePosition | null>(null);
  const replaceNext = useRef(false);

  const change = useCallback(
    (patch: Partial<WorkspacePosition>) => {
      if (!beforeChange()) return;
      setWarning("");
      setPosition((current) => ({ ...current, ...patch }));
    },
    [beforeChange],
  );

  useEffect(() => {
    const resolved = resolveWorkspace(position, notebook);
    if (JSON.stringify(resolved.position) !== JSON.stringify(position)) {
      replaceNext.current = true;
      setPosition(resolved.position);
      if (resolved.notice) setWarning(resolved.notice);
    }
  }, [notebook, position]);

  useEffect(() => {
    if (!storage || !notebook) return;
    const hash = workspaceHash(position);
    const old = previous.current;
    const routeChanged =
      old &&
      ["page", "classId", "view", "sessionId"].some(
        (key) =>
          old[key as keyof WorkspacePosition] !==
          position[key as keyof WorkspacePosition],
      );
    try {
      if (syncUrl && window.location.hash !== hash) {
        if (routeChanged && !replaceNext.current)
          window.history.pushState(null, "", hash);
        else window.history.replaceState(null, "", hash);
      }
    } catch {
      /* Speicherung der Position bleibt unabhängig von der Browser-Historie möglich. */
    }
    replaceNext.current = false;
    previous.current = position;
    if (canWrite) {
      try {
        storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(position));
      } catch {
        setWarning(
          "Die Arbeitsposition konnte nicht gespeichert werden. Bereits gespeicherte Eingaben bleiben erhalten.",
        );
      }
    }
  }, [position, storage, canWrite, notebook, syncUrl]);

  useEffect(() => {
    if (!storage || !syncUrl) return;
    const back = () => {
      if (!beforeChange()) {
        window.history.pushState(null, "", workspaceHash(position));
        return;
      }
      replaceNext.current = true;
      const resolved = resolveWorkspace(
        readWorkspacePosition(undefined, window.location.hash),
        notebook,
      );
      setPosition(resolved.position);
      setWarning(resolved.notice);
    };
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, [storage, notebook, syncUrl, beforeChange, position]);

  return { position, warning, change };
}
