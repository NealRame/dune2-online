/* eslint-disable @typescript-eslint/no-var-requires */
// vue.config.js

module.exports = {
    configureWebpack: {
        devtool: "source-map"
    },
    css: {
        loaderOptions: {
            sass: {
                prependData: `
                    @import "@/styles/variables.scss";
                `
            }
        }
    }
}
