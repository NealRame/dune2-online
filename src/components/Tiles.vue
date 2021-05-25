<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
    />
    <tile-palette
        v-model="currentItem"
        :items="tiles"
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

import { createScene, createTile, GameData, ImageLib, ScaleFactor, Tile } from "@/core"
import { PaintDevice } from "@/graphics"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce, isNil } from "lodash"

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
        const tiles = ref<readonly Tile[] | null>(null)
        const currentItem = ref<number | null>(null)

        const scene = createScene()

        // handle window resize event
        const resize = debounce(() => {
            const { x: leftPos } = (unref(screen) as PaintDevice).rect
            screenWidth.value = window.innerWidth - leftPos
            screenHeight.value = window.innerHeight
        }, 60)

        onMounted(async () => {
            tiles.value = GameData
                .imageSet(props.set as keyof ImageLib)
                .map(image => createTile({
                    shape: { columns: 1, rows: 1 },
                    images: [image]
                }))

            scene.scale = unref(scale)
            scene.gridEnabled = true
            scene.run((unref(screen) as PaintDevice).painter)
            window.addEventListener("resize", resize)
            resize()
        })

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const image = unref(currentItem)

            if (isNil(image)) return

            const { x, y } = ev.position
            const gridSpacing = scene.gridSpacing
            const position = {
                x: gridSpacing*Math.floor(x/gridSpacing),
                y: gridSpacing*Math.floor(y/gridSpacing),
            }

            scene.addItem(createTile({
                position,
                shape: { columns: 1, rows: 1 },
                images: [GameData.imageSet(props.set as keyof ImageLib)[image]]
            }))
        }

        return {
            screen,
            screenWidth,
            screenHeight,
            currentItem,
            tiles,
            onMouseClick,
        }
    }
})
</script>
