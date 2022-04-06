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
            const engine = await Engine.create(Dune.Game, Engine.Mode.Editor, screen)

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
            land.generate({ size: { width: 32, height: 32 } })
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

<style lang="scss" scoped>
.land-inspector {
    border: 2px solid sandybrown;
    border-radius: 8px;
    background-color: rgba($color: black, $alpha: .5);

    display: grid;
    grid-template-columns: auto 100fr;

    padding: 1ch;

    position: absolute;

    bottom: 12px;
    right: 12px;

    & > label {
        justify-self: right;
        margin-right: 1ch;

        &::after {
            content: ":";
        }
    }

    & > hr {
        grid-column: 1 / span 2;
        width: 100%;
    }
}
</style>

<template>
    <modal :show="loading">
        <progress-bar :current="loadingValue" :label="loadingLabel"/>
    </modal>
    <div class="land-inspector">
        <label for="width">Width</label>
        <input name="width" type="range" min="16" max="256" v-model="width"/>

        <label for="height">Height</label>
        <input name="height" type="range" min="16" max="256" v-model="height"/>

        <hr>

    </div>
    <canvas
        id="screen"
        ref="screen"
        :width="screenWidth"
        :height="screenHeight"
    />
</template>
