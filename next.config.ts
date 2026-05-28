import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Avatares Google (Auth.js OAuth) e imagens externas em argumentos.
    // remotePatterns com hostname "**" libera qualquer host HTTPS — aceitável porque
    // argumentos só armazenam URL, e next/image faz proxy/otimização.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
  poweredByHeader: false,
};

export default nextConfig;
