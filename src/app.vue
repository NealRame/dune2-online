<script lang="ts">
import { defineComponent, onMounted, ref, unref } from "vue"

import * as Dune from "@/dune"

import {
    create
} from "@/engine/engine-factory"

import "@/styles/global.scss"

import Modal from "@/components/Modal.vue"
import ProgressBar from "@/components/ProgressBar.vue"

export default defineComponent({
    components: { Modal, ProgressBar },
    setup() {
        const screenRef = ref<HTMLCanvasElement | null>(null)
        const loadingRef = ref<boolean>(true)
        const loadingLabelRef = ref<string>("")
        const loadingValueRef = ref<number | null>(null)

        onMounted(async () => {
            const screen = unref(screenRef) as HTMLCanvasElement
            const engine = await create(Dune.Game, screen, {
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

            console.log(engine.get(Dune.Resources.TerrainImages))
        })

        return {
            loading: loadingRef,
            loadingLabel: loadingLabelRef,
            loadingValue: loadingValueRef,
            screen: screenRef,
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
    <canvas id="screen" ref="screen"/>
</template>
