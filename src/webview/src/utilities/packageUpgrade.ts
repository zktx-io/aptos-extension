import { IAccount } from '../recoil';

export const packageUpgrade = async (
  account: IAccount,
  dumpByte: string,
  upgradeToml: string,
): Promise<{ digest: string }> => {
  throw new Error();
};
