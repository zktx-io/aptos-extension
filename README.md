# Aptos Extension

The Aptos extension provides seamless support for compiling, deploying, and testing Aptos smart contracts directly within VS Code. It enhances development productivity, especially when using GitHub Codespaces, by enabling unified management of front-end and back-end development within a single repository.

## Features

- **Compile Aptos Smart Contracts**: Easily compile your Aptos smart contracts from within VS Code.
- **Deploy and Test**: Deploy and test your smart contracts using the keyless-generated wallet, all from within the extension.
- **GitHub Codespaces Integration**: Increase the efficiency of your development workflow with full support for GitHub Codespaces.
- **Unified Development**: Manage both front-end and back-end code in a single repository for streamlined development.
- **Upgrade Smart Contracts**: Seamlessly upgrade and test your smart contracts.
- **Support Move 2.0**: [Move 2.0 Release Notes](https://aptos.dev/en/build/smart-contracts/book/move-2.0)
- **Support Move FMT**: [Introducing movefmt](https://medium.com/aptoslabs/introducing-movefmt-code-formatter-for-move-on-aptos-3aebb1bdbb85)
- **Support Aptos Assistant**: [Aptos Assistant](https://assistant.aptosfoundation.org)

## Interface Overview

![Aptos Extension](https://docs.zktx.io/images/aptos-extension.png)

1. **Wallet**: This section of the interface is used to manage wallets. You can create a wallet using Aptos’s `keyless account`. After selecting a network, click the `Google Login` button to create a wallet. Please note that wallets created using keyless account will require re-authentication after a specific period. The currently supported networks are `Devnet` and `Testnet`.
1. **Workspace**: This section of the interface allows you to `compile`, `test`, `prove`, and `deploy Smart Contracts`. If you have multiple smart contracts in your repository, you can select the specific smart contract (`Move.toml`) and proceed with compilation or deployment. Additionally, you can choose from the latest Aptos Move features such as the `formatter` and `Move 2.0` for enhanced functionality.
1. **Package Explorer**: This section of the user interface allows you to test smart contracts. When you deploy a Smart Contract, it is automatically registered here. You can also manually enter the address of a previously deployed Smart Contract to register it. If the smart contract is loaded correctly, you will see a list of functions available to interact with the contract.
1. **Move Call**: Input Format for Multi-Vectors Using JSON Strings. When working with multi-vectors, the input must be provided in JSON string format. JSON is ideal for representing nested structures and allows handling multi-dimensional arrays effectively.

    |Type|JSON|
    |------|-------|
    |`vector<u8>` | [1, 2, 3, 255]|
    |`vector<vector<u128>>`|[["1", "555"], ["123", "456", "789"]]|
    |`vector<vector<vector<bool>>>`|[[[true, false], [true]], [[false, true]]]|

    ![Vector](https://docs.zktx.io/images/aptos-extension-vector.png)

1. **Output**: In this section, you can view the transaction execution data in raw format. Please select `Aptos Extension` in the Task.
   ![Aptos Extension](https://docs.zktx.io/images/aptos-extension-assistant.png)
1. **Aptos Assistant**: This section introduces the AI-powered [Aptos Assistant](https://aptosfoundation.org/use-cases/ai), developed by Aptos in collaboration with Microsoft. It allows you to review your smart contract code, ask questions about the Aptos ecosystem, and explore the Move language. Designed to simplify Web3 development, the Assistant enhances productivity by delivering quick and accurate responses, making it an essential tool for both newcomers and experts in blockchain development.

## Requirements

- **Aptos CLI**: Install the Aptos command-line interface to interact with the Aptos blockchain.
  > Note: If you are using GitHub Codespaces, please install Homebrew from https://brew.sh first to manage and [install the Aptos CLI](https://aptos.dev/en/build/cli).
- **Keyless Account**: Set up keyless account to generate wallets for contract deployment and testing. A Google account is required.

## Extension Settings

- No additional configuration is required.

## Docs

- [link](https://docs.zktx.io/vsce/aptos/)
