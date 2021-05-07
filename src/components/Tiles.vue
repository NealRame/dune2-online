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

import { GameData, Tile, TilesetMap } from "@/core"
import { PaintDevice, Painter, ScaleFactor, Scene, SceneItem } from "@/graphics"
import { RectangularCoordinates } from "@/maths"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce, isNil } from "lodash"

function createTileItem(
    position: RectangularCoordinates,
    tile: Tile
): SceneItem {
    let parent: SceneItem | null = null
    return {
        get x() { return position.x },
        get y() { return position.y },
        get width() {
            return tile[this.getScale()].width
        },
        get height() {
            return tile[this.getScale()].height
        },
        getScale(): ScaleFactor {
            return parent?.getScale() ?? 1
        },
        getParent(): SceneItem | null {
            return parent
        },
        setParent(p: SceneItem | null): SceneItem {
            parent = p
            return this
        },
        render(painter: Painter): SceneItem {
            const scale = this.getScale()
            painter.drawImageBitmap(tile[scale], position)
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
                .setScale(unref(scale))
                .run()
            window.addEventListener("resize", resize)
            resize()
        })

        const onMouseClick = ({ x, y }: RectangularCoordinates) => {
            const tile = unref(currentTile)
            if (!isNil(tile)) {
                const gridSpacing = 16*unref(scale)
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
            tilesets,
            onMouseClick,
        }
    }
})
</script>
