import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  images: { formats: ["image/avif", "image/webp"] },
  // The workspace preview opens the dev server through the local network IP.
  // Allow it so Next can load the React and HMR chunks instead of showing a blank page.
  allowedDevOrigins: ["192.168.0.102"],
  // The JS compiler API is the stable path for TypeScript 5.x. It also avoids
  // Node 24's detached CLI parsing issue in Next 16's experimental TS runner.
  experimental: { useTypeScriptCli: false },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  },
};

export default nextConfig;
