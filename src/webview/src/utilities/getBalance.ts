import { Aptos, AptosConfig, APTOS_COIN } from '@aptos-labs/ts-sdk';
import BigNumber from 'bignumber.js';
import { IAccount } from '../recoil';

const APT_DECIMALS = 8;

export const getBalance = async (
  account: IAccount | undefined,
): Promise<string | undefined> => {
  if (account && account.zkAddress && account.nonce.privateKey) {
    try {
      const client = new Aptos(
        new AptosConfig({ network: account.nonce.network as any }),
      );
      const balance = await client.getAccountCoinAmount({
        accountAddress: account.zkAddress.address,
        coinType: APTOS_COIN,
      });
      const bn = new BigNumber(balance).shiftedBy(-1 * APT_DECIMALS);
      return `${bn.toFormat()} APT`;
    } catch (error) {
      return undefined;
    }
  } else {
    return undefined;
  }
};
