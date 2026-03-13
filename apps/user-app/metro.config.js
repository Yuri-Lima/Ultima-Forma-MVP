const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const { mergeConfig } = require('metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const defaultConfig = getDefaultConfig(projectRoot);
const { assetExts, sourceExts } = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const customConfig = {
  cacheVersion: 'user-app',
  watchFolders: [monorepoRoot],
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'cjs', 'mjs', 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, customConfig);
