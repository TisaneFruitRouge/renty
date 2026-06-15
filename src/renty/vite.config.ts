import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const webRoot = path.resolve(__dirname, "src");
const appRoot = path.resolve(__dirname);
const rootNodeModules = path.resolve(__dirname, "../..", "node_modules");

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
  },
  optimizeDeps: {
    include: [
      "@better-auth/stripe/client",
      "@convex-dev/better-auth/client/plugins",
      "@convex-dev/better-auth/react",
      "better-auth/react",
      "convex/react",
      "convex/server",
    ],
  },
  resolve: {
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    alias: [
      { find: "react/jsx-dev-runtime", replacement: path.resolve(rootNodeModules, "react/jsx-dev-runtime.js") },
      { find: "react/jsx-runtime", replacement: path.resolve(rootNodeModules, "react/jsx-runtime.js") },
      { find: "react-dom/client", replacement: path.resolve(rootNodeModules, "react-dom/client.js") },
      { find: "react-dom", replacement: path.resolve(rootNodeModules, "react-dom/index.js") },
      { find: "react", replacement: path.resolve(rootNodeModules, "react/index.js") },
      { find: "@/components/theme-provider", replacement: path.resolve(webRoot, "components/theme-provider.tsx") },
      { find: "@/components/AppSidebar", replacement: path.resolve(webRoot, "components/AppSidebar.tsx") },
      { find: "@/components/TimeGreeting", replacement: path.resolve(webRoot, "components/TimeGreeting.tsx") },
      { find: "@/components/Link", replacement: path.resolve(webRoot, "components/Link.tsx") },
      { find: "@/components/Image", replacement: path.resolve(webRoot, "components/Image.tsx") },
      { find: "@/lib/i18n", replacement: path.resolve(webRoot, "lib/i18n.tsx") },
      { find: "@/lib/navigation", replacement: path.resolve(webRoot, "lib/navigation.ts") },
      { find: "@/lib/theme", replacement: path.resolve(webRoot, "lib/theme.tsx") },
      { find: "@/lib/auth-client", replacement: path.resolve(webRoot, "lib/auth-client.ts") },
      { find: "next/link", replacement: path.resolve(webRoot, "components/Link.tsx") },
      { find: "next/navigation", replacement: path.resolve(webRoot, "lib/navigation.ts") },
      { find: "next-intl", replacement: path.resolve(webRoot, "lib/i18n.tsx") },
      { find: "@/convex", replacement: path.resolve(appRoot, "convex") },
      { find: "@", replacement: webRoot },
    ],
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, "../..")],
    },
  },
});
