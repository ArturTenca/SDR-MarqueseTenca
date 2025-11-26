import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api/webhook": {
        target: "https://n8n-n8n.dd8sxg.easypanel.host",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/webhook/, "/webhook/numeros"),
        secure: true,
      },
      "/api/webhook/delete": {
        target: "https://n8n-n8n.dd8sxg.easypanel.host",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/webhook\/delete/, "/webhook-test/deletanum"),
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
