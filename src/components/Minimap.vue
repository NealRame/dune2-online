<template>
    <screen id="minimap" ref="screen"
        :width="width"
        :height="height"
        @mouseClick="onMouseClick"
        @mouseMotion="onMouseMoved"
    />
</template>

<style lang="scss" scoped>
canvas#minimap {
    position: fixed;
    border: 1px solid #666;
    border-radius: 4px;
    box-shadow: 0 0 4px rgba($color: #000000, $alpha: 0.5);
    right: 16px;
    bottom: 16px;
    -webkit-transition: box-shadow 0.1s linear;
    transition: transform 0.1s box-shadow 0.1s linear;
    &:hover {
        box-shadow: 0 0 16px rgba($color: #000000, $alpha: 0.5);
        -webkit-transition: box-shadow 0.1s linear;
        transition: box-shadow 0.1s linear;
        transform: scale(1.01);
    }
}
</style>

<script lang="ts">
import Screen, { ScreenMouseClickEvent, ScreenMouseMotionEvent } from "@/components/Screen.vue"

import { ScaleFactor, MiniMap } from "@/engine"
import { PaintDevice } from "@/graphics"
import { Rect } from "@/maths"

import { isNil } from "lodash"
import { computed, defineComponent, onUpdated, ref, unref } from "vue"

interface Data {
    minimap: MiniMap|null
}

export default defineComponent({
    components: { Screen },
    props: ["minimap"],
    setup(props: Data) {
        const screen = ref<PaintDevice | null>(null)
        const scale = ref<ScaleFactor>(2)

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            // console.log(`minimap: ${ev.position.x} ${ev.position.y}`)
        }

        const onMouseMoved = (ev: ScreenMouseMotionEvent) => {
            // console.log(`minimap: ${ev.position.x} ${ev.position.y}`)
        }

        const width = computed(() => {
            const minimap = props.minimap
            if (!isNil(minimap)) {
                return unref(scale)*minimap.width
            }
            return 0
        })
        const height = computed(() => {
            const minimap = props.minimap
            if (!isNil(minimap)) {
                return unref(scale)*minimap.height
            }
            return 0
        })

        onUpdated(() => {
            console.log("updated!")
            const minimap = props.minimap
            if (!isNil(minimap)) {
                minimap.onChanged.subscribe(() => {
                    const image = minimap.image
                    const painter = (unref(screen) as PaintDevice).painter
                    if (!(isNil(painter) || isNil(image))) {
                        painter.drawImageBitmap(
                            image,
                            { x: 0, y: 0 },
                            new Rect({ x: 0, y: 0 }, minimap),
                            painter.size,
                        )
                    }
                })
            }
        })

        return {
            screen,
            width,
            height,
            onMouseClick,
            onMouseMoved,
        }
    }
})
</script>
