import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { parse } from 'smol-toml';
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeOption,
} from '@vscode/webview-ui-toolkit/react';
import { Aptos } from '@aptos-labs/ts-sdk';
import { vscode } from '../utilities/vscode';
import { COMMANDS } from '../utilities/commands';
import { SpinButton } from './SpinButton';
import { STATE } from '../recoil';
import { packagePublish } from '../utilities/packagePublish';
import {
  dataGet,
  packageAdd,
  packageSelect,
} from '../utilities/stateController';
import { getBalance } from '../utilities/getBalance';
import { loadPackageData } from '../utilities/loadPackageData';
import { runBuild, runFormatter, runProve, runTest } from '../utilities/cli';

export const Workspace = ({
  hasTerminal,
  client,
}: {
  hasTerminal: boolean;
  client: Aptos | undefined;
}) => {
  const [state, setState] = useRecoilState(STATE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<
    { path: string; name: string; version: string }[]
  >([]);

  useEffect(() => {
    const handleMessage = async (event: any) => {
      const message = event.data;
      switch (message.command) {
        case COMMANDS.PackageList:
          {
            const temp = (
              message.data as { path: string; content: string }[]
            ).map(({ path, content }) => {
              const parsed = parse(content);
              return {
                path,
                name: (parsed.package as any).name,
                version: (parsed.package as any).version,
              };
            });
            setFileList(temp);
            if (temp.length > 0) {
              const data = dataGet();
              const tempPath =
                data.path && temp.find(({ path }) => path === data.path)
                  ? data.path
                  : temp[0].path;
              setState((oldState) => ({
                ...oldState,
                ...packageSelect(tempPath),
              }));
            } else {
              setState((oldState) => ({ ...oldState, ...packageSelect() }));
            }
          }
          break;
        case COMMANDS.Deploy:
          try {
            if (!!state.account?.zkAddress && !!client) {
              const { packageId } = await packagePublish(
                state.account,
                client,
                message.data,
              );
              const balance = await getBalance(client, state.account);
              const modules = await loadPackageData(client, packageId);
              setState((oldState) =>
                modules
                  ? {
                      ...oldState,
                      balance,
                      ...packageAdd(packageId, modules),
                    }
                  : { ...oldState, balance },
              );
            }
          } catch (e) {
            console.error(e);
          } finally {
            setIsLoading(false);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, state.account]);

  return (
    <>
      <div
        style={{
          width: '100%',
          padding: '6px 0',
          fontWeight: 'bold',
          marginTop: '8px',
          marginBottom: '4px',
        }}
      >
        Workspace
        <VSCodeDivider />
      </div>
      <label style={{ fontSize: '11px', color: 'GrayText' }}>PACKAGE</label>
      <VSCodeDropdown
        style={{ width: '100%', marginBottom: '8px' }}
        value={state.path}
        disabled={!state.account || !state.account.zkAddress}
        onChange={(e) => {
          if (e.target) {
            const path = (e.target as HTMLInputElement).value;
            if (path) {
              setState((oldState) => ({ ...oldState, ...packageSelect(path) }));
              vscode.postMessage({
                command: COMMANDS.PackageSelect,
                data: path,
              });
            }
          }
        }}
      >
        {fileList.map(({ path, name, version }, index) => (
          <VSCodeOption key={index} value={path}>
            {`${name} (v${version})`}
          </VSCodeOption>
        ))}
      </VSCodeDropdown>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <VSCodeButton
          style={{ flex: 1, marginRight: '2px' }}
          disabled={
            !hasTerminal ||
            !state.account ||
            !state.account.zkAddress ||
            !state.path
          }
          onClick={() => {
            state.path &&
              vscode.postMessage({
                command: COMMANDS.CLI,
                data: runBuild(state.path),
              });
          }}
        >
          Build
        </VSCodeButton>
        <VSCodeButton
          style={{
            flex: 1,
            marginLeft: '2px',
          }}
          disabled={
            !hasTerminal ||
            !state.account ||
            !state.account.zkAddress ||
            !state.path
          }
          onClick={() => {
            state.path &&
              vscode.postMessage({
                command: COMMANDS.CLI,
                data: runProve(state.path),
              });
          }}
        >
          Prove
        </VSCodeButton>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <VSCodeButton
          style={{
            flex: 1,
            marginRight: '2px',
          }}
          disabled={
            !hasTerminal ||
            !state.account ||
            !state.account.zkAddress ||
            !state.path
          }
          onClick={() => {
            state.path &&
              vscode.postMessage({
                command: COMMANDS.CLI,
                data: runTest(state.path),
              });
          }}
        >
          Test
        </VSCodeButton>
        <VSCodeButton
          style={{
            flex: 1,
            marginLeft: '2px',
          }}
          disabled={
            !hasTerminal ||
            !state.account ||
            !state.account.zkAddress ||
            !state.path
          }
          onClick={() => {
            state.path &&
              vscode.postMessage({
                command: COMMANDS.CLI,
                data: runFormatter(state.path),
              });
          }}
        >
          FMT
        </VSCodeButton>
      </div>

      <SpinButton
        title="Deploy"
        spin={isLoading}
        disabled={
          !client ||
          !hasTerminal ||
          !state.path ||
          !state.account?.zkAddress?.address ||
          isLoading
        }
        width="100%"
        bgColor="#ff9800"
        onClick={() => {
          const selected = fileList.find((item) => item.path === state.path);
          if (selected) {
            setIsLoading(true);
            vscode.postMessage({
              command: COMMANDS.Deploy,
              data: selected.path,
            });
          }
        }}
      />
    </>
  );
};
