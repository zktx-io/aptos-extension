# Aptos Extension

The Aptos extension provides seamless support for compiling, deploying, and testing Aptos smart contracts directly within VS Code. It enhances development productivity, especially when using GitHub Codespaces, by enabling unified management of front-end and back-end development within a single repository.

## Features

- **Compile Aptos Smart Contracts**: Easily compile your Aptos smart contracts from within VS Code.
- **Deploy and Test**: Deploy and test your smart contracts using the keyless-generated wallet, all from within the extension.
- **GitHub Codespaces Integration**: Increase the efficiency of your development workflow with full support for GitHub Codespaces.
- **Unified Development**: Manage both front-end and back-end code in a single repository for streamlined development.
- **Upgrade Smart Contracts**: Seamlessly upgrade and test your smart contracts.

## Interface Overview

![Aptos Extension](https://docs.zktx.io/images/aptos-extension.png)

1. **Wallet**: This section of the interface is used to manage wallets. You can create a wallet using Aptos’s `keyless account`. After selecting a network, click the `Google Login` button to create a wallet. Please note that wallets created using keyless account will require re-authentication after a specific period. The currently supported networks are `Devnet` and `Testnet`.
1. **Workspace**: This section of the interface allows you to compile or deploy Smart Contracts. If you have multiple smart contracts in your repository, you can select the specific smart contract (`Move.toml`) and proceed with compilation or deployment.

## Requirements

- **Aptos CLI**: Install the Aptos command-line interface to interact with the Aptos blockchain.
  > <i class="fa fa-info-circle" aria-hidden="true"></i> Note: If you are using GitHub Codespaces, please install Homebrew from https://brew.sh first to manage and install the Aptos CLI.
- **Keyless Account**: Set up keyless account to generate wallets for contract deployment and testing. A Google account is required.

## Extension Settings

- No additional configuration is required.

## Docs

- [link](https://docs.zktx.io/vsce/aptos/)
