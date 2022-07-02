module.exports = {
  'env': {
    'browser': true,
    'es2021': true
  },
  'extends': [
    'plugin:react/recommended',
    'google'
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true
    },
    'ecmaVersion': 'latest',
    'sourceType': 'module'
  },
  'plugins': [
    'react'
  ],
  'ignorePatterns': ['./static/js/*.js'],
  'rules': {
    'require-jsdoc': 0,
    'max-len': ['error', {'code': 120}],
    'comma-dangle': ['error', 'never']
  }
};
