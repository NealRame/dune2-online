<script lang="ts">
import { defineComponent, onMounted, reactive, ref, unref, watch } from "vue"

import { debounce, isNil } from "lodash"

import * as Dune from "@/dune"
import * as Engine from "@/engine"

import InputRange from "@/components/InputRange.vue"
import MiniMap from "@/components/MiniMap.vue"
import Modal from "@/components/Modal.vue"
import Screen, { IScreen } from "@/components/Screen.vue"
import ProgressBar from "@/components/ProgressBar.vue"

import { GameScene } from "@/engine/constants"

export default defineComponent({
    components: { InputRange, MiniMap, Modal, ProgressBar, Screen },
    setup() {
        const engineRef = ref<Engine.IEngine | null>(null)

        const loadingRef = ref<boolean>(true)
        const loadingLabelRef = ref<string>("")
        const loadingValueRef = ref<number | null>(null)

        const screenRef = ref<IScreen | null>(null)
        const screenWidthRef = ref(0)
        const screenHeightRef = ref(0)

        const showInspector = ref(false)

        const landConfig = reactive(Dune.Land.ensureConfig({
            size: {
                width: 32,
                height: 32,
            },
        }))

        // zoom event handler
        const zoomIn = () => {
            const engine = unref(engineRef)
            if (!isNil(engine)) {
                engine.get(GameScene).zoomIn()
            }
        }

        const zoomOut = () => {
            const engine = unref(engineRef)
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

            const screen = unref(screenRef) as IScreen
            const paintDevice = screen.getPaintDevice()
            const engine = await Engine.create(Dune.Game, Engine.Mode.Editor, paintDevice)

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
            engine.get(Dune.Land.id).generate({ size: { width: 32, height: 32 } })

            engineRef.value = engine
        })

        return {
            engine: engineRef,
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
    <screen
        ref="screen"
        :width="screenWidth"
        :height="screenHeight"
    />
    <div id="settings" v-if="engine">
        <div id="land-inspector" v-show="showInspector">
            <h2>Size</h2>
            <input-range
                label="Width"
                v-model="landConfig.size.width"
                :range="[16, 128]"
                :step="1"
            />
            <input-range
                label="Height"
                v-model="landConfig.size.height"
                :range="[16, 128]"
                :step="1"
            />

            <h2>Terrain</h2>
            <input-range
                label="Scale"
                v-model="landConfig.terrainScale"
                :range="[16, 64]"
                :step="1"
            />
            <input-range
                label="Details"
                v-model="landConfig.terrainDetails"
                :range="[1, 6]"
                :step="1"
            />
            <input-range
                label="Sand"
                v-model="landConfig.terrainSandThreshold"
            />
            <input-range
                label="Rock"
                v-model="landConfig.terrainRockThreshold"
            />
            <input-range
                label="Mountain"
                v-model="landConfig.terrainMountainsThreshold"
            />

            <h2>Spice</h2>
            <input-range
                label="Scale"
                v-model="landConfig.spiceScale"
                :range="[16, 64]"
                :step="1"
            />
            <input-range
                label="Details"
                v-model="landConfig.spiceDetails"
                :range="[1, 6]"
                :step="1"
            />
            <input-range
                label="Threshold"
                :step="0.001"
                v-model="landConfig.spiceThreshold"
            />
            <input-range
                label="Saturation"
                :step="0.001"
                v-model="landConfig.spiceSaturationThreshold"
            />
        </div>
        <mini-map :engine="engine" />
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

    align-items: stretch;

    flex-direction: column;

    gap: .5rem;

    position: fixed;
    bottom: 16px;
    right: 16px;
}
#land-inspector {
    background-color: rgba($color: black, $alpha: .5);
    border: 2px solid sandybrown;
    border-radius: 8px;

    font-size: .75rem;

    display: grid;
    grid-template-columns: auto 100fr min(6ch);

    justify-items: stretch;
    align-items: center;

    padding: 1ch;

    & > h2 {
        background-color: rgba($color: black, $alpha: .25);
        font-size: 1rem;
        grid-column: 1 / span 3;
        margin: .25rem 0;
        width: 100%;
    }
}
#fabs {
    display: flex;

    flex-direction: row;
    justify-content: space-between;

    button {
        background-color: rgba($color: black, $alpha: .5);
        border: 2px solid sandybrown;
        border-radius: 100%;

        color: whitesmoke;

        flex-grow: 0;
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
</style>
