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
import { ACCOUNT } from '../recoil';
import { packagePublish } from '../utilities/packagePublish';

export const Workspace = ({
  hasTerminal,
  update,
}: {
  hasTerminal: boolean;
  update: (packageId: string) => void;
}) => {
  const [account] = useRecoilState(ACCOUNT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPath, setSelectedPath] = useState<string | undefined>(
    undefined,
  );
  const [fileList, setFileList] = useState<
    { path: string; name: string; version: string }[]
  >([]);

  const [state, setState] = useState<{ [x: string]: any }>({});

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
              const tempPath =
                selectedPath && temp.find(({ path }) => path === selectedPath)
                  ? selectedPath
                  : temp[0].path;
              vscode.postMessage({
                command: COMMENDS.PackageSelect,
                data: tempPath,
              });
            } else {
              setSelectedPath(undefined);
            }
          }
          break;
        case COMMENDS.PackageSelect:
          {
            const { path } = message.data;
            setSelectedPath(path);
          }
          break;
        case COMMENDS.Deploy:
          try {
            if (!!account?.zkAddress) {
              const { packageId } = await packagePublish(account, message.data);
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
    setState(vscode.getState() as { [x: string]: any } | {});

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [account, selectedPath, update]);

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
        value={selectedPath}
        onChange={(e) => {
          if (e.target) {
            const path = (e.target as HTMLInputElement).value;
            path &&
              vscode.postMessage({
                command: COMMENDS.PackageSelect,
                data: path,
              });
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
          checked={state.move2}
          onChange={(e) => {
            const temp: { [x: string]: any } = vscode.getState() as any;
            vscode.setState({ ...temp, move2: (e.target as any).checked });
            setState(vscode.getState() as any);
          }}
        >
          Move 2.0
        </VSCodeCheckbox>
      </div>

      <VSCodeButton
        style={{ width: '100%', marginBottom: '8px' }}
        disabled={!hasTerminal || !selectedPath}
        onClick={() => {
          const { move2 } = vscode.getState() as any;
          vscode.postMessage({
            command: COMMENDS.Compile,
            data: {
              path: selectedPath,
              version: !move2 ? APTOS.MOVE_1 : APTOS.MOVE_2,
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
        disabled={!hasTerminal || !selectedPath}
        onClick={() => {
          vscode.postMessage({
            command: COMMENDS.UintTest,
            data: selectedPath,
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
          !selectedPath ||
          !account?.zkAddress?.address ||
          isLoading
        }
        width="100%"
        onClick={() => {
          const selected = fileList.find((item) => item.path === selectedPath);
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
