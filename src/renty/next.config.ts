import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin("./i18n.ts");
 
const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.convex.cloud'
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1'
            }
        ]
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};
 
export default withNextIntl(nextConfig);
