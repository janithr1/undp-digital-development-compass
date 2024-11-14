/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: "akamai",
    path: "",
  },
  basePath: "/nextjs-pages",
  assetPrefix: "/nextjs-pages",
  env: {
    PASSWORD_PROTECT: process.env.NODE_ENV !== "development",
    SITE_CONFIG: process.env.ENV ?? "dev"
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

module.exports = nextConfig;