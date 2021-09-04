<template>
    <screen id="screen" ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseMotion="onMouseMoved"
    />
    <mini-map :game="game" />
</template>

<style lang="scss" scoped>
canvas#screen {
    position: fixed;
    left: 0;
    top: 0;
}
</style>

<script lang="ts">
import MiniMap from "@/components/MiniMap.vue"
import Screen, { ScreenMouseMotionEvent } from "@/components/Screen.vue"

import { createGame, Game } from "@/dune2"
import { screenToSceneScale, ScaleFactor } from "@/engine"
import { PaintDevice, Painter } from "@/graphics"

import { debounce, isNil } from "lodash"
import { defineComponent, onMounted, ref, unref } from "vue"
import { RectangularCoordinates } from "@/maths"

declare global {
    interface Window {
        game: Game
    }
}

export default defineComponent({
    components: { MiniMap, Screen },
    setup() {
        const screenRef = ref<PaintDevice | null>(null)
        const screenWidthRef = ref(0)
        const screenHeightRef = ref(0)
        const scale = ref<ScaleFactor>(4)

        const gameRef = ref<Game|null>(null)

        // handle window resize event
        const resize = () => {
            const game = unref(gameRef)
            if (!isNil(game)) {
                const width = window.innerWidth
                const height = window.innerHeight

                screenWidthRef.value = width
                screenHeightRef.value = height

                const { gridSpacing, viewport } = game.engine.scene

                viewport.size = {
                    width: width/gridSpacing,
                    height: height/gridSpacing,
                }
            }
        }

        const updateViewport = ({ x: xOffset, y: yOffset }: RectangularCoordinates) => {
            if (xOffset !== 0 || yOffset !== 0) {
                const game = unref(gameRef)
                if (!isNil(game)) {
                    const viewport = game.engine.scene.viewport
                    const { x, y } = viewport.position
                    viewport.position = {
                        x: x + xOffset,
                        y: y + yOffset,
                    }
                }
            }
        }

        const onMouseMoved = (ev: ScreenMouseMotionEvent) => {
            const game = unref(gameRef)
            if (!isNil(game) && ev.button) {
                const scene = game.engine.scene
                const sceneMove = screenToSceneScale(scene, ev.movement)
                updateViewport(sceneMove.opposite)
            }
        }

        onMounted(async () => {
            const game = await createGame({
                painter: unref(screenRef)?.painter as Painter,
                size: {
                    width: 64,
                    height: 64,
                },
            })
            game.engine.scene.scale = unref(scale)
            game.engine.start()

            gameRef.value = game

            window.game = game
            window.addEventListener("resize", debounce(resize, 60))

            resize()

            game.initialize()
        })

        return {
            screen: screenRef,
            screenWidth: screenWidthRef,
            screenHeight: screenHeightRef,
            game: gameRef,
            onMouseMoved,
        }
    }
})
</script>
