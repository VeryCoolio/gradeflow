import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";

function renderStartupError(error) {
  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === "string"
        ? error
        : JSON.stringify(error, null, 2);

  document.body.innerHTML = `
    <div style="min-height:100vh;padding:32px;font-family:Segoe UI, Arial, sans-serif;background:#f6efe3;color:#20354a;">
      <div style="max-width:920px;margin:0 auto;background:#fff;border-radius:20px;padding:24px;box-shadow:0 20px 60px rgba(32,53,74,0.12);">
        <h1 style="margin:0 0 12px;font-size:28px;">Die Desktop-App konnte nicht starten.</h1>
        <p style="margin:0 0 16px;line-height:1.5;">
          Es ist beim Laden ein technischer Fehler aufgetreten. Diese Meldung hilft beim Beheben.
        </p>
        <pre style="white-space:pre-wrap;word-break:break-word;background:#f8fafc;border-radius:12px;padding:16px;overflow:auto;">${message}</pre>
      </div>
    </div>
  `;
}

window.addEventListener("error", (event) => {
  renderStartupError(event.error ?? event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  renderStartupError(event.reason);
});

try {
  if (window.location.protocol !== "file:") {
    registerSW({ immediate: true });
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  renderStartupError(error);
}
