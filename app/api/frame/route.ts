import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../utils/connectDb';
import Opinion from '../../model/Opinion.js';

const NEXT_PUBLIC_URL = process.env.APP_URL;

connectDB();

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: number | undefined;
  let index: number = 1;
  let label: string = '';

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid) {
    accountAddress = message.interactor.fid;
  }

  interface Emotion {
    label: string;
  }

  const emotions: Emotion[] = [
    { label: 'Extreme Fear' },
    { label: 'Fear' },
    { label: 'Greed' },
    { label: 'Extreme Greed' },
  ];

  function getLabelByIndex(index: number): string {
    // Make sure the index is within the valid range
    if (index >= 0 && index < emotions.length) {
      return emotions[index].label;
    } else {
      return 'Invalid index';
    }
  }
  if (body?.untrustedData) {
    index = body.untrustedData.buttonIndex - 1;
    label = getLabelByIndex(index);
    try {
      const newOpinion = new Opinion({
        accountAddress,
        label,
      });

      await newOpinion.save();
    } catch (error) {
      console.error('Error saving opinion:', error);
    }
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Your view: ${label} `,
        },
      ],
      image: `${NEXT_PUBLIC_URL}/indicator${index + 1}.jpg`,
      post_url: `${NEXT_PUBLIC_URL}/api/frame`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
