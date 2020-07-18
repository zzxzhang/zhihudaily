const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const ImageminPlugin = require('imagemin-webpack-plugin').default;

module.exports = async function (env, argv) {
  env = Object.assign({}, env, {
    projectRoot: '/Users/zzx/Codes/practice/expo/demo',
    pwa: false,
    isImageEditingEnabled: false,
    https: true
  })

  const config = await createExpoWebpackConfigAsync(env, argv);

  const imageminPlugin = new ImageminPlugin({
    pngquant: {
      quality: '50'
    }
  })

  if (env.mode === 'production') {
    config.plugins.push(imageminPlugin)
  }

  return config;
};
