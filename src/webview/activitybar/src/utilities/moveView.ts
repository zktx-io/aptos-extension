import {
  Aptos,
  EntryFunctionArgumentTypes,
  InputViewFunctionData,
  MoveValue,
  SimpleEntryFunctionArgumentTypes,
} from '@aptos-labs/ts-sdk';
import { vscode } from './vscode';
import { COMMANDS } from './commands';

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
      function: target as `${string}::${string}::${string}`,
      functionArguments,
    };
    const res = await client.view({ payload });
    vscode.postMessage({
      command: COMMANDS.OutputInfo,
      data: JSON.stringify(res, null, 4),
    });
    return res;
  } catch (error) {
    vscode.postMessage({
      command: COMMANDS.OutputError,
      data: JSON.stringify(error, null, 4),
    });
    throw new Error(`${error}`);
  }
};
