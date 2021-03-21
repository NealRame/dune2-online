<template>
    <progress-bar
        v-if="gameDataLoading"
        :current="gameDataProgress"
        :label="gameDataProgressLabel"
    />
    <tile-palette 
        ref="tilePalette"
        @tile-changed="onTileChanged"
    />
    <screen ref="screen" />
</template>

<style lang="scss" scoped>
</style>

<script>
import fetch_data from "./utils/fetch"

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
    methods: {
        onTileChanged({tileset, tile}) {
            console.log(tileset, tile)
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

        this.gameDataProgressLabel = "Loading data ... "
        const tilesets = await Dune2RCWorker.deserialize(bytes)

        this.$refs.tilePalette.setTilesets(tilesets)
        this.gameDataLoading = false
        this.gameDataLoaded = true
    }
}
</script>