import { useEffect, useState } from 'react';
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeOption,
} from '@vscode/webview-ui-toolkit/react';
import { Aptos, MoveFunction, MoveModuleBytecode } from '@aptos-labs/ts-sdk';
import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import { vscode } from '../utilities/vscode';
import { Function } from './Function';
import { COMMENDS } from '../utilities/commends';
import { useRecoilState } from 'recoil';
import { ACCOUNT } from '../recoil';
import { parameterFilter } from '../utilities/parameterFilter';
import { moveCall } from '../utilities/moveCall';

const cardStyles = {
  card: {
    borderRadius: '4px',
    border: '1px solid var(--vscode-editorGroup-border)',
    backgroundColor: 'var(--vscode-editor-background)',
    width: '100%',
    marginBottom: '16px',
  },
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--vscode-titleBar-activeBackground)',
    padding: '8px 12px',
    borderRadius: '4px 4px 0 0',
    height: 'auto',
  },
  label: {
    fontSize: '14px',
    color: 'var(--vscode-foreground)',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  divider: {
    width: '100%',
    marginTop: '0px',
    marginBottom: '8px',
  },
  content: {
    padding: '12px',
  },
};

type IFunctions = {
  [name: string]: MoveFunction;
};

export type IModule = {
  [name: string]: MoveModuleBytecode;
};

export const Package = ({
  client,
  packageId,
  data,
}: {
  client: Aptos;
  packageId: string;
  data: IModule;
}) => {
  const [account] = useRecoilState(ACCOUNT);
  const [modules, setModules] = useState<string[]>([]);
  const [module, setModule] = useState<string | undefined>(undefined);
  const [isExcute, setIsExcute] = useState<boolean>(false);
  const [funcWrite, setFuncWrite] = useState<IFunctions | undefined>(undefined);

  const onDelete = () => {
    vscode.postMessage({
      command: COMMENDS.PackageDelete,
      data: packageId,
    });
  };

  const onExcute = async (
    name: string,
    func: MoveFunction,
    inputValues: Array<string | string[]>,
  ) => {
    if (account && account.zkAddress && module) {
      try {
        setIsExcute(true);
        await moveCall(
          client,
          account,
          `${packageId}::${module}::${name}`,
          parameterFilter(func),
          inputValues,
        );
      } catch (e) {
        console.error(e);
      } finally {
        setIsExcute(false);
      }
    }
  };

  const selectModule = (select: string) => {
    setModule(select);
    const tempData: { [x: string]: MoveFunction } = {};
    data[select].abi!.exposed_functions.forEach(
      (item) => (tempData[item.name] = item),
    );
    const entryFunctions = Object.fromEntries(
      Object.entries(tempData).filter(([, value]) => value.is_entry),
    );
    setFuncWrite(
      Object.keys(entryFunctions).length > 0 ? entryFunctions : undefined,
    );
  };

  useEffect(() => {
    const temp = Object.keys(data).sort();
    if (temp.length > 0) {
      setModules(temp);
      selectModule(temp[0]);
    } else {
      setModules([]);
      setModule(undefined);
      setFuncWrite(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div style={cardStyles.card}>
      <div style={cardStyles.titleBar}>
        <label style={cardStyles.label}>Package</label>
        <VSCodeButton
          appearance="icon"
          onClick={onDelete}
          style={cardStyles.deleteButton}
        >
          <svg
            width="16px"
            height="16px"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.116 8l-4.558 4.558.884.884L8 8.884l4.558 4.558.884-.884L8.884 8l4.558-4.558-.884-.884L8 7.116 3.442 2.558l-.884.884L7.116 8z"
            />
          </svg>
        </VSCodeButton>
      </div>
      <VSCodeDivider style={cardStyles.divider} />
      <div style={cardStyles.content}>
        <label style={{ fontSize: '11px', color: 'GrayText' }}>
          Package Id
        </label>
        <VSCodeTextField
          style={{ width: '100%', marginBottom: '4px' }}
          readOnly
          value={packageId}
        />
        <label style={{ fontSize: '11px', color: 'GrayText' }}>Modules</label>
        <VSCodeDropdown
          style={{ width: '100%' }}
          value={module}
          onChange={(e) => {
            if (e.target) {
              const key = (e.target as HTMLInputElement).value;
              selectModule(key);
            } else {
              setModule(undefined);
              setFuncWrite(undefined);
            }
          }}
        >
          {modules.map((item, index) => (
            <VSCodeOption key={index} value={item}>
              {item}
            </VSCodeOption>
          ))}
        </VSCodeDropdown>
        <div style={{ marginTop: '16px' }}>
          {funcWrite ? (
            Object.keys(funcWrite).map((name, key) => (
              <Function
                key={key}
                isWrire={true}
                name={name}
                func={funcWrite[name]}
                isDisable={isExcute}
                onExcute={onExcute}
              />
            ))
          ) : (
            <p>No public entry functions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};