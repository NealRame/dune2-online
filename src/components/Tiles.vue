<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
    />
    <tile-palette
        v-model="currentItem"
        :images="images"
    />
</template>

<style lang="scss" scoped>
canvas {
    position: absolute;
    left: $palette-width;
    top: 0;
}
</style>

<script lang="ts">
import Screen, { ScreenMouseClickEvent } from "@/components/Screen.vue"
import TilePalette from "@/components/TilePalette.vue"

import { GameData, ImageLib, ImageSet } from "@/core"
import { createScene, createTile, Image, ScaleFactor } from "@/engine"
import { PaintDevice } from "@/graphics"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce, isNil } from "lodash"
import { RectangularCoordinates } from "@/maths"

export default defineComponent({
    props: ["set"],
    components: {
        Screen,
        TilePalette,
    },
    setup(props) {
        const screen = ref<PaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const scale = ref<ScaleFactor>(4)
        const images = ref<readonly Image[] | null>(null)
        const currentItem = ref<number | null>(null)

        const scene = createScene()

        // handle window resize event
        const resize = debounce(() => {
            const { x: leftPos } = (unref(screen) as PaintDevice).rect
            screenWidth.value = window.innerWidth - leftPos
            screenHeight.value = window.innerHeight
        }, 60)

        onMounted(async () => {
            images.value = GameData.imageSet(props.set as ImageSet)

            scene.scale = unref(scale)
            scene.gridEnabled = true
            scene.run((unref(screen) as PaintDevice).painter)
            window.addEventListener("resize", resize)
            resize()
        })

        const screenToSceneCoordinates = (position: RectangularCoordinates) => {
            const gridSpacing = scene.gridSpacing
            return {
                x: Math.floor(position.x/gridSpacing),
                y: Math.floor(position.y/gridSpacing)
            }
        }

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const image = unref(currentItem)

            if (isNil(image)) return

            scene.addItem(createTile(scene, {
                position: screenToSceneCoordinates(ev.position),
                shape: { columns: 1, rows: 1 },
                images: [GameData.imageSet(props.set as keyof ImageLib)[image]]
            }))
        }

        return {
            screen,
            screenWidth,
            screenHeight,
            currentItem,
            images,
            onMouseClick,
        }
    }
})
</script>
