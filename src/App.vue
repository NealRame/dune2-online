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

import ProgressBar from "./components/ProgressBar.vue"
import Screen from "./components/Screen.vue"
import TilePalette from "./components/TilePalette.vue"


import * as Dune2RCWorker from "./worker"

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
        this.gameDataLoading = true

        this.gameDataProgressLabel = "Fetching data ... "
        const bytes = await fetch_data(
            "/assets/dune2.rc",
            (receivedLength, totalLength) => {
                this.gameDataProgress = Math.min(receivedLength/totalLength, 1)
            }
        )

        const tilesets = await Dune2RCWorker.deserialize(bytes)

        this.gameDataLoading = false
        this.gameDataLoaded = true
        this.$refs.tilePalette.setTilesets(tilesets)
    },
}
</script>