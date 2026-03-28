import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
};

export default withNextIntl(nextConfig);
