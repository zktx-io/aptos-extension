export const CHANNEL = 'Aptos Extension';
export const COMPILER = 'aptos';
export const COMPILER_URL = 'https://aptos.dev/en/build/cli';
export const MoveToml = 'Move.toml';
export const ByteDump = 'bytecode.dump.json';

export const runBuild = (path: string) => {
  return `${COMPILER} move build-publish-payload --package-dir ${path} --json-output-file ${path}/${ByteDump} --assume-yes`;
};

export const runTest = (path: string) => {
  return `${COMPILER} move test --skip-fetch-latest-git-deps --package-dir ${path}`;
};

export const runProve = (path: string) => {
  return `${COMPILER} move prove --package-dir ${path}`;
};

export const runFormatter = (path: string) => {
  return `${COMPILER} move fmt --package-path ${path}`;
};
