import { createApp } from "vue"
import App from "./App.vue"

declare global {
    interface Window {
        appVM: any // eslint-disable-line @typescript-eslint/no-explicit-any
    }
}

window.appVM = createApp(App).mount("#app")
