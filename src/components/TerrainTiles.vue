<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
    />
    <tile-palette
        v-model="currentItem"
        :items="terrains"
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

import { createScene, GameData, Image, ScaleFactor, Scene, SceneItem } from "@/core"
import { PaintDevice, Painter } from "@/graphics"
import { Rect, RectangularCoordinates } from "@/maths"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce, isNil } from "lodash"

function createTile(
    position: RectangularCoordinates,
    image: Image,
): SceneItem {
    let parent: Scene | SceneItem | null = null
    const getScale = () => parent?.scale ?? 1
    return {
        get x() { return position.x },
        get y() { return position.y },
        get width() {
            return image[getScale()].width
        },
        get height() {
            return image[getScale()].height
        },
        get rect(): Rect {
            return new Rect(position, {
                width: this.width,
                height: this.height,
            })
        },
        get scale(): ScaleFactor {
            return getScale()
        },
        get parent(): Scene | SceneItem | null {
            return parent
        },
        set parent(p: Scene | SceneItem | null) {
            parent = p
        },
        render(painter: Painter): SceneItem {
            painter.drawImageBitmap(image[this.scale], position)
            return this
        }
    }
}

export default defineComponent({
    components: {
        Screen,
        TilePalette,
    },
    setup() {
        const screen = ref<PaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const scale = ref<ScaleFactor>(4)
        const terrains = ref<readonly Image[] | null>(null)
        const currentItem = ref<Image | null>(null)

        const scene = createScene()

        // handle window resize event
        const resize = debounce(() => {
            const { x: leftPos } = (unref(screen) as PaintDevice).rect
            screenWidth.value = window.innerWidth - leftPos
            screenHeight.value = window.innerHeight
        }, 60)

        onMounted(async () => {
            terrains.value = GameData.imageSet("terrain")

            scene.scale = unref(scale)
            scene.gridEnabled = true
            scene.run((unref(screen) as PaintDevice).painter)
            window.addEventListener("resize", resize)
            resize()
        })

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const image = unref(currentItem)
            if (!isNil(image)) {
                const { x, y } = ev.position
                const gridSpacing = scene.gridSpacing
                const position = {
                    x: gridSpacing*Math.floor(x/gridSpacing),
                    y: gridSpacing*Math.floor(y/gridSpacing),
                }
                scene.addItem(createTile(position, image))
            }
        }

        return {
            screen,
            screenWidth,
            screenHeight,
            currentItem,
            terrains,
            onMouseClick,
        }
    }
})
</script>
