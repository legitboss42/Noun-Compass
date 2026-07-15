import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/articles/how-to-fix-missing-noun-e-wallet-balance",
        destination: "/articles/fix-missing-noun-e-wallet-balance",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.nouncompass.me" }],
        destination: "https://nouncompass.me/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    const noIndexSocialImageHeader = {
      key: "X-Robots-Tag",
      value: "noindex, nofollow, noarchive",
    };

    return [
      { source: "/opengraph-image", headers: [noIndexSocialImageHeader] },
      { source: "/twitter-image", headers: [noIndexSocialImageHeader] },
      { source: "/articles/:slug/opengraph-image", headers: [noIndexSocialImageHeader] },
      { source: "/articles/:slug/twitter-image", headers: [noIndexSocialImageHeader] },
    ];
  },
};

export default nextConfig;
