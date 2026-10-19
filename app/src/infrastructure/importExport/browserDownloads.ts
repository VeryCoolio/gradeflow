export type Download = (
  filename: string,
  contents: string | Uint8Array<ArrayBuffer>,
  mime: string,
) => void;

export const downloadText: Download = (filename, contents, mime) => {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export function fileName(value: string): string {
  return (
    value
      .trim()
      .replace(/[^\p{L}\p{N}-]+/gu, "_")
      .replace(/^_+|_+$/g, "") || "klasse"
  );
}
