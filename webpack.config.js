const slsw = require('serverless-webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const config = {
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/g,
      },
    ],
  },
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  resolve: {
    extensions: ['.ts', 'tsx'],
    plugins: [new TsconfigPathsPlugin()],
  },
  target: 'node',
  externals: [nodeExternals()],
};

module.exports = config;
