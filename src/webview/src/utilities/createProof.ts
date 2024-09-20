import { Aptos, Ed25519PrivateKey, EphemeralKeyPair } from '@aptos-labs/ts-sdk';
import { INonce } from '../recoil';

export const createProof = async (
  client: Aptos,
  { expiration, randomness, privateKey }: INonce,
  jwt: string,
): Promise<{ address: string; proof: string; salt: string }> => {
  if (privateKey) {
    const ephemeralKeyPair = new EphemeralKeyPair({
      privateKey: new Ed25519PrivateKey(privateKey),
      blinder: randomness,
      expiryDateSecs: expiration,
    });
    const keylessAccount = await client.deriveKeylessAccount({
      jwt,
      ephemeralKeyPair,
    });
    return {
      proof: '',
      salt: '',
      address: keylessAccount.accountAddress.toString(),
    };
  }
  throw new Error('key pair error');
};
