import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "..", "client", "src"),
      "@shared": path.resolve(__dirname, "..", "shared"),
      "@features": path.resolve(__dirname, "..", "client", "src", "features"),
      "@components": path.resolve(__dirname, "..", "client", "src", "components"),
      "@hooks": path.resolve(__dirname, "..", "client", "src", "hooks"),
      "@services": path.resolve(__dirname, "..", "client", "src", "services"),
      "@utils": path.resolve(__dirname, "..", "client", "src", "utils"),
      "@styles": path.resolve(__dirname, "..", "client", "src", "styles"),
      "@assets": path.resolve(__dirname, "..", "client", "src", "assets")
    },
  },
  root: path.resolve(__dirname, "..", "client"),
  build: {
    outDir: path.resolve(__dirname, "..", "dist", "public"),
    emptyOutDir: true,
  },
});

