import App from "@/app.vue"
import router from "@/router"

import { createApp } from "vue"

import { library } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons"

library.add(faSyncAlt)

createApp(App)
    .use(router)
    .component("font-awesome-icon", FontAwesomeIcon)
    .mount("#app")
