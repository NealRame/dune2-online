/* eslint-disable @typescript-eslint/no-var-requires */
// vue.config.js
const path = require("path")

module.exports = {
    chainWebpack: config => {
        config
            .entry("style")
            .add(path.resolve(__dirname, "./src/style.scss"))
            .end()

        const types = ["vue-modules", "vue", "normal-modules", "normal"]
        types.forEach(type => {
            addStyleResource(config.module.rule("scss").oneOf(type))
        })
    },
}

function addStyleResource(rule) {
    rule.use("style-resource")
        .loader("style-resources-loader")
        .options({
            patterns: [
                path.resolve(__dirname, "./src/styles/variables.scss"),
            ],
        })
}
