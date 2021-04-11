<template>
    <progress-bar
        v-if="gameDataLoading"
        :current="gameDataProgress"
        :label="gameDataProgressLabel"
    />
    <screen ref="screen" />
    <tile-palette
        ref="tilePalette"
        v-model="currentTile"
        :tilesets="tilesets"
    />
</template>

<script lang="ts">
import ProgressBar from "@/components/ProgressBar.vue"
import Screen from "@/components/Screen.vue"
import TilePalette from "@/components/TilePalette.vue"

import { GameData, GameDataItems, Palette, Tile, TilesetMap, Tilesets, TilsetsData } from "@/core"
import { PaintDevice, Scene } from "@/graphics"
import { fetchData } from "@/utils"
import * as Workers from "@/workers"

import { defineComponent, onMounted, ref, Ref, unref } from "vue"
import { isNil } from "lodash"

async function fetchGameData(
    gameDataProgress: Ref<number>,
    gameDataProgressLabel: Ref<string>,
) {
    const gameData: Partial<GameData> = {}

    for (const item of GameDataItems) {
        gameDataProgressLabel.value = `Fetching ${item} ...`
        const data = await fetchData(
            `/assets/${item}.json.gz`,
            (current: number, total: number) => {
                gameDataProgress.value = Math.min(current/total, 1)
            }
        )

        gameDataProgressLabel.value = `Decoding ${item} ...`
        gameData[item] = await Workers.decode({ data, item })
    }

    return gameData as GameData
}

async function createTilesets(
    gameDataProgress: Ref<number>,
    gameDataProgressLabel: Ref<string>,
    gameData: GameData,
) {
    const gameTilesets: TilesetMap = {}

    if (!isNil(gameData.tilesets)) {
        for (const tileset of Tilesets) {
            gameDataProgressLabel.value = `Initializing ${tileset} tiles ...`
            gameDataProgress.value = 1
            gameTilesets[tileset] = Object.freeze(await Workers.createTileset({
                tilesData: (gameData.tilesets as TilsetsData)[tileset],
                palette: gameData.palette as Palette,
            }) as Tile[])
        }
    }

    return gameTilesets
}

export default defineComponent({
    components: {
        ProgressBar,
        Screen,
        TilePalette,
    },
    setup() {
        const gameDataLoading = ref(false)
        const gameDataLoaded = ref(false)
        const gameDataProgressLabel = ref("")
        const gameDataProgress = ref(0)
        const tilesets = ref<TilesetMap | null>(null)
        const screen = ref<PaintDevice | null>(null)
        const currentTile = ref<Tile | null>(null)

        onMounted(async () => {
            gameDataLoading.value = true

            const gameData = await fetchGameData(gameDataProgress, gameDataProgressLabel)

            tilesets.value = await createTilesets(gameDataProgress, gameDataProgressLabel, gameData)
            gameDataLoading.value = false
            gameDataLoaded.value = true

            const scene = new Scene((unref(screen) as PaintDevice).painter())
            scene.run()
        })

        return {
            gameDataLoading,
            gameDataLoaded,
            gameDataProgressLabel,
            gameDataProgress,
            currentTile,
            tilesets,
            screen,
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
