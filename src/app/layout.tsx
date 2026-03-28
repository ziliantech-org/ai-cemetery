import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Cemetery | 赛博公墓',
  description:
    'A memorial for discontinued AI models. Light a candle, leave flowers, or press F to pay respects. 一座为已停用AI模型建造的纪念碑。',
  openGraph: {
    title: 'AI Cemetery | 赛博公墓',
    description: 'Where dead AI models rest in peace. Pay your respects.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Cemetery | 赛博公墓',
    description: 'Where dead AI models rest in peace.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
