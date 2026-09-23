import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["recharts"],
          icons: ["lucide-react"]
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globIgnores: [
          "**/impressum.html",
          "**/privacy-policy.html",
          "**/account-deletion.html",
          "**/legal-index.html"
        ],
        navigateFallbackDenylist: [
          /\/impressum\.html$/,
          /\/privacy-policy\.html$/,
          /\/account-deletion\.html$/,
          /\/legal-index\.html$/
        ]
      },
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.svg",
        "masked-icon.svg",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-maskable-512x512.png"
      ],
      manifest: {
        name: "Mündliche Notengebung",
        short_name: "Notenheft",
        description:
          "Digitales Notenheft für mündliche Mitarbeit mit Verlauf, Pufferlogik und CSV-Export.",
        theme_color: "#20354a",
        background_color: "#f6efe3",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "./",
        scope: "./",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ]
});
