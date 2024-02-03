import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';

const NEXT_PUBLIC_URL = process.env.APP_URL;

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Extreme Fear',
    },
    {
      label: 'Fear',
    },

    {
      label: 'Greed',
    },
    {
      label: 'Extreme Greed',
    },
  ],
  image: `${NEXT_PUBLIC_URL}/mood.jpg`,

  post_url: `${NEXT_PUBLIC_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: 'Project Amber',
  description: 'LFG',
  openGraph: {
    title: 'Project Amber',
    description: 'LFG',
    images: [`${NEXT_PUBLIC_URL}/mood.jpg`],
  },
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <>
      <h1>Project Amber</h1>
    </>
  );
}
