/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import bundleAnalyzer from "@next/bundle-analyzer";
import "./src/env.js";

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === "true",
});

/** @type {import("next").NextConfig} */
const config = {
	// Enable Next.js 15 experimental features
	experimental: {
		// Enable Partial Prerendering for better performance
		ppr: true,
		// Enable React Compiler for automatic optimizations
		reactCompiler: true,
	},
	// Optimize images
	images: {
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
	// Enable compression
	compress: true,
	// Enable turbopack for faster builds
	turbopack: {
		resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
	},
	// Bundle analyzer handled by withBundleAnalyzer wrapper
	// Optimize bundle splitting
	// webpack: (config, { dev, isServer }) => {
	//   // Optimize bundle splitting for better caching
	//   if (!dev && !isServer) {
	//     config.optimization.splitChunks = {
	//       ...config.optimization.splitChunks,
	//       cacheGroups: {
	//         ...config.optimization.splitChunks.cacheGroups,
	//         // Separate vendor chunks
	//         vendor: {
	//           test: /[/\\]node_modules[/\\]/,
	//           name: "vendors",
	//           chunks: "all",
	//           priority: 10,
	//         },
	//         // Separate React and related libraries
	//         react: {
	//           test: /[/\\]node_modules[/\\](react|react-dom|react-router)[/\\]/,
	//           name: "react",
	//           chunks: "all",
	//           priority: 20,
	//         },
	//         // Separate UI libraries
	//         ui: {
	//           test: /[/\\]node_modules[/\\](@radix-ui|lucide-react|framer-motion)[/\\]/,
	//           name: "ui",
	//           chunks: "all",
	//           priority: 15,
	//         },
	//       },
	//     };
	//   }
	//   return config;
	// },
	// Enable security headers
	headers: async () => {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
				],
			},
		];
	},
};

export default withBundleAnalyzer(config);
