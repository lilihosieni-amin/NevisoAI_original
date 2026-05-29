module.exports = {
  root: true,
  extends: ['../../.eslintrc.base.cjs'],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['generated', 'dist', 'node_modules'],
};
