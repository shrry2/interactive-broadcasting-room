const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const MODE = 'development';

module.exports = {
  entry: {
    listener_hub: './src/index.js',
    admin: ['@babel/polyfill', './src/admin/index.js'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: MODE,
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    inline: true,
    watchContentBase: true,
    openPage: 'index.html',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/react',
              ],
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'sass-loader',
          ],
        }),
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('style.css'),
  ],
};
