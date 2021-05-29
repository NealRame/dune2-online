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

import { createScene, createSprite, createTile, GameData, ScaleFactor, Tile } from "@/core"
import { RectangularCoordinates, Size } from "@/maths"
import { PaintDevice } from "@/graphics"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce, isNil, range } from "lodash"

function makeTile({ position, size, images }: {
    position?: RectangularCoordinates,
    size: Size,
    images: number[],
}): Tile {
    const terrains = GameData.imageSet("terrain")
    return createTile({
        position,
        size,
        images: images.map((index: number) => terrains[index])
    })
}

// rubbles:
// 2x2 => 28
// 3x2 => 34
// 3x3 => 24

// construction site:
// 2x2 => 213
// 3x2 => 219
// 3x3 => 209

//
function makeSprite(tiles: number[]) {
    const tileDescriptors = GameData.tiles()
    const frameCount = 30
    let frame = 0
    const sprite = createSprite({
        onUpdate() {
            frame = (frame + 1) % frameCount
            if (frame === 0) {
                sprite.frameIndex = (sprite.frameIndex + 1) % sprite.frameCount
            }
        }
    })

    tiles.forEach(index => {
        sprite.addFrame(makeTile(tileDescriptors[index]))
    })

    return sprite
}

export default defineComponent({
    components: {
        Screen,
        TilePalette
    },
    setup() {
        const screen = ref<PaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const tiles = ref<readonly Tile[] | null>(null)
        const scale = ref<ScaleFactor>(4)
        const scene = createScene()
        const currentItem = ref<number | null>(null)

        // handle window resize event
        const resize = debounce(() => {
            const { x: leftPos } = (unref(screen) as PaintDevice).rect
            screenWidth.value = window.innerWidth - leftPos
            screenHeight.value = window.innerHeight
        }, 60)

        const screenToSceneCoordinates = (position: RectangularCoordinates) => {
            const gridSpacing = scene.gridSpacing
            return {
                x: Math.floor(position.x/gridSpacing),
                y: Math.floor(position.y/gridSpacing),
            }
        }

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const tileDescriptors = GameData.tiles()
            const index = unref(currentItem)

            if (isNil(index)) return

            const tileConf = tileDescriptors[index]

            console.log(tileConf)

            scene.addItem(makeTile({
                position: screenToSceneCoordinates(ev.position),
                ...tileConf
            }))
        }

        onMounted(async () => {
            scene.gridEnabled = true
            scene.scale = unref(scale)

            tiles.value = GameData.tiles().map(makeTile)

            const repairFacility = makeSprite([277, 278, 279, 280, 281, 282, 283, 284])
            const radar = makeSprite([311, 312, 313, 314])
            const liteFactory = makeSprite([215, 216, 217, 218])
            const palace =makeSprite([211, 212])
            const spaceport = makeSprite([257, 258, 259, 260, 261, 262])
            const refinery = makeSprite([267, 268, 269, 270, 271, 272])
            const heavyFactory = makeSprite([221, 222, 223, 224, 225, 226])
            const turret = makeSprite(range(287, 295))
            const rocketTurret = makeSprite(range(297, 305))

            radar.position = {
                x: 1,
                y: 1,
            }
            liteFactory.position = {
                x: 1,
                y: 4,
            }
            heavyFactory.position = {
                x: 4,
                y: 1,
            }
            repairFacility.position = {
                x: 4,
                y: 4,
            }
            refinery.position = {
                x: 4,
                y: 7,
            }
            palace.position = {
                x: 8,
                y: 1,
            }
            spaceport.position = {
                x: 12,
                y: 1,
            }
            turret.position = {
                x: 8,
                y: 5,
            }
            rocketTurret.position = {
                x: 10,
                y: 5,
            }

            scene
                .addItem(radar)
                .addItem(liteFactory)
                .addItem(heavyFactory)
                .addItem(repairFacility)
                .addItem(refinery)
                .addItem(spaceport)
                .addItem(palace)
                .addItem(turret)
                .addItem(rocketTurret)
                .run((unref(screen) as PaintDevice).painter)

            window.addEventListener("resize", resize)

            resize()
        })

        return {
            currentItem,
            screen,
            screenWidth,
            screenHeight,
            tiles,
            onMouseClick
        }
    }
})
</script>
