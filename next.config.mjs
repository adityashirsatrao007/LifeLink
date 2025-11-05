/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_PARSE_APP_ID: process.env.NEXT_PUBLIC_PARSE_APP_ID,
    NEXT_PUBLIC_PARSE_JS_KEY: process.env.NEXT_PUBLIC_PARSE_JS_KEY,
    NEXT_PUBLIC_PARSE_SERVER_URL: process.env.NEXT_PUBLIC_PARSE_SERVER_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default nextConfig;
