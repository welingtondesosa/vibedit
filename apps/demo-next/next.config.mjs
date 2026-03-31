import { withVibedit } from '@vibedit/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withVibedit(nextConfig, {
  port: 4242,
});
