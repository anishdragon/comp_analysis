import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    allowedHosts: [
      "c23efbb1-5933-467c-aee7-7ab95adba659-00-pchryed3efoc.picard.replit.dev",
    ],
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 5000,
    },
  },
});
