<template>
    <div id="game">
        <progress-bar
            v-if="gameDataLoading"
            :current="gameDataProgress"
            :label="gameDataProgressLabel" />
        <tile-palette
            ref="tilePalette"
            v-show="gameDataLoaded" />
        <screen
            ref="screen"
            v-show="gameDataLoaded" />
    </div>
</template>

<style lang="scss" scoped>
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
            gameDataLoading: false,
            gameDataLoaded: false,
            gameDataProgressLabel: "",
            gameDataProgress: 0,
        }
    },
    async mounted() {
        this.gameDataProgressLabel = "Fetching data ... "
        this.gameDataLoading = true

        const bytes = await fetch_data(
            "/assets/dune2.rc",
            (receivedLength, totalLength) => {
                this.gameDataProgress = Math.min(receivedLength/totalLength, 1)
            }
        )

        this.gameDataProgressLabel = "Deserializing the data ... "
        const game_data = DuneRC.Data.deserializeBinary(bytes)

        this.gameDataProgressLabel = "Loading palette ... "
        const palette = await loadPalette(game_data)

        this.gameDataProgressLabel = "Loading tilesets ... "
        const tilesets = await loadTilesets(game_data, palette)

        this.gameDataLoading = false
        this.gameDataLoaded = true
        this.$refs.tilePalette.setTilesets(tilesets)
    },
}
</script>