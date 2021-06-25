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

import { createScene, ScaleFactor, screenToSceneCoordinate } from "@/engine"
import { Units } from "@/dune2"

import { PaintDevice } from "@/graphics"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce } from "lodash"

export default defineComponent({
    components: { Screen },
    setup() {
        const screen = ref<PaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const scale = ref<ScaleFactor>(4)
        const scene = createScene()

        // handle window resize event
        const resize = debounce(() => {
            screenWidth.value = window.innerWidth
            screenHeight.value = window.innerHeight
        }, 60)

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const scenePos = screenToSceneCoordinate(scene, ev.position)
            console.log(scenePos, scene.rect)
        }

        onMounted(async () => {
            const quad = new Units.Quad(scene, { x: 8, y: 8 })
            scene.gridEnabled = true
            scene.scale = unref(scale)
            scene
                .addItem(quad)
                .run((unref(screen) as PaintDevice).painter)

            window.addEventListener("resize", resize)

            setTimeout(() => {
                quad.move({ x: 0, y: -1 })
            }, 1000)

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
