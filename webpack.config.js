import path from 'path';
// const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        app: './build/*.js',
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist-wb',
        hot: true,
    },
    // plugins: [
    //     new HtmlWebpackPlugin({
    //         title: 'Hot Module Replacement',
    //     }),
    // ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        // clean: true,
    },
};
