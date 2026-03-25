import path from "node:path";
import type { NextConfig } from "next";

const ffmpegEsm = path.join(
  process.cwd(),
  "node_modules/@ffmpeg/ffmpeg/dist/esm/index.js",
);

const nextConfig: NextConfig = {
  serverExternalPackages: ["@ffmpeg/ffmpeg", "@ffmpeg/util", "@ffmpeg/core"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@ffmpeg/ffmpeg": ffmpegEsm,
      };
    }
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@ffmpeg/ffmpeg": "./node_modules/@ffmpeg/ffmpeg/dist/esm/index.js",
    },
  },
};

export default nextConfig;
