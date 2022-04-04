<script lang="ts">
import { defineComponent, onMounted, ref, unref } from "vue"

import { debounce, isNil } from "lodash"

import * as Dune from "@/dune"
import * as Engine from "@/engine"

import Modal from "@/components/Modal.vue"
import ProgressBar from "@/components/ProgressBar.vue"

export default defineComponent({
    components: { Modal, ProgressBar },
    setup() {
        const loadingRef = ref<boolean>(true)
        const loadingLabelRef = ref<string>("")
        const loadingValueRef = ref<number | null>(null)

        const screenWidthRef = ref(0)
        const screenHeightRef = ref(0)
        const screenRef = ref<HTMLCanvasElement | null>(null)

        // handle window resize event
        const resize = () => {
            const width = window.innerWidth
            const height = window.innerHeight

            screenWidthRef.value = width
            screenHeightRef.value = height
        }

        onMounted(async () => {
            window.addEventListener("resize", debounce(resize, 60))
            window.addEventListener("contextmenu", ev => ev.preventDefault(), false)

            resize()

            const screen = unref(screenRef) as HTMLCanvasElement
            const engine = await Engine.create(Dune.Game, Engine.Mode.Game, screen)

            engine.events
                .on("stateChanged", state => {
                    loadingRef.value = state === Engine.GameState.Initializing
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
            engine.start()

            const land = engine.get(Dune.Land.id)
            land.reveal(land.position, land.size)
        })

        return {
            loading: loadingRef,
            loadingLabel: loadingLabelRef,
            loadingValue: loadingValueRef,
            screen: screenRef,
            screenWidth: screenWidthRef,
            screenHeight: screenHeightRef,
        }
    }
})
</script>

<template>
    <modal :show="loading">
        <progress-bar :current="loadingValue" :label="loadingLabel"/>
    </modal>
    <canvas
        id="screen"
        ref="screen"
        :width="screenWidth"
        :height="screenHeight"
    />
</template>
