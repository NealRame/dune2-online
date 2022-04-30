import { EngineKey } from "@/constants"

import App from "@/app.vue"
import router from "@/router"

import * as Engine from "@/engine"
import * as Dune from "@/dune"

import { createApp } from "vue"

createApp(App)
    .provide(EngineKey, Engine.create(Dune.Game))
    .use(router)
    .mount("#app")
