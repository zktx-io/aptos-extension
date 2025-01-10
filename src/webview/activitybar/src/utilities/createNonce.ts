import {
  Account,
  EphemeralKeyPair,
  Hex,
  SigningSchemeInput,
} from '@aptos-labs/ts-sdk';
import { NETWORK } from '../recoil';

export const createNonce = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _network: NETWORK,
): Promise<{
  nonce: string;
  expiration: number;
  randomness: string;
  ephemeralKeyPair: { publicKey: string; privateKey: string };
}> => {
  const account = Account.generate({ scheme: SigningSchemeInput.Ed25519 });
  const { expiryDateSecs, blinder, nonce } = new EphemeralKeyPair({
    privateKey: account.privateKey,
  });

  return {
    nonce,
    expiration: expiryDateSecs,
    randomness: Hex.hexInputToString(blinder),
    ephemeralKeyPair: {
      publicKey: account.publicKey.toString(),
      privateKey: account.privateKey.toString(),
    },
  };
};
