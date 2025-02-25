import path from 'path';
import webpack, { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { compilerOptions } from './tsconfig.json';

// webpack-dev-server types
interface WebpackEnvironmentHash {
  WEBPACK_SERVE?: boolean;
  production?: boolean;
  development?: boolean;
}

// Convert tsconfig paths to webpack aliases
const getAliasesFromTsConfig = () => {
  const aliases: { [key: string]: string } = {};
  if (compilerOptions.paths) {
    Object.entries(compilerOptions.paths).forEach(([alias, [path]]) => {
      // Remove wildcard and map to absolute path
      aliases[alias.replace('/*', '')] = path.replace('/*', '');
    });
  }
  return aliases;
};

const getWebpackConfig = (env: WebpackEnvironmentHash): Configuration => {
  const isDevelopment = !env.production;
  const mode = isDevelopment ? 'development' : 'production';

  return {
    mode,
    target: 'web',
    entry: {
      main: './src/index.tsx'
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      chunkFilename: isDevelopment ? '[id].js' : '[id].[contenthash].js',
      assetModuleFilename: 'assets/[hash][ext][query]',
      clean: true,
      publicPath: '/'
    },

    module: {
      rules: [
        // TypeScript
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: isDevelopment,
              compilerOptions: {
                module: 'esnext'
              }
            }
          },
          exclude: /node_modules/
        },
        // CSS
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        // SCSS/SASS
        {
          test: /\.s[ac]ss$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isDevelopment
              }
            }
          ]
        },
        // Images
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource'
        },
        // Fonts
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource'
        }
      ]
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        ...getAliasesFromTsConfig(),
        // Ensure src path is absolute
        src: path.resolve(__dirname, 'src')
      }
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: true,
        minify: !isDevelopment
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode)
      }),
      isDevelopment && new webpack.HotModuleReplacementPlugin()
    ].filter(Boolean),

    optimization: {
      minimize: !isDevelopment,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: 'single'
    },

    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true,
      compress: true,
      client: {
        overlay: {
          errors: true,
          warnings: false
        }
      },
      static: {
        directory: path.join(__dirname, 'public')
      }
    },

    devtool: isDevelopment ? 'eval-source-map' : 'source-map',

    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    },

    performance: {
      hints: isDevelopment ? false : 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  };
};

export default getWebpackConfig;