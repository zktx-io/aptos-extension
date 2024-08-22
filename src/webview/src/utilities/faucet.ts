import { IAccount } from '../recoil';

export const faucet = async (account: IAccount): Promise<boolean> => {
  if (account.nonce.network !== 'mainnet' && account.zkAddress) {
    try {
      const amount = 10000;
      const res = await fetch(
        `https://faucet.${account.nonce.network}.aptoslabs.com/mint?amount=${amount}&address=${account.zkAddress.address}`,
        {
          method: 'POST',
        },
      );
      return !!res.ok;
    } catch (error) {
      return false;
    }
  }
  return false;
};
