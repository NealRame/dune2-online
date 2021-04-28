<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
    />
    <tile-palette
        ref="tilePalette"
        v-model="currentTile"
        :tilesets="tilesets"
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
import Screen from "@/components/Screen.vue"
import TilePalette from "@/components/TilePalette.vue"

import { LandItem, GameData, Tile, TilesetMap } from "@/core"
import { PaintDevice, Scene } from "@/graphics"

import { defineComponent, onMounted, ref, unref } from "vue"
import { RectangularCoordinates } from "../maths"
import { debounce, isNil } from "lodash"

export default defineComponent({
    components: {
        Screen,
        TilePalette,
    },
    setup() {
        const screen = ref<PaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const tilesets = ref<TilesetMap | null>(null)
        const currentTile = ref<Tile | null>(null)

        const scene = new Scene()

        // handle window resize event
        const resize = debounce(() => {
            const { x: leftPos } = (unref(screen) as PaintDevice).rect()
            screenWidth.value = window.innerWidth - leftPos
            screenHeight.value = window.innerHeight
        }, 60)

        onMounted(async () => {
            tilesets.value = GameData.tilesets()
            scene
                .setPainter((unref(screen) as PaintDevice).painter())
                .setScale(2)
                .run()
            window.addEventListener("resize", resize)
            resize()
        })

        const onMouseClick = ({ x, y }: RectangularCoordinates) => {
            const tile = unref(currentTile)
            if (!isNil(tile)) {
                const item = LandItem(tile, {
                    x: Math.floor(x/32)*32,
                    y: Math.floor(y/32)*32,
                })
                scene.addItem(item)
            }
        }

        return {
            screen,
            screenWidth,
            screenHeight,
            currentTile,
            tilesets,
            onMouseClick,
        }
    }
})
</script>
