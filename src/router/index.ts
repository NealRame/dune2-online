import Game from "@/dune/ui/Game.vue"
import Editor from "@/dune/ui/Editor.vue"
import Home from "@/dune/ui/Home.vue"

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
    component: Editor,
    name: "Editor",
    path: "/editor",
}]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
