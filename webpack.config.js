const InlineEnviromentVariablesPlugin = require('inline-environment-variables-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const path = require('path');

const myEslintOptions = {
  extensions: [`js`, `ts`],
  exclude: [`node_modules`],
};

module.exports = {
  entry: {
    app: ['./src/main.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/js/',
    filename: 'bundle.js',
    library: 'commonjs2',
  },
  externals: [
    /^[a-z\-0-9]+$/,
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }, {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ]
      },
    ],
  },
  devtool: 'source-map',
  plugins: [
    new InlineEnviromentVariablesPlugin(),
    new ESLintPlugin(myEslintOptions),
  ],
  resolve: {extensions: ['.js','.jsx']},
};
