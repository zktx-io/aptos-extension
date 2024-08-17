import {
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  EphemeralKeyPair,
  HexInput,
} from '@aptos-labs/ts-sdk';
import { IAccount } from '../recoil';

export const packagePublish = async (
  account: IAccount,
  dumpByte: string,
): Promise<{ hash: string; packageId: string }> => {
  if (account.nonce.privateKey && account.zkAddress) {
    try {
      const client = new Aptos(
        new AptosConfig({ network: account.nonce.network as any }),
      );
      const {
        args: [{ value: metadataBytes }, { value: moduleBytecode }],
      } = JSON.parse(dumpByte) as {
        args: [{ value: HexInput }, { value: HexInput[] }];
      };
      const transaction = await client.publishPackageTransaction({
        account: account.zkAddress.address,
        metadataBytes,
        moduleBytecode,
      });
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
      return { hash: res.hash, packageId: account.zkAddress.address };
    } catch (error) {
      throw new Error(`${error}`);
    }
  } else {
    throw new Error('account empty');
  }
};
