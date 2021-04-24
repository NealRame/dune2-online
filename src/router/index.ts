import Home from "@/components/Home.vue"
import Tiles from "@/components/Tiles.vue"
import Noise from "@/components/Noise.vue"

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

const routes: Array<RouteRecordRaw> = [{
    path: "/",
    name: "Home",
    component: Home,
}, {
    path: "/tiles",
    name: "Tiles",
    component: Tiles,
}, {
    path: "/noise",
    name: "Noise",
    component: Noise,
}]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
