<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
    />
</template>

<style lang="scss" scoped>
canvas {
    position: absolute;
    left: 0;
    top: 0;
}
</style>

<script lang="ts">
import Screen, { ScreenMouseClickEvent } from "@/components/Screen.vue"

import { screenToSceneCoordinate, ScaleFactor } from "@/engine"
import { createGame, Game } from "@/dune2/game"
import { PaintDevice } from "@/graphics"

import { chunk, debounce, isNil } from "lodash"
import { defineComponent, onMounted, ref, unref } from "vue"

declare global {
    interface Window {
        game: Game
    }
}

export default defineComponent({
    components: { Screen },
    setup() {
        const screen = ref<PaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const scale = ref<ScaleFactor>(4)

        let game: Game | null = null

        // handle window resize event
        const resize = debounce(() => {
            screenWidth.value = window.innerWidth
            screenHeight.value = window.innerHeight
        }, 60)

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            if (!isNil(game)) {
                const scenePos = screenToSceneCoordinate(game.scene, ev.position)
                console.log(scenePos)
            }
        }

        onMounted(async () => {
            game = await createGame({
                screen: unref(screen) as PaintDevice,
                map: {
                    chunk: true,
                    size: {
                        width: 64,
                        height: 64,
                    },
                },
            })
            game.scene.scale = unref(scale)
            game.start()

            window.game = game
            window.addEventListener("resize", resize)

            resize()
        })

        return {
            screen,
            screenWidth,
            screenHeight,
            onMouseClick
        }
    }
})
</script>
