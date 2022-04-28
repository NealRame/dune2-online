<script lang="ts">
import * as Dune from "@/dune"
import * as Engine from "@/engine"
import { createEventManager } from "@/utils"

import { EngineKey } from "@/constants"

import InputRange from "@/components/InputRange.vue"
import MiniMap from "@/components/MiniMap.vue"
import Screen, { IScreen } from "@/components/Screen.vue"

import { debounce, isNil } from "lodash"
import { defineComponent, inject, onMounted, onUnmounted, reactive, ref, unref, watch } from "vue"

export default defineComponent({
    components: { InputRange, MiniMap, Screen },
    setup() {
        const engine = inject(EngineKey)

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
            if (!isNil(engine)) {
                engine.get(Engine.GameScene).zoomIn()
            }
        }

        const zoomOut = () => {
            if (!isNil(engine)) {
                engine.get(Engine.GameScene).zoomOut()
            }
        }

        // handle window resize event
        const resize = () => {
            const width = window.innerWidth
            const height = window.innerHeight

            screenWidthRef.value = width
            screenHeightRef.value = height
        }

        const resizeEventManager = createEventManager(
            window,
            "resize",
            debounce(resize, 100),
        )

        const contextMenuEventManager = createEventManager(
            window,
            "contextmenu",
            ev => ev.preventDefault(),
            false,
        )

        onMounted(async () => {
            if (!isNil(engine)) {
                const screen = unref(screenRef) as IScreen

                contextMenuEventManager.start()
                resizeEventManager.start()
                resize()

                await engine.initialize()
                engine
                    .start(Engine.Mode.Editor, screen.getPaintDevice())
                    .get(Dune.Land.id).generate(landConfig)
                watch(landConfig, () => engine.get(Dune.Land.id).generate(landConfig))
            }
        })

        onUnmounted(() => {
            contextMenuEventManager.stop()
            resizeEventManager.stop()
            if (!isNil(engine)) {
                engine.stop()
            }
        })

        return {
            landConfig,
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
    <screen
        ref="screen"
        :width="screenWidth"
        :height="screenHeight"
    />
    <div id="settings">
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
        <mini-map />
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
