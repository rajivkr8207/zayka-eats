import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      '.env*',
      'public/**/*',
      'dist/**',
      'coverage/**',
      'uploads/**',
      'tests',
      'src/middlewares/error.middlewares.js',
      'src/app.middleware.js',
      'src/docs/*',
    ],
  },

  js.configs.recommended,

  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Node.js 18+ globals (fetch API, timers)
        fetch: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        globalThis: 'readonly',
      },
    },

    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      'no-console': 'off',

      'no-undef': 'error',

      'prefer-const': 'error',

      'no-var': 'error',
    },
  },

  prettier,
];
