import Home from "@/components/Home.vue"
import LandMap from "@/components/Map.vue"
import Tiles from "@/components/Tiles.vue"
import Noise from "@/components/Noise.vue"

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

const routes: Array<RouteRecordRaw> = [{
    component: Home,
    name: "Home",
    path: "/",
}, {
    component: LandMap,
    name: "Map",
    path: "/map",
}, {
    component: Tiles,
    name: "Tiles",
    path: "/tiles/:set",
    props: true,
}, {
    component: Noise,
    name: "Noise",
    path: "/noise",
}]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
