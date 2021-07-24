<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
        @mouseMotion="onMouseMoved"
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
import Screen, { ScreenMouseClickEvent, ScreenMouseMotionEvent } from "@/components/Screen.vue"

import { screenToSceneScale, screenToSceneCoordinate, ScaleFactor } from "@/engine"
import { createGame, Game } from "@/dune2/game"
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
    components: { Screen },
    setup() {
        const screen = ref<PaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const scale = ref<ScaleFactor>(4)

        let game: Game | null = null

        // handle window resize event
        const resize = debounce(() => {
            if (!isNil(game)) {
                const width = window.innerWidth
                const height = window.innerHeight
                const scene = game.scene

                const topLeft = scene.viewport?.topLeft() ?? { x: 0, y: 0 }

                screenWidth.value = width
                screenHeight.value = height
                scene.viewport = new Rect(topLeft, {
                    width: width/scene.gridSpacing,
                    height: height/scene.gridSpacing,
                })
            }
        }, 60)

        const updateViewport = ({ x: xOffset, y: yOffset }: RectangularCoordinates) => {
            if (xOffset !== 0 || yOffset !== 0) {
                if (!isNil(game)) {
                    const viewport = game.scene.viewport as Rect
                    const rect = game.scene.rect
                    viewport.x = clamp(viewport.x + xOffset, 0, rect.rightX - viewport.width)
                    viewport.y = clamp(viewport.y + yOffset, 0, rect.bottomY - viewport.height)
                }
            }
        }

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            if (!isNil(game)) {
                const scenePos = screenToSceneCoordinate(game.scene, ev.position)
                console.log(scenePos)
            }
        }

        const onMouseMoved = (ev: ScreenMouseMotionEvent) => {
            if (!isNil(game) && ev.button) {
                const sceneMove = screenToSceneScale(game.scene, ev.movement)
                console.log(ev.movement, sceneMove)
                updateViewport(sceneMove.opposite)
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
            onMouseClick,
            onMouseMoved,
        }
    }
})
</script>
