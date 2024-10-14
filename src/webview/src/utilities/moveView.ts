import {
  Aptos,
  EntryFunctionArgumentTypes,
  InputViewFunctionData,
  MoveValue,
  SimpleEntryFunctionArgumentTypes,
} from '@aptos-labs/ts-sdk';
import { vscode } from './vscode';
import { COMMENDS } from './commends';

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
    const res = await client.view({ payload });
    vscode.postMessage({
      command: COMMENDS.OutputInfo,
      data: JSON.stringify(res, null, 4),
    });
    return res;
  } catch (error) {
    vscode.postMessage({
      command: COMMENDS.OutputError,
      data: JSON.stringify(error, null, 4),
    });
    throw new Error(`${error}`);
  }
};
