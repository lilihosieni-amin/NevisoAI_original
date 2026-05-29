module.exports = {
  root: true,
  extends: ['../../.eslintrc.base.cjs'],
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['dist', 'node_modules', 'jest.config.js'],
};
