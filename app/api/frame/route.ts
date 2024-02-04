// import mongoose from 'mongoose';
import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

// import connectDB from '../../utils/connectDb';

// const Opinion = mongoose.model(
//   'Opinion',
//   new mongoose.Schema({
//     newlabel: { type: String },
//     newaccountAddress: { type: Number },
//   }),
// );

const NEXT_PUBLIC_URL = process.env.APP_URL;
const WALLET_KEY = process.env.WALLET_PRIVATE_KEY || '';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: number | '';
  let index: number = 1;
  let label: string = '';

  // await connectDB();
  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid) {
    accountAddress = message.interactor.fid;
  }

  const EAS_CONTRACT_ADDRESS = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e';
  const provider = new ethers.JsonRpcProvider(process.env.QUICKNODE_ENDPOINT);
  const signer = new ethers.Wallet(WALLET_KEY, provider);
  const eas = new EAS(EAS_CONTRACT_ADDRESS);
  eas.connect(signer);
  const schemaUID = '0x32bb7727b5d0ba7f8851cc67439dfbc90ec1549a749ef329e42c0c298868c627';

  // Se

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
    // try {
    //   const newOpinion = new Opinion({
    //     newaccountAddress: accountAddress,
    //     newlabel: label,
    //   });

    //   await newOpinion.save();
    //   console.log('Opinion saved successfully');
    // } catch (error) {
    //   console.error('Error saving opinion:', error);
    // }
  }

  // Initialize SchemaEncoder with the schema string

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: '0x229922ef85a6660054F0e6cF67b3580635056c15',

      revocable: true,
      data: new SchemaEncoder(
        'uint256 pollId, string about, string feeling, string dateOfPoll',
      ).encodeData([
        { name: 'pollId', value: message?.interactor.fid || 0, type: 'uint256' },
        { name: 'about', value: 'How do you feel about Crypto 2024', type: 'string' },
        { name: 'feeling', value: label || 'MOOD', type: 'string' },
        { name: 'dateOfPoll', value: new Date().toISOString().slice(0, 10), type: 'string' },
      ]),
    },
  });

  // const newAttestationUID = await tx.wait();
  // console.log('New attestation UID:', newAttestationUID);
  console.log('error');

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Your view: ${label} `,
        },
      ],
      image: `${NEXT_PUBLIC_URL}/indicator${index + 1}.png`,
      post_url: `${NEXT_PUBLIC_URL}/api/attest`,
    }),
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
