import { useEffect, useState } from 'react';
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextField,
} from '@vscode/webview-ui-toolkit/react';
import { useRecoilState } from 'recoil';
import {
  Aptos,
  MoveFunction,
  MoveModuleBytecode,
  MoveValue,
} from '@aptos-labs/ts-sdk';
import { Function } from './Function';
import { STATE } from '../recoil';
import { parameterFilter } from '../utilities/parameterFilter';
import { moveCall } from '../utilities/moveCall';
import { moveView } from '../utilities/moveView';
import { packageDelete } from '../utilities/stateController';

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

export const Package = ({
  client,
  packageId,
  data,
}: {
  client: Aptos;
  packageId: string;
  data: { [name: string]: MoveModuleBytecode };
}) => {
  const [state, setState] = useRecoilState(STATE);
  const [modules, setModules] = useState<string[]>([]);
  const [module, setModule] = useState<string | undefined>(undefined);
  const [isExcute, setIsExcute] = useState<boolean>(false);
  const [funcWrite, setFuncWrite] = useState<IFunctions | undefined>(undefined);
  const [funcRead, setFuncRead] = useState<IFunctions | undefined>(undefined);

  const onDelete = () => {
    setState((oldState) => ({ ...oldState, ...packageDelete(packageId) }));
  };

  const onExcute = async (
    name: string,
    func: MoveFunction,
    inputValues: Array<string>,
    typeArguments: string[],
  ): Promise<MoveValue[] | undefined> => {
    if (state.account && state.account.zkAddress && module) {
      try {
        setIsExcute(true);
        if (func.is_view) {
          const value = await moveView(
            client,
            `${packageId}::${module}::${name}`,
            inputValues,
          );
          setIsExcute(false);
          return value;
        }
        await moveCall(
          client,
          state.account,
          `${packageId}::${module}::${name}`,
          parameterFilter(func),
          inputValues,
          typeArguments,
        );
        setIsExcute(false);
        return undefined;
      } catch (e) {
        console.error(e);
        setIsExcute(false);
      }
    }
  };

  const selectModule = (select: string) => {
    if (data[select].abi) {
      setModule(select);
      const tempData: { [x: string]: MoveFunction } = {};
      data[select].abi!.exposed_functions.forEach(
        (item) => (tempData[item.name] = item),
      );
      const writeFunctions = Object.fromEntries(
        Object.entries(tempData).filter(
          ([, value]) =>
            value.is_entry || (value.visibility === 'public' && !value.is_view),
        ),
      );
      setFuncWrite(
        Object.keys(writeFunctions).length > 0 ? writeFunctions : undefined,
      );
      const viewFunctions = Object.fromEntries(
        Object.entries(tempData).filter(([, value]) => value.is_view),
      );
      setFuncRead(
        Object.keys(viewFunctions).length > 0 ? viewFunctions : undefined,
      );
    }
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
                isWrite={true}
                name={name}
                func={funcWrite[name]}
                isDisable={isExcute}
                onExcute={onExcute}
              />
            ))
          ) : (
            <p>No public entry functions found.</p>
          )}
          {funcRead &&
            Object.keys(funcRead).map((name, key) => (
              <Function
                key={key}
                isWrite={false}
                name={name}
                func={funcRead[name]}
                isDisable={isExcute}
                onExcute={onExcute}
              />
            ))}
        </div>
      </div>
    </div>
  );
};
