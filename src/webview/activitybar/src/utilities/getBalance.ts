import { Aptos, APTOS_COIN } from '@aptos-labs/ts-sdk';
import BigNumber from 'bignumber.js';
import { IAccount } from '../recoil';

const APT_DECIMALS = 8;

export const getBalance = async (
  client: Aptos | undefined,
  account: IAccount | undefined,
): Promise<string | undefined> => {
  if (!!client && account && account.zkAddress && account.nonce.privateKey) {
    try {
      const balance = await client.getAccountCoinAmount({
        accountAddress: account.zkAddress.address,
        coinType: APTOS_COIN,
      });
      const bn = new BigNumber(balance).shiftedBy(-1 * APT_DECIMALS);
      return `${bn.toFormat()} APT`;
    } catch {
      return undefined;
    }
  } else {
    return undefined;
  }
};
