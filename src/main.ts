import App from "@/app.vue"
import router from "@/router"

import { createApp } from "vue"

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { library as faLibrary } from "@fortawesome/fontawesome-svg-core"
import {
    faSearchMinus,
    faSearchPlus,
    faSyncAlt,
    faWrench,
} from "@fortawesome/free-solid-svg-icons"

faLibrary.add(faSyncAlt, faWrench, faSearchMinus, faSearchPlus)

createApp(App)
    .use(router)
    .component("font-awesome-icon", FontAwesomeIcon)
    .mount("#app")
