<script lang="ts">
import { defineComponent, onMounted, ref } from "vue"

import {
    Dune,
    TerrainImagesIdentifier,
} from "@/dune"

import {
    create
} from "@/engine/engine-factory"

import "@/styles/global.scss"

import Modal from "@/components/Modal.vue"
import ProgressBar from "@/components/ProgressBar.vue"

export default defineComponent({
    components: { Modal, ProgressBar },
    setup() {
        const loadingRef = ref<boolean>(true)
        const loadingLabelRef = ref<string>("")
        const loadingValueRef = ref<number | null>(null)

        onMounted(async () => {
            const engine = await create(Dune, {
                begin() {
                    loadingRef.value = true
                },
                end() {
                    loadingRef.value = false
                },
                setLabel(label) {
                    loadingLabelRef.value = label
                },
                setValue(value) {
                    loadingValueRef.value = value
                },
            })

            console.log(engine.get(TerrainImagesIdentifier))
        })

        return {
            loading: loadingRef,
            loadingLabel: loadingLabelRef,
            loadingValue: loadingValueRef,
        }
    }
})
</script>

<template>
    <modal :show="loading">
        <progress-bar
            :current="loadingValue"
            :label="loadingLabel"
        />
    </modal>
    <h1>DUNE</h1>
</template>
