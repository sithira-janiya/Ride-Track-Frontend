// https://docs.expo.dev/guides/using-eslint/
const fs = require('fs');
const path = require('path');
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

// Every folder in src/features is a feature. Read at lint time, so a new feature is covered without editing this file.
const features = fs
  .readdirSync(path.join(__dirname, 'src/features'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

// Shared code that any screen or feature may use. It must not depend on a feature or a screen.
const shared = ['api', 'components', 'config', 'hooks', 'i18n', 'lib', 'store', 'theme', 'types', 'utils'].map((dir) => `./src/${dir}`);

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // Folder rules (see "Folder structure" in README.md): screens compose features, features use shared code.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/__tests__/**'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: shared,
              from: ['./src/features', './src/app'],
              message: 'Shared code cannot import a feature or a screen. Move what both need into shared code instead.',
            },
            {
              target: './src/features',
              from: './src/app',
              message: 'Features cannot import screens. Screens in src/app import features, not the other way round.',
            },
            ...features.map((feature) => ({
              target: `./src/features/${feature}`,
              from: './src/features',
              except: [`./${feature}`],
              message: `Features cannot import each other. Compose them in the screen, or move the shared part into shared code.`,
            })),
          ],
        },
      ],
    },
  },
]);
