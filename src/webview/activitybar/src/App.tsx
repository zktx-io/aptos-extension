import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

import './App.css';

import { vscode } from './utilities/vscode';
import { Account } from './components/Account';
import { ExplorerPackage } from './components/ExplorerPackage';
import { Workspace } from './components/Workspace';
import { COMMANDS } from './utilities/commands';
import { IAccount, STATE } from './recoil';

function App() {
  const initialized = useRef<boolean>(false);
  const [hasTerminal, setHasTerminal] = useState<boolean>(false);
  const [client, setClinet] = useState<Aptos | undefined>(undefined);
  const [state, setState] = useRecoilState(STATE);

  useEffect(() => {
    const handleMessage = async (
      event: MessageEvent<{
        command: COMMANDS;
        data: {
          hasTerminal: boolean;
          account?: IAccount;
        };
      }>,
    ) => {
      const message = event.data;
      switch (message.command) {
        case COMMANDS.Env:
          {
            const { hasTerminal: terminal, account: loaddedAccount } =
              message.data;
            setHasTerminal(terminal);
            loaddedAccount &&
              setState((oldState) => ({
                ...oldState,
                account: { ...oldState.account, ...loaddedAccount },
              }));
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('message', handleMessage);

    if (!initialized.current) {
      initialized.current = true;
      vscode.postMessage({ command: COMMANDS.Env });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [setState]);

  useEffect(() => {
    if (state.account) {
      setClinet(
        new Aptos(
          new AptosConfig({
            network: state.account.nonce.network as unknown as Network,
          }),
        ),
      );
    } else {
      setClinet(undefined);
    }
  }, [state.account]);

  return (
    <>
      <Account client={client} />
      <Workspace client={client} hasTerminal={hasTerminal} />
      <ExplorerPackage client={client} />
    </>
  );
}

export default App;
