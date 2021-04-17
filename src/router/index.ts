import Tiles from "@/components/Tiles.vue"

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

const routes: Array<RouteRecordRaw> = [{
    path: "/tiles",
    name: "Tiles",
    component: Tiles
}]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
