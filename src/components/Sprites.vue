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

import { createScene, createSprite, createTile, GameData, Shape, ScaleFactor, Tile } from "@/core"
import { RectangularCoordinates } from "@/maths"
import { PaintDevice } from "@/graphics"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce, isNil, range } from "lodash"

function makeTile({ position, shape, images }: {
    position?: RectangularCoordinates,
    shape: Shape,
    images: number[],
}): Tile {
    const terrains = GameData.imageSet("terrain")
    return createTile({
        position,
        shape,
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

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const tileDescriptors = GameData.tiles()
            const index = unref(currentItem)

            if (isNil(index)) return

            const { x, y } = ev.position
            const gridSpacing = scene.gridSpacing

            const tileConf = tileDescriptors[index]

            console.log(tileConf)

            scene.addItem(makeTile({
                position: {
                    x: gridSpacing*Math.floor(x/gridSpacing),
                    y: gridSpacing*Math.floor(y/gridSpacing),
                },
                ...tileConf
            }))
        }

        onMounted(async () => {
            scene.gridEnabled = true
            scene.scale = unref(scale)

            tiles.value = GameData.tiles().map(makeTile)

            const gridSpacing = scene.gridSpacing

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
                x: gridSpacing,
                y: gridSpacing,
            }
            liteFactory.position = {
                x: gridSpacing,
                y: 4*gridSpacing,
            }
            heavyFactory.position = {
                x: 4*gridSpacing,
                y: gridSpacing,
            }
            repairFacility.position = {
                x: 4*gridSpacing,
                y: 4*gridSpacing,
            }
            refinery.position = {
                x: 4*gridSpacing,
                y: 7*gridSpacing,
            }
            palace.position = {
                x: 8*gridSpacing,
                y: gridSpacing,
            }
            spaceport.position = {
                x: 12*gridSpacing,
                y: gridSpacing,
            }
            turret.position = {
                x: 8*gridSpacing,
                y: 5*gridSpacing,
            }
            rocketTurret.position = {
                x: 10*gridSpacing,
                y: 5*gridSpacing,
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
            scene.run((unref(screen) as PaintDevice).painter)

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
