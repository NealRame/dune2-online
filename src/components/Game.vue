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

                const scene = game.engine.scene
                const topLeft = scene.viewport?.topLeft() ?? { x: 0, y: 0 }

                scene.viewport = new Rect(topLeft, {
                    width: width/scene.gridSpacing,
                    height: height/scene.gridSpacing,
                })
            }
        }, 60)

        const updateViewport = ({ x: xOffset, y: yOffset }: RectangularCoordinates) => {
            if (xOffset !== 0 || yOffset !== 0) {
                const game = unref(gameRef)
                if (!isNil(game)) {
                    const viewport = game.engine.scene.viewport as Rect
                    const rect = game.engine.scene.rect
                    viewport.x = clamp(viewport.x + xOffset, 0, rect.rightX - viewport.width)
                    viewport.y = clamp(viewport.y + yOffset, 0, rect.bottomY - viewport.height)
                }
            }
        }

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const game = unref(gameRef)
            if (!isNil(game)) {
                const scenePos = screenToSceneCoordinate(game.engine.scene, ev.position)
                console.log(scenePos)
            }
        }

        const onMouseMoved = (ev: ScreenMouseMotionEvent) => {
            const game = unref(gameRef)
            if (!isNil(game) && ev.button) {
                const sceneMove = screenToSceneScale(game.engine.scene, ev.movement)
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
