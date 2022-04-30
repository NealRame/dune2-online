<script lang="ts">
import { defineComponent, onMounted, ref, unref } from "vue"

import { debounce } from "lodash"

import Screen, { ScreenMouseClickEvent } from "@/dune/ui/Screen.vue"
import TilePalette from "@/dune/ui/TilePalette.vue"

import { IPaintDevice } from "@/graphics"
import { Data } from "@/dune2"

export default defineComponent({
    components: {
        Screen,
        TilePalette,
    },
    setup() {
        const screen = ref<IPaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const tiles = ref(Data.tiles())
        const currentTileIndex = ref<number | null>(null)

        const onResize = () => {
            const { x: leftPos } = (unref(screen) as IPaintDevice).rect
            const size = {
                width: window.innerWidth - leftPos,
                height: window.innerHeight,
            }
            screenWidth.value = size.width
            screenHeight.value = size.height
        }

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            console.log(ev)
        }

        onMounted(async () => {
            window.addEventListener("resize", debounce(onResize, 60))
            onResize()
        })

        return {
            screen,
            screenWidth,
            screenHeight,
            currentTileIndex,
            tiles,
            onMouseClick,
        }
    },
})
</script>

<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
    />
    <tile-palette :tiles="tiles" :scale="2" v-model="currentTileIndex"/>
</template>

<style lang="scss" scoped>
canvas {
    position: absolute;
    left: $palette-width;
    top: 0;
}
</style>
