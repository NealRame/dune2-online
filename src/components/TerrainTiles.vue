<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
    />
    <tile-palette
        v-model="currentTile"
        :tileset="terrainTiles"
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

import { createScene, GameData, ScaleFactor, Scene, SceneItem, Tile, Tileset } from "@/core"
import { PaintDevice, Painter } from "@/graphics"
import { Rect, RectangularCoordinates } from "@/maths"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce, isNil } from "lodash"

function createTileItem(
    position: RectangularCoordinates,
    tile: Tile
): SceneItem {
    let parent: Scene | SceneItem | null = null
    const getScale = () => parent?.scale ?? 1
    return {
        get x() { return position.x },
        get y() { return position.y },
        get width() {
            return tile[getScale()].width
        },
        get height() {
            return tile[getScale()].height
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
            painter.drawImageBitmap(tile[this.scale], position)
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
        const terrainTiles = ref<Tileset | null>(null)
        const currentTile = ref<Tile | null>(null)

        const scene = createScene()

        // handle window resize event
        const resize = debounce(() => {
            const { x: leftPos } = (unref(screen) as PaintDevice).rect
            screenWidth.value = window.innerWidth - leftPos
            screenHeight.value = window.innerHeight
        }, 60)

        onMounted(async () => {
            terrainTiles.value = GameData.tileset("Terrain")
            scene.scale = unref(scale)
            scene.gridEnabled = true
            scene.run((unref(screen) as PaintDevice).painter)
            window.addEventListener("resize", resize)
            resize()
        })

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const tile = unref(currentTile)
            if (!isNil(tile)) {
                const { x, y } = ev.position
                const gridSpacing = scene.gridSpacing
                const position = {
                    x: gridSpacing*Math.floor(x/gridSpacing),
                    y: gridSpacing*Math.floor(y/gridSpacing),
                }
                scene.addItem(createTileItem(position, tile))
            }
        }

        return {
            screen,
            screenWidth,
            screenHeight,
            currentTile,
            terrainTiles,
            onMouseClick,
        }
    }
})
</script>
