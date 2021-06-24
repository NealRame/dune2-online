<template>
    <modal :show="gameDataLoading">
        <progress-bar
            :current="gameDataProgress"
            :label="gameDataProgressLabel"
        />
    </modal>
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

import Modal from "@/components/Modal.vue"
import ProgressBar from "@/components/ProgressBar.vue"
import { Data } from "@/dune2"

import { defineComponent, onMounted, ref } from "vue"

export default defineComponent({
    components: {
        Modal,
        ProgressBar
    },
    setup() {
        const gameDataLoading = ref(true)
        const gameDataProgressLabel = ref("")
        const gameDataProgress = ref(0)

        onMounted(async () => await Data.load({
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
