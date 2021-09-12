<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
    />
    <tile-palette
        v-if="images"
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

import { ImageLib, ImageSet } from "@/dune2/types"
import { Data } from "@/dune2"

import { createGrid, createScene, createTile, Image, ScaleFactor, IScene, screenToSceneCoordinate } from "@/engine"
import { IPaintDevice } from "@/graphics"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce, isNil } from "lodash"

export default defineComponent({
    props: ["set"],
    components: {
        Screen,
        TilePalette,
    },
    setup(props) {
        const screen = ref<IPaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const scale = ref<ScaleFactor>(4)
        const images = ref<readonly Image[] | null>(null)
        const currentItem = ref<number | null>(null)

        let scene: IScene|null = null

        // handle window resize event
        const resize = debounce(() => {
            const { x: leftPos } = (unref(screen) as IPaintDevice).rect
            screenWidth.value = window.innerWidth - leftPos
            screenHeight.value = window.innerHeight
        }, 60)

        onMounted(async () => {
            images.value = Data.imageSet(props.set as ImageSet)

            scene = createScene({
                width: 60,
                height: 60,
            }, (unref(screen) as IPaintDevice).painter)
            scene.scale = unref(scale)
            scene.addItem(createGrid(scene))

            window.addEventListener("resize", resize)

            ;(function animationLoop() {
                if (!isNil(scene)) {
                    scene
                        .update()
                        .render()
                    requestAnimationFrame(animationLoop)
                }
            })()

            resize()
        })

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const image = unref(currentItem)

            if (isNil(image) || isNil(scene)) return

            scene.addItem(createTile(scene, {
                position: screenToSceneCoordinate(scene, ev.position),
                shape: { columns: 1, rows: 1 },
                images: [Data.imageSet(props.set as keyof ImageLib)[image]]
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
