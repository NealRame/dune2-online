<script lang="ts">

import Screen, { IScreen } from "@/components/Screen.vue"

import * as Engine from "@/engine"
import { IPaintDevice, ScreenMouseClickEvent } from "@/graphics"
import { Rect } from "@/maths"

import { isNil } from "lodash"

import { defineComponent, onMounted, ref, toRef, unref } from "vue"

export default defineComponent({
    components: { Screen },
    props: ["engine"],
    setup(props: { engine: Engine.IEngine }) {
        const engineRef = toRef(props, "engine")
        const screenRef = ref<IScreen | null>(null)
        const zone = Rect.empty()

        const refresh = () => {
            const engine = unref(engineRef)
            const screen = unref(screenRef) as IScreen
            const paintDevice = screen.getPaintDevice()

            const { width, height } = engine.get(Engine.GameScene).size

            if (isNil(screen)) return

            const miniMap = engine.get(Engine.GameMinimap)
            const painter = paintDevice.painter
            const image = miniMap.image

            zone.x = paintDevice.width/2 - width
            zone.y = paintDevice.height/2 - height
            zone.width = 2*width
            zone.height = 2*height

            painter.clear()

            if (!isNil(image)) {
                painter.drawImageBitmap(
                    image,
                    zone.topLeft(),
                    new Rect({ x: 0, y: 0 }, image),
                    zone.size,
                )
            }

            const { viewport } = engine.get(Engine.GameScene)
            const rect = Rect.fromRect(viewport.rect).scale(2)

            painter.pen = {
                lineWidth: 1,
                strokeStyle: "#fff",
            }
            painter.drawRect(rect.topLeft().add(zone.topLeft()), rect.size)
        }

        const onMouseClicked = (event: ScreenMouseClickEvent) => {
            if (zone.contains(event.position)) {
                const engine = unref(engineRef)
                const { viewport } = engine.get(Engine.GameScene)
                const vRect = viewport.rect

                viewport.position = {
                    x: Math.floor((event.position.x - zone.x - vRect.width)/2),
                    y: Math.floor((event.position.y - zone.y - vRect.height)/2),
                }
            }
        }

        onMounted(() => {
            refresh()
            const engine = unref(engineRef)
            const screen = unref(screenRef) as IScreen
            const paintDevice = screen.getPaintDevice()
            const miniMap = engine.get(Engine.GameMinimap)
            const viewport = engine.get(Engine.GameScene).viewport

            paintDevice.events.on("mouseClicked", onMouseClicked)
            miniMap.events.on("changed", refresh)
            viewport.events.on("changed", refresh)
        })

        return {
            screen: screenRef,
        }
    }
})
</script>

<template>
<div id="minimap">
    <screen ref="screen" width="256" height="256"/>
</div>
</template>

<style lang="scss" scoped>
#minimap {
    background-color: rgba($color: black, $alpha: .5);
    border: 2px solid sandybrown;
    border-radius: 8px;
    padding: 1ch;
}
</style>
