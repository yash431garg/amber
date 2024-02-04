import { ethers } from 'ethers';
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';

const NEXT_PUBLIC_URL = process.env.APP_URL;
async function handler(req, res) {
  // Configuration constants
  const EAS_CONTRACT_ADDRESS = '0xC2679fBD37d54388Ce493F1DB75320D236e1815e'; // Sepolia v0.26 address

  try {
    // Initialize provider and signer
    const provider = new ethers.JsonRpcProvider(process.env.QUICKNODE_ENDPOINT);
    const signer = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(signer);

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder(
      'uint256 pollId, string about, string feeling, string dateOfPoll',
    );
    const encodedData = schemaEncoder.encodeData([
      { name: 'pollId', value: '2', type: 'uint256' },
      { name: 'about', value: 'Crypto', type: 'string' },
      { name: 'feeling', value: 'Neutral', type: 'string' },
      { name: 'dateOfPoll', value: '4th Feb 2025', type: 'string' },
    ]);

    const schemaUID = '0x32bb7727b5d0ba7f8851cc67439dfbc90ec1549a749ef329e42c0c298868c627';

    // Send transaction
    const tx = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: '0x229922ef85a6660054F0e6cF67b3580635056c15',
        expirationTime: 0,
        revocable: true,
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();
    console.log('New attestation UID:', newAttestationUID);

    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Save chain`,
          },
        ],
        image: `${NEXT_PUBLIC_URL}/indicator${1}.png`,
      }),
    );

    // res.status(200).json({ message: 'Attestation successful', attestationUID: newAttestationUID });
  } catch (error) {
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [
          {
            label: `Error`,
          },
        ],
        image: `${NEXT_PUBLIC_URL}/indicator${1}.png`,
      }),
    );
    // res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function POST() {
  return handler();
}
