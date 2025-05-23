import { useEffect, useState } from 'react';
import {
  VSCodeButton,
  VSCodeDivider,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextField,
} from '@vscode/webview-ui-toolkit/react';
import { Aptos } from '@aptos-labs/ts-sdk';
import { SpinButton } from './SpinButton';
import { NETWORK, NETWORKS, STATE } from '../recoil';
import { useRecoilState } from 'recoil';
import { createNonce } from '../utilities/createNonce';
import { googleLogin } from '../utilities/googleLogin';
import { vscode } from '../utilities/vscode';
import { COMMANDS } from '../utilities/commands';
import { getBalance } from '../utilities/getBalance';
import { createProof } from '../utilities/createProof';
import { faucet } from '../utilities/faucet';

export const Account = ({ client }: { client: Aptos | undefined }) => {
  const [state, setState] = useRecoilState(STATE);
  const [network, setNetwork] = useState<NETWORK>(NETWORK.DevNet);
  const [isFaucet, setIsFaucet] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);

  const handleLogin = async () => {
    setIsLogin(true);
    const {
      nonce,
      expiration,
      randomness,
      ephemeralKeyPair: { publicKey, privateKey },
    } = await createNonce(network);
    setState((oldState) => ({
      ...oldState!,
      account: {
        ...oldState!.account,
        nonce: {
          expiration,
          randomness,
          network,
          publicKey,
          privateKey,
        },
      },
    }));

    await googleLogin(nonce);
  };

  const handleLogout = async () => {
    vscode.postMessage({
      command: COMMANDS.StoreAccount,
      data: undefined,
    });
    setState(() => ({ packages: {} }));
  };

  const handleFaucet = async () => {
    try {
      setIsLogin(true);
      setIsFaucet(true);
      const result = state.account && (await faucet(state.account));
      if (result) {
        const balance =
          state.account && (await getBalance(client, state.account));
        setState((oldState) => ({ ...oldState, balance }));
      }
    } catch (error) {
      vscode.postMessage({
        command: COMMANDS.MsgError,
        data: `${error}`,
      });
    } finally {
      setIsLogin(false);
      setIsFaucet(false);
    }
  };

  useEffect(() => {
    const updateBalance = async () => {
      state.account && setNetwork(() => state.account!.nonce.network);
      const balance = await getBalance(client, state.account);
      setState((oldState) => ({ ...oldState, balance }));
    };

    const handleMessage = async (
      event: MessageEvent<{
        command: COMMANDS;
        data: string;
      }>,
    ) => {
      const message = event.data;
      switch (message.command) {
        case COMMANDS.LoginJwt:
          if (state.account && message.data && !!client) {
            try {
              const { address, proof, salt } = await createProof(
                client,
                state.account.nonce,
                message.data,
              );
              setState((oldState) => ({
                ...oldState,
                account: {
                  ...oldState.account!,
                  zkAddress: {
                    address,
                    proof,
                    salt,
                    jwt: message.data,
                  },
                },
              }));
              vscode.postMessage({
                command: COMMANDS.StoreAccount,
                data: {
                  ...state.account,
                  zkAddress: {
                    address,
                    proof,
                    salt,
                    jwt: message.data,
                  },
                },
              });
            } catch (error) {
              vscode.postMessage({
                command: COMMANDS.MsgError,
                data: `${error}`,
              });
            } finally {
              setIsLogin(false);
            }
          } else {
            setIsLogin(false);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    updateBalance();

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
          marginBottom: '4px',
        }}
      >
        Wallet
        <VSCodeDivider />
      </div>
      <label style={{ fontSize: '11px', color: 'GrayText' }}>ACCOUNT</label>
      <VSCodeTextField
        style={{ width: '100%' }}
        readOnly
        value={state.account?.zkAddress?.address || ''}
      />
      <div
        style={{
          fontSize: '11px',
          color: 'GrayText',
          marginBottom: '8px',
          textAlign: 'right',
        }}
      >{`Balance: ${state.balance || 'n/a'}`}</div>

      <label style={{ fontSize: '11px', color: 'GrayText' }}>NETWORK</label>
      <VSCodeDropdown
        style={{ width: '100%', marginBottom: '8px' }}
        value={network}
        disabled={!!state.account?.zkAddress?.address || isLogin}
        onChange={(e) => {
          e.target &&
            setNetwork((e.target as HTMLInputElement).value as NETWORK);
        }}
      >
        {NETWORKS.map((item, index) => (
          <VSCodeOption key={index} value={item}>
            {item}
          </VSCodeOption>
        ))}
      </VSCodeDropdown>
      {!state.account?.zkAddress ? (
        <SpinButton
          title="Google Login"
          spin={isLogin}
          disabled={isLogin}
          width="100%"
          onClick={handleLogin}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <VSCodeButton
            style={{ flex: 1, marginRight: '2px' }}
            disabled={isLogin || isFaucet}
            onClick={handleFaucet}
          >
            Faucet
          </VSCodeButton>
          <VSCodeButton
            style={{ flex: 1, marginLeft: '2px' }}
            disabled={isLogin}
            onClick={handleLogout}
          >
            Logout
          </VSCodeButton>
        </div>
      )}
    </>
  );
};
