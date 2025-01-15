import { Aptos, MoveModuleBytecode } from '@aptos-labs/ts-sdk';
import { vscode } from './vscode';
import { COMMANDS } from './commands';

export const loadPackageData = async (
  client: Aptos | undefined,
  objectId: string,
): Promise<{ [x: string]: MoveModuleBytecode } | undefined> => {
  if (client) {
    try {
      const temp: MoveModuleBytecode[] = await client.getAccountModules({
        accountAddress: objectId,
      });
      const modules: { [x: string]: MoveModuleBytecode } = {};
      temp
        .filter((item) => item.abi)
        .forEach((item) => (modules[item.abi!.name] = item));
      return modules;
    } catch (error) {
      vscode.postMessage({
        command: COMMANDS.MsgError,
        data: `${error}`,
      });
      return undefined;
    }
  }
  vscode.postMessage({
    command: COMMANDS.MsgError,
    data: 'client is undefined',
  });
  return undefined;
};
