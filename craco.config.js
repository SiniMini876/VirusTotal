/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
	webpack: {
		configure: (webpackConfig, { env, paths }) => {
			return {
				...webpackConfig,
				entry: {
					main: [
						env === "development" &&
							require.resolve(
								"react-dev-utils/webpackHotDevClient"
							),
						paths.appIndexJs,
					].filter(Boolean),
					content: paths.appSrc + "/bg_scripts/background.ts",
				},
				output: {
					...webpackConfig.output,
					filename: "static/js/[name].js",
				},
				optimization: {
					...webpackConfig.optimization,
					runtimeChunk: false,
				},
				plugins: [
					...webpackConfig.plugins,
					new HtmlWebpackPlugin({
						inject: true,
						chunks: ["options"],
						template: paths.appHtml,
						filename: "options.html",
					}),
					new CopyPlugin({
						patterns: [
							{
								from: "public/img/vt-200px.png",
								to: "static/js/",
							},
						],
					}),
				],
			};
		},
	},
};
