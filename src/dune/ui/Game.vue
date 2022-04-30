<script lang="ts">
import { defineComponent, inject, onMounted, onUnmounted, ref, unref } from "vue"

import { debounce, isNil } from "lodash"

import * as Dune from "@/dune"
import * as Engine from "@/engine"
import { createEventManager } from "@/utils"

import { EngineKey } from "@/constants"

import Screen, { IScreen } from "@/dune/ui/Screen.vue"

export default defineComponent({
    components: { Screen },
    setup() {
        const engine = inject(EngineKey)

        const screenWidthRef = ref(0)
        const screenHeightRef = ref(0)
        const screenRef = ref<IScreen | null>(null)

        const landConfig = Dune.Land.ensureConfig({
            size: {
                width: 32,
                height: 32,
            },
        })

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
                    .start(Engine.Mode.Game, screen.getPaintDevice())
                    .get(Dune.Land.id).generate(landConfig)
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
            screen: screenRef,
            screenWidth: screenWidthRef,
            screenHeight: screenHeightRef,
        }
    }
})
</script>

<template>
    <screen
        id="screen"
        ref="screen"
        :width="screenWidth"
        :height="screenHeight"
    />
</template>
