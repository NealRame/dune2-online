<script lang="ts">
import "@/styles/global.scss"

import { EngineKey } from "./constants"

import Modal from "@/components/Modal.vue"
import ProgressBar from "@/components/ProgressBar.vue"

import * as Dune from "@/dune"
import * as Engine from "@/engine"

import { isNil } from "lodash"
import { defineComponent, inject, onMounted, ref } from "vue"

export default defineComponent({
    name: "App",
    components: {
        Modal,
        ProgressBar,
    },
    setup() {
        const loadingRef = ref<boolean>(false)
        const loadingLabelRef = ref<string>("")
        const loadingValueRef = ref<number | null>(null)

        onMounted(async () => {
            const engine = inject(EngineKey)
            if (!isNil(engine)) {
                engine.events
                    .on("stateChanged", state => {
                        loadingRef.value = state === Engine.State.Initializing
                    })
                    .on("downloadingResourceBegin", ({ name }) => {
                        loadingLabelRef.value = `Downloading ${name}...`
                        loadingValueRef.value = null
                    })
                    .on("decodingResourceBegin", ({ name }) => {
                        loadingLabelRef.value = `Decoding ${name}...`
                        loadingValueRef.value = null
                    })
                    .on("downloadingResourceProgress", ({ current, total }) => {
                        if (!(isNil(current) || isNil(total))) {
                            loadingValueRef.value = current/total
                        }
                    })
                await engine.initialize()
            }
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
        <progress-bar :current="loadingValue" :label="loadingLabel"/>
    </modal>
    <router-view />
</template>
