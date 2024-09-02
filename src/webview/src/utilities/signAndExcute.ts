import {
  Aptos,
  CommittedTransactionResponse,
  Ed25519PrivateKey,
  EphemeralKeyPair,
  SimpleTransaction,
} from '@aptos-labs/ts-sdk';
import { IAccount } from '../recoil';

export const signAndExcute = async (
  account: IAccount,
  client: Aptos,
  transaction: SimpleTransaction,
): Promise<CommittedTransactionResponse> => {
  if (account.nonce.privateKey && account.zkAddress) {
    try {
      const ephemeralKeyPair = new EphemeralKeyPair({
        privateKey: new Ed25519PrivateKey(account.nonce.privateKey),
        blinder: account.nonce.randomness,
        expiryDateSecs: account.nonce.expiration,
      });
      const keylessAccount = await client.deriveKeylessAccount({
        jwt: account.zkAddress.jwt,
        ephemeralKeyPair,
      });
      const { hash } = await client.signAndSubmitTransaction({
        signer: keylessAccount,
        transaction,
      });
      const res = await client.waitForTransaction({ transactionHash: hash });
      if (!res.success) {
        throw new Error(`error: ${res.hash}`);
      }
      return res;
    } catch (error) {
      throw new Error(`${error}`);
    }
  } else {
    throw new Error('account empty');
  }
};
