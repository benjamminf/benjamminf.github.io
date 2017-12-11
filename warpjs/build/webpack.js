const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')

module.exports = {
	devtool: 'source-map',
	entry: path.resolve(__dirname, '../src/main.js'),
	output: {
		path: path.resolve(__dirname, '../'),
		filename: 'main.js',
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: { warnings: false },
			output: { comments: false },
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../src/index.html'),
			inlineSource: '.(js|css)$',
		}),
		new HtmlWebpackInlineSourcePlugin(),
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env'],
					},
				},
			},
			{
				test: /\.s?css$/,
	            use: [
	            	{ loader: 'style-loader' },
	            	{
	            		loader: 'css-loader',
	            		options: { minimize: true },
	            	},
	            	{ loader: 'sass-loader' },
	            ],
			},
		],
	},
}
