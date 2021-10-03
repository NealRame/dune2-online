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

import { Image, ScaleFactor, IScene, Scene, Grid, Tile, screenToScenePosition, Entity } from "@/engine"
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

        let scene: Scene|null = null

        // handle mouse click events
        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const tileIndex = unref(currentItem)

            if (isNil(tileIndex) || isNil(scene)) return

            const image = Data.imageSet(props.set as keyof ImageLib)[tileIndex]

            const { x, y } = screenToScenePosition(scene, ev.position)
            const width  = image[scene.scale].width/scene.gridSpacing
            const height = image[scene.scale].height/scene.gridSpacing

            const tile = new (class extends Tile {
                constructor() {
                    super(scene as IScene, { width, height }, [image])
                    this.entity_ = new (class extends Entity {
                        get x() { return Math.floor(x) }
                        get y() { return Math.floor(y) }
                        get view() { return tile }
                    })()
                }
            })()

            scene.addItem(tile)
        }

        // handle window resize events
        const onResize = () => {
            const { x: leftPos } = (unref(screen) as IPaintDevice).rect
            const size = {
                width: window.innerWidth - leftPos,
                height: window.innerHeight,
            }
            screenWidth.value = size.width
            screenHeight.value = size.height
            if (!isNil(scene)) {
                scene.viewport.size = size
            }
        }

        onMounted(async () => {
            const paintDevice = unref(screen) as IPaintDevice

            images.value = Data.imageSet(props.set as ImageSet)

            scene = new Scene({
                width: 60,
                height: 60,
            }, paintDevice.painter)

            scene.scale = unref(scale)
            scene.viewport.size = paintDevice.size
            scene.addItem(new Grid(scene))

            window.addEventListener("resize", debounce(onResize, 60))

            ;(function animationLoop() {
                if (!isNil(scene)) {
                    scene.render()
                    requestAnimationFrame(animationLoop)
                }
            })()

            onResize()
        })

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
