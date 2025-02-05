import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin("./i18n.ts");
 
const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'fseffblrcijwkkhj.public.blob.vercel-storage.com'
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