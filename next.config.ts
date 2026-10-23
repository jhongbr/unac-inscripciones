import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera un build "standalone" (servidor Node mínimo + solo los módulos
  // realmente usados) para que la imagen de Docker sea liviana.
  output: "standalone",
};

export default nextConfig;
