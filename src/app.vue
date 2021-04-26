<template>
    <progress-bar
        v-if="gameDataLoading"
        :current="gameDataProgress"
        :label="gameDataProgressLabel"
    />
    <router-view v-if="!gameDataLoading"></router-view>
</template>

<style lang="scss" scoped>
ul {
    padding: 0;
    list-style-type: none;
}
</style>

<script lang="ts">
import "@/styles/global.scss"

import ProgressBar from "@/components/ProgressBar.vue"
import { GameData } from "@/core"

import { defineComponent, onMounted, ref } from "vue"

export default defineComponent({
    components: {
        ProgressBar
    },
    setup() {
        const gameDataLoading = ref(true)
        const gameDataProgressLabel = ref("")
        const gameDataProgress = ref(0)

        onMounted(async () => await GameData.load({
            begin() {
                gameDataLoading.value = true
            },
            end() {
                gameDataLoading.value = false
            },
            setLabel(label: string) {
                gameDataProgressLabel.value = label
            },
            setValue(value: number) {
                gameDataProgress.value = value
            },
        }))

        return {
            gameDataLoading,
            gameDataProgressLabel,
            gameDataProgress,
        }
    }
})
</script>
