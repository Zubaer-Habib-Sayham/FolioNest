import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  envDir: "..",
  optimizeDeps: {
    include: [
      "react-dom/server",
      "html-to-image",
      "jspdf",
      "jszip",
      "@supabase/supabase-js",
      "posthog-js",
    ],
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:3001",
      "/p": "http://127.0.0.1:3001",
      "/sitemap.xml": "http://127.0.0.1:3001",
      "/robots.txt": "http://127.0.0.1:3001",
    },
  },
});
