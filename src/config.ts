export const COMPILER = 'aptos';
export const COMPILER_URL = 'https://aptos.dev/en/build/cli';
export const MoveToml = 'Move.toml';
export const ByteDump = 'bytecode.dump.json';

export const runCompile = (path: string) => {
  return `${COMPILER} move build-publish-payload --json-output-file ${path}/${ByteDump}`;
};

export const runTest = (path: string) => {
  return `${COMPILER} move test --package-dir ${path}`;
};
