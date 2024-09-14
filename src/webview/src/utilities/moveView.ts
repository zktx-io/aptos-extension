import {
  Aptos,
  EntryFunctionArgumentTypes,
  InputViewFunctionData,
  MoveValue,
  SimpleEntryFunctionArgumentTypes,
} from '@aptos-labs/ts-sdk';

export const moveView = async (
  client: Aptos,
  target: string,
  functionArguments?: (
    | EntryFunctionArgumentTypes
    | SimpleEntryFunctionArgumentTypes
  )[],
): Promise<MoveValue[]> => {
  try {
    const payload: InputViewFunctionData = {
      function: target as any,
      functionArguments,
    };
    const result = await client.view({ payload });
    return result;
  } catch (error) {
    throw new Error(`${error}`);
  }
};
