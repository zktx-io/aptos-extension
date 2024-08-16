export const COMPILER = 'aptos';
export const COMPILER_URL = 'https://aptos.dev/en/build/cli';
export const MoveToml = 'Move.toml';
export const ByteDump = 'bytecode.dump.json';

export const runCompile = (path: string) => {
  return `${COMPILER} move build-publish-payload --skip-fetch-latest-git-deps --package-dir ${path} --json-output-file ${path}/${ByteDump}  --assume-yes`;
};

export const runTest = (path: string) => {
  return `${COMPILER} move test --package-dir ${path}`;
};
