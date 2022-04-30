import { EngineKey } from "@/constants"

import App from "@/app.vue"
import router from "@/router"

import * as Engine from "@/engine"
import * as Dune from "@/dune"

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
    .component("font-awesome-icon", FontAwesomeIcon)
    .provide(EngineKey, Engine.create(Dune.Game))
    .use(router)
    .mount("#app")
