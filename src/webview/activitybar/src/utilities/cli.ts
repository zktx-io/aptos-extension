export const CHANNEL = 'Aptos Extension';
export const COMPILER = 'aptos';
export const COMPILER_URL = 'https://aptos.dev/en/build/cli';
export const MoveToml = 'Move.toml';
export const ByteDump = 'bytecode.dump.json';

export const runBuild = (path: string, move2: boolean) => {
  return `${COMPILER} move build-publish-payload ${!move2 ? '' : '--move-2'} --package-dir ${path} --json-output-file ${path}/${ByteDump} --assume-yes`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const runTest = (path: string, _move2: boolean) => {
  return `${COMPILER} move test --skip-fetch-latest-git-deps --package-dir ${path}`;
};

export const runProve = (path: string, move2: boolean) => {
  return `${COMPILER} move prove ${!move2 ? '' : '--move-2'}  --package-dir ${path}`;
};

export const runFormatter = (path: string) => {
  return `${COMPILER} move fmt --package-path ${path}`;
};
