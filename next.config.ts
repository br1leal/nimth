import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fixa a raiz do projeto nesta pasta, para o Next não confundir com
  // package-lock.json de outros projetos na máquina.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
