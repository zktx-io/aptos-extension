import {
  Account,
  EphemeralKeyPair,
  SigningSchemeInput,
} from '@aptos-labs/ts-sdk';
import { NETWORK } from '../recoil';

export const createNonce = async (
  network: NETWORK,
): Promise<{
  nonce: string;
  expiration: number;
  randomness: string;
  ephemeralKeyPair: { publicKey: string; secretKey: string };
}> => {
  const account = Account.generate({ scheme: SigningSchemeInput.Ed25519 });
  const { expiryDateSecs, blinder, nonce } = new EphemeralKeyPair({
    privateKey: account.privateKey,
  });

  return {
    nonce,
    expiration: expiryDateSecs,
    randomness: `0x${Buffer.from(blinder).toString('hex')}`,
    ephemeralKeyPair: {
      publicKey: account.publicKey.toString(),
      secretKey: account.privateKey.toString(),
    },
  };
};
