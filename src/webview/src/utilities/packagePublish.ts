import { Aptos, HexInput } from '@aptos-labs/ts-sdk';
import { IAccount } from '../recoil';
import { signAndExcute } from './signAndExcute';

export const packagePublish = async (
  account: IAccount,
  client: Aptos,
  dumpByte: string,
): Promise<{ hash: string; packageId: string }> => {
  if (account.nonce.privateKey && account.zkAddress) {
    try {
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
      const res = await signAndExcute(account, client, transaction);
      return { hash: res.hash, packageId: account.zkAddress.address };
    } catch (error) {
      throw new Error(`${error}`);
    }
  } else {
    throw new Error('account empty');
  }
};
