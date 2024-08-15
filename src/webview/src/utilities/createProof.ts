import {
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  EphemeralKeyPair,
} from '@aptos-labs/ts-sdk';
import { INonce } from '../recoil';

export const createProof = async (
  { network, expiration, randomness, secretKey }: INonce,
  jwt: string,
): Promise<{ address: string }> => {
  if (secretKey) {
    const ephemeralKeyPair = new EphemeralKeyPair({
      privateKey: new Ed25519PrivateKey(secretKey),
      blinder: randomness,
      expiryDateSecs: expiration,
    });
    const aptos = new Aptos(new AptosConfig({ network: network as any }));
    const keylessAccount = await aptos.deriveKeylessAccount({
      jwt,
      ephemeralKeyPair,
    });
    return {
      address: keylessAccount.accountAddress.toString(),
    };
  }
  throw new Error('key pair error');
};
