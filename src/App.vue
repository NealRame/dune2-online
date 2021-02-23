<template>
    <div>
        <progress-bar
            v-if="!gameData"
            :current="gameDataProgress"
            :label="gameDataProgressLabel" />
        <tile-palette 
            v-if="gameData"
            :tilesets="tilesets" :palette="gamePalette"/>
        <screen ref="screen"/>
    </div>
</template>

<style scoped>
</style>

<script>
import {fetch_data} from "./core/functional"
import * as DuneRC from "./core/dune2-rc"

import Palette from "./core/palette"

import ProgressBar from "./components/ProgressBar.vue"
import Screen from "./components/Screen.vue"
import TilePalette from "./components/TilePalette.vue"

export default {
    components: {ProgressBar, Screen, TilePalette},
    data() {
        return {
            gameDataProgressLabel: "",
            gameDataProgress: 0,
            gameData: null,
            gamePalette: null,
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
        this.gameData = DuneRC.Data.deserializeBinary(bytes)
        this.gamePalette = Palette(this.gameData)
    },
    computed: {
        tilesets() {
            return this.gameData != null
                ? this.gameData.getTilesetsMap()
                : new Map()
        }
    }
}
</script>