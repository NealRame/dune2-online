import Home from "@/components/Home.vue"
import LandMap from "@/components/Map.vue"
import Tiles from "@/components/TerrainTiles.vue"
import Noise from "@/components/Noise.vue"

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

const routes: Array<RouteRecordRaw> = [{
    path: "/",
    name: "Home",
    component: Home,
}, {
    path: "/map",
    name: "Map",
    component: LandMap,
}, {
    path: "/terrainTiles",
    name: "Terrain Tiles",
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
