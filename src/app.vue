<script lang="ts">
import { defineComponent, onMounted, ref, unref } from "vue"

import { debounce } from "lodash"

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

            const land = engine.get(Dune.Land.id)
            land.reveal({ x: 0, y: 0 }, land.size)

            engine.start()
            resize()
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
        <progress-bar
            :current="loadingValue"
            :label="loadingLabel"
        />
    </modal>
    <canvas
        id="screen"
        ref="screen"
        :width="screenWidth"
        :height="screenHeight"
    />
</template>
