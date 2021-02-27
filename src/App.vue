<template>
    <div>
        <progress-bar
            v-if="gameDataLoading"
            :current="gameDataProgress"
            :label="gameDataProgressLabel" />
        <tile-palette
            v-if="!gameDataLoading"
            :tilesets="gameTilesets" />
        <screen
            v-if="!gameDataLoading"
            ref="screen" />
    </div>
</template>

<style scoped>

</style>

<script>
import {fetch_data} from "./core/functional"
import * as DuneRC from "./core/dune2-rc"

import {loadPalette} from "./core/palette"
import {loadTilesets} from "./core/tile"

import ProgressBar from "./components/ProgressBar.vue"
import Screen from "./components/Screen.vue"
import TilePalette from "./components/TilePalette.vue"

export default {
    components: {ProgressBar, Screen, TilePalette},
    data() {
        return {
            gameDataLoading: true,
            gameDataProgressLabel: "",
            gameDataProgress: 0,
            gamePalette: null,
            gameTilesets: null,
        }
    },
    async mounted() {
        this.gameDataProgressLabel = "Fetching data ... "
        const bytes = await fetch_data(
            "/assets/dune2.rc",
            (receivedLength, totalLength) => {
                this.gameDataProgress = Math.min(receivedLength/totalLength, 1)
            }
        )
        this.gameDataProgressLabel = "Deserializing the data ... "
        const game_data = DuneRC.Data.deserializeBinary(bytes)

        this.gameDataProgressLabel = "Loading palette ... "
        this.gamePalette = await loadPalette(game_data)

        this.gameDataProgressLabel = "Loading tilesets ... "
        this.gameTilesets = await loadTilesets(game_data, this.gamePalette)

        this.gameDataLoading = false
    },
}
</script>