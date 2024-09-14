import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  VSCodeDivider,
  VSCodeTextField,
} from '@vscode/webview-ui-toolkit/react';
import { useRecoilState } from 'recoil';
import { Aptos, AptosConfig, MoveModuleBytecode } from '@aptos-labs/ts-sdk';
import { IModule, Package } from './Package';
import { ACCOUNT } from '../recoil';
import { SpinButton } from './SpinButton';
import { vscode } from '../utilities/vscode';
import { COMMENDS } from '../utilities/commends';

export type ExplorerPackageHandles = {
  addPackage: (objectId: string) => Promise<void>;
};

export const ExplorerPackage = forwardRef<ExplorerPackageHandles>(
  (props, ref) => {
    const initialized = useRef<boolean>(false);

    const [account] = useRecoilState(ACCOUNT);
    const [client, setClinet] = useState<Aptos | undefined>(undefined);

    const [packages, setPackages] = useState<{
      [packageId: string]: {
        index: number;
        data: IModule;
      };
    }>({});
    const [packageId, setPackageId] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const loadPackageData = async (objectId: string) => {
      if (client) {
        try {
          const temp: MoveModuleBytecode[] = await client.getAccountModules({
            accountAddress: objectId,
          });
          const modules: { [x: string]: MoveModuleBytecode } = {};
          temp
            .filter((item) => item.abi)
            .forEach((item) => (modules[item.abi!.name] = item));
          vscode.postMessage({
            command: COMMENDS.PackageAdd,
            data: {
              [objectId]: { index: Date.now(), data: modules },
            },
          });
        } catch (error) {
          vscode.postMessage({
            command: COMMENDS.MsgError,
            data: `${error}`,
          });
        }
      }
    };

    useImperativeHandle(ref, () => ({
      addPackage: async (objectId: string) => {
        await loadPackageData(objectId);
      },
    }));

    useEffect(() => {
      if (account && !client) {
        setClinet(
          new Aptos(new AptosConfig({ network: account.nonce.network as any })),
        );
      }

      const handleMessage = (event: any) => {
        const message = event.data;
        switch (message.command) {
          case COMMENDS.PackageAdd:
          case COMMENDS.PackageDelete:
            setPackages(message.data.packages);
            break;
          default:
            break;
        }
      };

      window.addEventListener('message', handleMessage);

      if (!initialized.current) {
        initialized.current = true;
        vscode.postMessage({ command: COMMENDS.PackageAdd, data: {} });
      }

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, [account, client]);

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
          Package Explorer
          <VSCodeDivider />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'GrayText' }}>
            Load Package
          </label>
          <VSCodeTextField
            style={{ width: '100%', marginBottom: '8px' }}
            placeholder="Package Id"
            disabled={isLoading}
            value={packageId}
            onInput={(e) => setPackageId((e.target as HTMLInputElement).value)}
          />
          <SpinButton
            title="Load"
            spin={isLoading}
            disabled={isLoading || !client}
            width="100%"
            onClick={async () => {
              setIsLoading(true);
              await loadPackageData(packageId);
              setIsLoading(false);
            }}
          />
        </div>
        <VSCodeDivider style={{ marginTop: '10px', marginBottom: '10px' }} />
        {client &&
          Object.keys(packages)
            .sort((a, b) => packages[b].index - packages[a].index)
            .map((id, key) => (
              <Package
                key={key}
                client={client}
                packageId={id}
                data={packages[id].data}
              />
            ))}
      </>
    );
  },
);
