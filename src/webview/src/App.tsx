import { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';

import './App.css';

import { vscode } from './utilities/vscode';
import { Account } from './components/Account';

import { ExplorerPackage } from './components/ExplorerPackage';
import { Workspace } from './components/Workspace';
import { COMMENDS } from './utilities/commends';
import { STATE } from './recoil';

function App() {
  const initialized = useRef<boolean>(false);
  const [hasTerminal, setHasTerminal] = useState<boolean>(false);
  const [client, setClinet] = useState<Aptos | undefined>(undefined);
  const [state, setState] = useRecoilState(STATE);

  useEffect(() => {
    const handleMessage = async (event: any) => {
      const message = event.data;
      switch (message.command) {
        case COMMENDS.Env:
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
      vscode.postMessage({ command: COMMENDS.Env });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [setState]);

  useEffect(() => {
    if (state.account && !client) {
      setClinet(
        new Aptos(
          new AptosConfig({ network: state.account.nonce.network as any }),
        ),
      );
    }
  }, [client, state]);

  return (
    <>
      <Account />
      <Workspace client={client} hasTerminal={hasTerminal} />
      <ExplorerPackage client={client} />
    </>
  );
}

export default App;
