<script lang="ts">
import { defineComponent, onMounted, reactive, ref, unref, watch } from "vue"

import { debounce, isNil } from "lodash"

import * as Dune from "@/dune"
import * as Engine from "@/engine"

import Modal from "@/components/Modal.vue"
import ProgressBar from "@/components/ProgressBar.vue"
import { GameScene } from "@/engine/constants"

export default defineComponent({
    components: { Modal, ProgressBar },
    setup() {
        let engine: Engine.IEngine | null = null

        const loadingRef = ref<boolean>(true)
        const loadingLabelRef = ref<string>("")
        const loadingValueRef = ref<number | null>(null)

        const screenWidthRef = ref(0)
        const screenHeightRef = ref(0)
        const screenRef = ref<HTMLCanvasElement | null>(null)

        const showInspector = ref(false)

        const landConfig = reactive(Dune.Land.ensureConfig({
            size: {
                width: 32,
                height: 32,
            },
        }))

        // zoom event handler
        const zoomIn = () => {
            if (!isNil(engine)) {
                engine.get(GameScene).zoomIn()
            }
        }

        const zoomOut = () => {
            if (!isNil(engine)) {
                engine.get(GameScene).zoomOut()
            }
        }

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

            engine = await Engine.create(Dune.Game, Engine.Mode.Editor, screen)

            watch(landConfig, value => {
                if (!isNil(engine)) {
                    engine.get(Dune.Land.id).generate(value)
                }
            })

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
            landConfig,
            loading: loadingRef,
            loadingLabel: loadingLabelRef,
            loadingValue: loadingValueRef,
            screen: screenRef,
            screenWidth: screenWidthRef,
            screenHeight: screenHeightRef,
            showInspector,
            zoomIn,
            zoomOut,
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
    <div id="settings">
        <div id="land-inspector" v-show="showInspector">
            <h2>Size</h2>

            <label for="width">Width</label>
            <input name="width" type="range" min="16" max="256" v-model="landConfig.size.width"/>
            <span>{{landConfig.size.width}}</span>

            <label for="height">Height</label>
            <input name="height" type="range" min="16" max="256" v-model="landConfig.size.height"/>
            <span>{{landConfig.size.height}}</span>

            <h2>Terrain</h2>

            <label for="terrain-scale">Scale</label>
            <input name="terrain-scale" type="range" min="16" max="64" step="1" v-model="landConfig.terrainScale"/>
            <span>{{landConfig.terrainScale}}</span>

            <label for="terrain-details">Details</label>
            <input name="terrain-scale" type="range" min="1" max="6" step="1" v-model="landConfig.terrainDetails"/>
            <span>{{landConfig.terrainDetails}}</span>

            <label for="terrain-sand-threshold">Sand threshold</label>
            <input name="terrain-sand-threshold" type="range" min="0" max="1" step="0.01" v-model="landConfig.terrainSandThreshold"/>
            <span>{{landConfig.terrainSandThreshold}}</span>

            <label for="terrain-rock-threshold">Rock threshold</label>
            <input name="terrain-rock-threshold" type="range" min="0" max="1" step="0.01" v-model="landConfig.terrainRockThreshold"/>
            <span>{{landConfig.terrainRockThreshold}}</span>

            <label for="terrain-mountains-threshold">Mountains Threshold</label>
            <input name="terrain-mountains-threshold" type="range" min="0" max="1" step="0.01" v-model="landConfig.terrainMountainsThreshold"/>
            <span>{{landConfig.terrainMountainsThreshold}}</span>

            <h2>Spice</h2>

            <label for="spice-scale">Scale</label>
            <input name="spice-scale" type="range" min="16" max="64" step="1" v-model="landConfig.spiceScale"/>
            <span>{{landConfig.spiceScale}}</span>

            <label for="spice-details">Details</label>
            <input name="spice-details" type="range" min="1" max="6" step="1" v-model="landConfig.spiceDetails"/>
            <span>{{landConfig.spiceDetails}}</span>

            <label for="spice-threshold">Threshold</label>
            <input name="spice-threshold" type="range" min="0" max="1" step="0.01" v-model="landConfig.spiceThreshold"/>
            <span>{{landConfig.spiceThreshold}}</span>

            <!-- spiceSaturationThreshold, -->
        </div>
        <div id="fabs">
            <button id="open-settings" @click="showInspector=!showInspector">
                <font-awesome-icon icon="wrench"/>
            </button>
            <button id="seed" @click="landConfig.seed = Date.now()">
                <font-awesome-icon icon="sync-alt"/>
            </button>
            <button id="zoom-in">
                <font-awesome-icon icon="search-plus" @click="zoomIn"/>
            </button>
            <button id="zoom-out">
                <font-awesome-icon icon="search-minus" @click="zoomOut"/>
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#settings {
    display: flex;

    align-items: flex-end;
    gap: 16px;
    flex-direction: row;

    position: fixed;
    bottom: 16px;
    right: 16px;
}
#fabs {
    display: flex;

    gap: .5rem;

    flex-direction: column;

    button {
        background-color: rgba($color: black, $alpha: .5);
        border: 2px solid sandybrown;
        border-radius: 100%;

        color: whitesmoke;

        font-size: 1.5rem;

        height: 64px;
        width: 64px;

        &:hover {
            background-color: rgba(245, 245, 245, .25);
        }
        &:active {
            background-color: rgba(245, 245, 245, .5);
        }
    }
}
#land-inspector {
    background-color: rgba($color: black, $alpha: .5);
    border: 2px solid sandybrown;
    border-radius: 8px;

    font-size: .75rem;

    display: grid;
    grid-template-columns: auto 100fr min(6ch);

    padding: 1ch;

    & > label {
        justify-self: right;
        margin-right: 1ch;
    }

    & > span {
        justify-self: left;
        margin-left: 1ch;
    }

    & > button,
    & > h2 {
        grid-column: 1 / span 3;
        width: 100%;
    }

    & > h2 {
        background-color: rgba($color: black, $alpha: .25);
        font-size: 1rem;
        margin: .25rem 0;
    }
}
</style>
