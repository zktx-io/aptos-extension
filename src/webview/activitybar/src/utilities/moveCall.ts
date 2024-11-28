import { Aptos } from '@aptos-labs/ts-sdk';
import { signAndExcute } from './signAndExcute';
import { makeParams } from './helper';
import { IAccount } from '../recoil';

export const moveCall = async (
  client: Aptos,
  account: IAccount,
  target: string,
  parameters: string[],
  inputValues: Array<string | string[]>,
): Promise<void> => {
  if (account.nonce.privateKey && account.zkAddress) {
    try {
      const address = account.zkAddress.address;
      const transaction = await client.transaction.build.simple({
        sender: address,
        data: {
          function: target as any,
          functionArguments: inputValues.map((value, i) =>
            makeParams(parameters[i], value),
          ),
        },
      });
      await signAndExcute(account, client, transaction);
    } catch (error) {
      throw new Error(`${error}`);
    }
  } else {
    throw new Error('account empty');
  }
};
