<template>
    <screen id="screen" ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
        @mouseMotion="onMouseMoved"
    />
    <screen id="minimap" ref="minimap"
        :width="minimapWidth"
        :height="minimapHeight"
    />
</template>

<style lang="scss" scoped>
canvas#screen {
    position: fixed;
    left: 0;
    top: 0;
}
canvas#minimap {
    position: fixed;
    border: 1px solid white;
    float: left;
    top: 16px;
    left: 16px;
}
</style>

<script lang="ts">
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
    components: { Screen },
    setup() {
        const screen = ref<PaintDevice | null>(null)
        const minimap = ref<PaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const minimapWidth = ref(0)
        const minimapHeight = ref(0)
        const scale = ref<ScaleFactor>(4)

        let game: Game | null = null

        // handle window resize event
        const resize = debounce(() => {
            if (!isNil(game)) {
                const width = window.innerWidth
                const height = window.innerHeight
                const scene = game.engine.scene

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
                    const viewport = game.engine.scene.viewport as Rect
                    const rect = game.engine.scene.rect
                    viewport.x = clamp(viewport.x + xOffset, 0, rect.rightX - viewport.width)
                    viewport.y = clamp(viewport.y + yOffset, 0, rect.bottomY - viewport.height)
                }
            }
        }

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            if (!isNil(game)) {
                const scenePos = screenToSceneCoordinate(game.engine.scene, ev.position)
                console.log(scenePos)
            }
        }

        const onMouseMoved = (ev: ScreenMouseMotionEvent) => {
            if (!isNil(game) && ev.button) {
                const sceneMove = screenToSceneScale(game.engine.scene, ev.movement)
                updateViewport(sceneMove.opposite)
            }
        }

        onMounted(async () => {
            game = await createGame({
                screen: unref(screen) as PaintDevice,
                size: {
                    width: 128,
                    height: 128,
                },
            })
            game.engine.scene.scale = unref(scale)
            game.engine.start()

            minimapWidth.value = game.engine.scene.width
            minimapHeight.value = game.engine.scene.height

            game.minimap.onChanged.subscribe(() => {
                const painter = (unref(minimap) as PaintDevice).painter
                const image = game?.minimap.image
                if (!isNil(image)) {
                    painter.drawImageBitmap(image, { x: 0, y: 0 })
                }
            })

            window.game = game
            window.addEventListener("resize", resize)

            resize()
        })

        return {
            screen,
            minimap,
            screenWidth,
            screenHeight,
            minimapWidth,
            minimapHeight,
            onMouseClick,
            onMouseMoved,
        }
    }
})
</script>
