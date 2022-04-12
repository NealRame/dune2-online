<script lang="ts">

import * as Engine from "@/engine"
import { Painter } from "@/graphics"
import { Rect } from "@/maths"

import { isNil } from "lodash"
import { defineComponent, onMounted, ref, toRef, unref } from "vue"

export default defineComponent({
    props: ["engine"],
    setup(props: { engine: Engine.IEngine }) {
        const engineRef = toRef(props, "engine")
        const screenRef = ref<HTMLCanvasElement | null>(null)
        // let viewport: Engine.IViewport|null = null

        const refresh = () => {
            const engine = unref(engineRef)
            const screen = unref(screenRef)
            const { width, height } = engine.get(Engine.GameScene).size

            if (isNil(screen)) return

            const miniMap = engine.get(Engine.GameMinimap)
            const painter = new Painter(screen)
            const image = miniMap.image

            painter.clear("#000")

            if (!isNil(image)) {
                painter.drawImageBitmap(
                    image,
                    {
                        x: screen.width/2 - width,
                        y: screen.height/2 - height,
                    },
                    new Rect({ x: 0, y: 0 }, image),
                    {
                        width: 2*width,
                        height: 2*height,
                    }
                )
            }

            // if (!isNil(viewport)) {
            //     const rect = viewport.rect.scale(unref(scaleRef))
            //     painter.pen = {
            //         lineWidth: 1,
            //         strokeStyle: "#fff",
            //     }
            //     painter.drawRect(rect.topLeft(), rect.size)
            // }
        }

        onMounted(() => {
            refresh()
            const engine = unref(engineRef)
            const miniMap = engine.get(Engine.GameMinimap)
            miniMap.events.on("changed", refresh)
        })

        return {
            screen: screenRef,
        }
    }
})
</script>

<template>
    <canvas id="minimap" ref="screen" width="256" height="256"/>
</template>

<style lang="scss" scoped>
#minimap {
    background-color: rgba($color: black, $alpha: .5);
    border: 2px solid sandybrown;
    border-radius: 8px;

    padding: 1ch;
}
</style>
