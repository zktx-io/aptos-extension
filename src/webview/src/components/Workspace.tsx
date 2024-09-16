import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { parse } from 'smol-toml';
import {
  VSCodeButton,
  VSCodeCheckbox,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeOption,
} from '@vscode/webview-ui-toolkit/react';
import { vscode } from '../utilities/vscode';
import { APTOS, COMMENDS } from '../utilities/commends';
import { SpinButton } from './SpinButton';
import { STATE } from '../recoil';
import { packagePublish } from '../utilities/packagePublish';
import { dataGet, dataSet, packageSelect } from '../utilities/stateController';

export const Workspace = ({
  hasTerminal,
  update,
}: {
  hasTerminal: boolean;
  update: (packageId: string) => void;
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
        case COMMENDS.PackageList:
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
        case COMMENDS.Deploy:
          try {
            if (!!state.account?.zkAddress) {
              const { packageId } = await packagePublish(
                state.account,
                message.data,
              );
              update(packageId);
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
  }, [setState, state, update]);

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
        onChange={(e) => {
          if (e.target) {
            const path = (e.target as HTMLInputElement).value;
            path &&
              setState((oldState) => ({ ...oldState, ...packageSelect(path) }));
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
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: '8px',
          width: '100%',
        }}
      >
        <VSCodeCheckbox
          style={{ display: 'flex', flexDirection: 'row-reverse' }}
          checked={!!(state as any).move2}
          onChange={(e) => {
            dataSet({
              ...dataGet(),
              move2: (e.target as any).checked,
            });
            setState((oldState) => ({
              ...oldState,
              move2: (e.target as any).checked,
            }));
          }}
        >
          Move 2.0
        </VSCodeCheckbox>
      </div>

      <VSCodeButton
        style={{ width: '100%', marginBottom: '8px' }}
        disabled={!hasTerminal || !state.path}
        onClick={() => {
          vscode.postMessage({
            command: COMMENDS.Compile,
            data: {
              path: state.path,
              version: !!(state as any).move2 ? APTOS.MOVE_2 : APTOS.MOVE_1,
            },
          });
        }}
      >
        Compile
      </VSCodeButton>

      <VSCodeButton
        style={{
          width: '100%',
          marginBottom: '8px',
          backgroundColor: '#ff9800',
        }}
        disabled={!hasTerminal || !state.path}
        onClick={() => {
          vscode.postMessage({
            command: COMMENDS.UintTest,
            data: state.path,
          });
        }}
      >
        Unit Test
      </VSCodeButton>

      <SpinButton
        title="Deploy"
        spin={isLoading}
        disabled={
          !hasTerminal ||
          !state.path ||
          !state.account?.zkAddress?.address ||
          isLoading
        }
        width="100%"
        onClick={() => {
          const selected = fileList.find((item) => item.path === state.path);
          if (selected) {
            setIsLoading(true);
            vscode.postMessage({
              command: COMMENDS.Deploy,
              data: selected.path,
            });
          }
        }}
      />
    </>
  );
};
