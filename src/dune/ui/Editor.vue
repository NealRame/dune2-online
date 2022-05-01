<script lang="ts">
import * as Dune from "@/dune"
import * as Engine from "@/engine"
import { createEventManager } from "@/utils"

import { EngineKey } from "@/constants"

import Icon from "./Icon.vue"
import LandConfigPanel from "./LandConfigPanel.vue"
import MiniMap from "./MiniMap.vue"
import Screen, { IScreen } from "./Screen.vue"

import { debounce, isNil } from "lodash"
import { defineComponent, inject, onMounted, onUnmounted, ref, unref, watch } from "vue"

export default defineComponent({
    components: { Icon, LandConfigPanel, MiniMap, Screen },
    setup() {
        const engine = inject(EngineKey)

        const screenRef = ref<IScreen | null>(null)
        const screenWidthRef = ref(0)
        const screenHeightRef = ref(0)

        const showInspector = ref(false)

        const landConfig = ref(Dune.Land.ensureConfig({
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
                    .get(Dune.Land.id).generate(unref(landConfig))
                watch(landConfig, value => engine.get(Dune.Land.id).generate(value))
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
    <div id="right-panel">
        <mini-map />
        <div id="land-actions">
            <button id="open-settings" @click="showInspector=!showInspector">
                <icon type="settings" />
            </button>
            <button id="seed" @click="landConfig.seed = Date.now()">
                <icon type="refresh" />
            </button>
            <button id="zoom-in" @click="zoomIn">
                <icon type="zoom-in" />
            </button>
            <button id="zoom-out" @click="zoomOut">
                <icon type="zoom-out" />
            </button>
        </div>
        <land-config-panel v-model="landConfig" v-show="showInspector"/>
    </div>
</template>

<style lang="scss" scoped>
#land-actions {
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
