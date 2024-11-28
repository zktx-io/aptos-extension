import { MoveFunction } from '@aptos-labs/ts-sdk';

export const parameterFilter = (func: MoveFunction): string[] => {
  return func.params.filter((type) => {
    return !type.endsWith('signer');
  });
};
