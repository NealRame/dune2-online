/* eslint-disable @typescript-eslint/no-var-requires */
// vue.config.js

module.exports = {
    configureWebpack: {
        devtool: "source-map"
    },
    css: {
        loaderOptions: {
            sass: {
                implementation: require("sass"),
                prependData: `
                    @use 'sass:math';
                    @import "@/styles/variables.scss";
                `
            }
        }
    }
}
