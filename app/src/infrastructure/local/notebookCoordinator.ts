export type NotebookAccess =
  "waiting" | "writable" | "readonly" | "unsupported" | "error";
export const NOTEBOOK_WRITER_LOCK = "gradeflow-notebook-writer-v1";

/** Ein Tab hält den Browser-Lock bis zum Schließen oder Freigeben der App. */
export class NotebookCoordinator {
  private stopped = false;
  private pending = false;
  private release: (() => void) | null = null;

  constructor(
    private readonly locks: Pick<LockManager, "request"> | undefined,
    private readonly changed: (access: NotebookAccess) => void,
  ) {}

  request(): void {
    if (this.stopped || this.pending || this.release) return;
    if (!this.locks) {
      this.changed("unsupported");
      return;
    }
    this.pending = true;
    this.changed("waiting");
    void this.locks
      .request(
        NOTEBOOK_WRITER_LOCK,
        { mode: "exclusive", ifAvailable: true },
        async (lock) => {
          if (this.stopped) return;
          if (!lock) {
            this.changed("readonly");
            return;
          }
          await new Promise<void>((resolve) => {
            this.release = resolve;
            this.changed("writable");
          });
          this.release = null;
        },
      )
      .catch(() => {
        if (!this.stopped) this.changed("error");
      })
      .finally(() => {
        this.pending = false;
      });
  }

  stop(): void {
    this.stopped = true;
    this.release?.();
  }
}
