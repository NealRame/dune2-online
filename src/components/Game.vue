<template>
    <screen id="screen" ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
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
import Screen, { ScreenMouseClickEvent, ScreenMouseMotionEvent } from "@/components/Screen.vue"

import { createGame, Game } from "@/dune2"
import { screenToSceneScale, screenToSceneCoordinate, ScaleFactor } from "@/engine"
import { PaintDevice } from "@/graphics"

import { clamp, debounce, isNil } from "lodash"
import { defineComponent, onMounted, ref, unref } from "vue"
import { Rect, RectangularCoordinates } from "@/maths"

declare global {
    interface Window {
        game: Game
    }
}

export default defineComponent({
    components: { MiniMap, Screen },
    setup() {
        const screen = ref<PaintDevice | null>(null)
        const screenWidthRef = ref(0)
        const screenHeightRef = ref(0)
        const scale = ref<ScaleFactor>(4)

        const gameRef = ref<Game|null>(null)

        // handle window resize event
        const resize = debounce(() => {
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
        }, 60)

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

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const game = unref(gameRef)
            if (!isNil(game)) {
                // const scenePos = screenToSceneCoordinate(game.engine.scene, ev.position)
                // console.log(scenePos)
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
                screen: unref(screen) as PaintDevice,
                size: {
                    width: 64,
                    height: 64,
                },
            })
            game.engine.scene.scale = unref(scale)
            game.engine.start()

            gameRef.value = game

            window.game = game
            window.addEventListener("resize", resize)

            resize()
        })

        return {
            screen,
            screenWidth: screenWidthRef,
            screenHeight: screenHeightRef,
            game: gameRef,
            onMouseClick,
            onMouseMoved,
        }
    }
})
</script>
