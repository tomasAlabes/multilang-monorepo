/** @type {import('next').NextConfig} */
const nextConfig = {
  // The shared libraries ship raw TypeScript; let Next transpile them.
  transpilePackages: ["@greenhouse/ui", "@greenhouse/models", "@greenhouse/common"],
  // Emit a self-contained server bundle for the Docker runtime stage.
  output: "standalone",
};

export default nextConfig;
