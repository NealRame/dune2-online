<template>
    <progress-bar
        v-if="gameDataLoading"
        :current="gameDataProgress"
        :label="gameDataProgressLabel"
    />
    <screen ref="screen"
        @mouseClick="onMouseClick"
    />
    <tile-palette
        ref="tilePalette"
        v-model="currentTile"
        :tilesets="tilesets"
    />
</template>

<script lang="ts">
import "@/styles/global.scss"

import ProgressBar from "@/components/ProgressBar.vue"
import Screen from "@/components/Screen.vue"
import TilePalette from "@/components/TilePalette.vue"

import { LandItem, GameData, Palette, SoundsetMap, Tile, TilesetMap } from "@/core"
import { PaintDevice, Scene } from "@/graphics"
import { fetchData } from "@/utils"
import * as Workers from "@/workers"

import { defineComponent, onMounted, ref, Ref, unref } from "vue"
import { RectangularCoordinates } from "./maths"
import { isNil } from "lodash"

async function fetchGameData(
    gameDataProgress: Ref<number>,
    gameDataProgressLabel: Ref<string>,
) {
    type FetchedData = Record<keyof GameData, Uint8Array>

    const fetchedData: Partial<FetchedData> = {}
    for (const item of ["palette", "tilesets", "soundsets"] as const) {
        gameDataProgressLabel.value = `Fetching ${item} ...`
        fetchedData[item] = await fetchData(
            `/assets/${item}.json.gz`,
            (current: number, total: number) => {
                gameDataProgress.value = Math.min(current/total, 1)
            }
        )
    }
    return fetchedData as FetchedData
}

async function decodeGameData(
    gameDataProgress: Ref<number>,
    gameDataProgressLabel: Ref<string>,
) {
    const fetchedData = await fetchGameData(gameDataProgress, gameDataProgressLabel)
    const gameData: Partial<GameData> = {}

    gameDataProgressLabel.value = "Decoding palette ..."
    gameData.palette = await Workers.decodePalette(
        fetchedData.palette
    ) as Palette
    gameDataProgress.value = 1/3

    gameDataProgressLabel.value = "Decoding tilesets ..."
    gameData.tilesets = await Workers.decodeTilesets(
        fetchedData.tilesets, gameData.palette
    ) as TilesetMap
    gameDataProgress.value = 2/3

    gameDataProgressLabel.value = "Decoding soundsets ..."
    gameData.soundsets = await Workers.decodeSoundsets(
        fetchedData.soundsets
    ) as SoundsetMap
    gameDataProgress.value = 3/3

    return gameData as GameData
}

export default defineComponent({
    components: {
        ProgressBar,
        Screen,
        TilePalette,
    },
    setup() {
        const gameDataLoading = ref(false)
        const gameDataProgressLabel = ref("")
        const gameDataProgress = ref(0)
        const tilesets = ref<TilesetMap | null>(null)
        const screen = ref<PaintDevice | null>(null)
        const currentTile = ref<Tile | null>(null)

        const scene = new Scene()

        onMounted(async () => {
            gameDataLoading.value = true

            const gameData = await decodeGameData(gameDataProgress, gameDataProgressLabel)

            tilesets.value = gameData.tilesets
            gameDataLoading.value = false

            scene
                .setPainter((unref(screen) as PaintDevice).painter())
                .run()
        })

        const onMouseClick = ({ x, y }: RectangularCoordinates) => {
            const tile = unref(currentTile)
            if (!isNil(tile)) {
                const item = LandItem(tile)
                item.x = Math.floor(x/32)*32
                item.y = Math.floor(y/32)*32
                item.scale = 2
                scene.addItem(item)
            }
        }

        return {
            gameDataLoading,
            gameDataProgressLabel,
            gameDataProgress,
            currentTile,
            tilesets,
            screen,
            onMouseClick,
        }
    }
})
</script>

<style lang="scss">
#app {
    color: whitesmoke;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    text-align: center;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>
