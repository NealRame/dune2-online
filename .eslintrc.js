module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        "plugin:vue/vue3-essential",
        "@vue/standard",
        "@vue/typescript/recommended"
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        "comma-dangle": ["warn", "only-multiline"],
        indent: ["warn", 4],
        semi: ["warn", "never"],
        "space-before-function-paren": ["warn", {
            anonymous: "always",
            asyncArrow: "always",
            named: "never",
        }],
        "space-in-parens": "off",
        "key-spacing": ["error", { mode: "minimum" }],
        "space-infix-ops": ["off"],
        "operator-linebreak": ["off"],
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-multi-spaces": ["off"],
        quotes: ["warn", "double"],
        "no-use-before-define": "off",
        "no-useless-constructor": "off",
        "@typescript-eslint/no-use-before-define": ["error"],
        "@typescript-eslint/no-useless-constructor": ["error"]
    },
    overrides: [{
        files: [
            "**/__tests__/*.{j,t}s?(x)",
            "**/tests/unit/**/*.spec.{j,t}s?(x)"
        ],
        env: {
            mocha: true
        }
    }]
}
