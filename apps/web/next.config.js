/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@supabase/auth-helpers-nextjs",
    "@supabase/ssr",
    "@supabase/supabase-js",
  ],
};
export default nextConfig;
