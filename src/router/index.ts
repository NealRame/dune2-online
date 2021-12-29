import Game from "@/components/Game.vue"
import Home from "@/components/Home.vue"
import Sprites from "@/components/Sprites.vue"
import Images from "@/components/Images.vue"
import Tiles from "@/components/Tiles.vue"

import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router"

const routes: Array<RouteRecordRaw> = [{
    component: Home,
    name: "Home",
    path: "/",
}, {
    component: Game,
    name: "Game",
    path: "/game",
}, {
    component: Sprites,
    name: "Sprites",
    path: "/sprites"
}, {
    component: Images,
    name: "Images",
    path: "/images/:set",
    props: true,
}, {
    component: Tiles,
    name: "Tiles",
    path: "/tiles",
    props: true,
}]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
