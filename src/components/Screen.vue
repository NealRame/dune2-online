<script lang="ts">
import { IVector2D } from "@/maths"
import { IPaintDeviceEvents, Painter } from "@/graphics"

import { clamp, isNil } from "lodash"
import { computed, defineComponent, onMounted, ref, toRefs, unref, watch } from "vue"
import { createObservable } from "@/utils"

export type ScreenMouseMotionEvent = {
    button: boolean,
    altKey: boolean,
    ctrlKey: boolean,
    metaKey: boolean,
    movement: IVector2D,
    position: IVector2D,
}

export type ScreenMouseClickEvent = {
    button: boolean,
    altKey: boolean,
    ctrlKey: boolean,
    metaKey: boolean,
    position: IVector2D,
}

export default defineComponent({
    emits: [
        "mouseClick",
        "mouseMotion",
    ],
    props: [
        "height",
        "width",
    ],
    setup(props) {
        let painter: Painter | null

        const canvasRef = ref<HTMLCanvasElement | null>(null)
        const {
            height: heightRef,
            width: widthRef,
        } = toRefs(props)
        const [emitter, events] = createObservable<IPaintDeviceEvents>()

        // handle mouse move event
        const mouseMove = (e: MouseEvent) => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            const { left, top } = canvas.getBoundingClientRect()
            emitter.emit("mouseMoved", {
                button: e.buttons > 0,
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey,
                position: {
                    // TODO consider borders thickness
                    x: Math.round(clamp(e.clientX - left, 0, canvas.width)),
                    y: Math.round(clamp(e.clientY - top, 0, canvas.height)),
                },
                movement: {
                    x: e.movementX,
                    y: e.movementY,
                },
            })
        }

        // handle mouse click event
        const mouseClick = (e: MouseEvent) => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            const { left, top } = canvas.getBoundingClientRect()
            emitter.emit("mouseClicked", {
                button: true,
                position: {
                    // TODO consider borders thickness
                    x: Math.round(clamp(e.clientX - left, 0, canvas.width)),
                    y: Math.round(clamp(e.clientY - top, 0, canvas.height)),
                },
                altKey: e.altKey,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey,
            })
        }

        watch([widthRef, heightRef], ([width, height]) => {
            emitter.emit("resized", {
                height,
                width,
            })
        })

        onMounted(() => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            canvas.addEventListener("mousemove", mouseMove)
            canvas.addEventListener("click", mouseClick)
            // initialize painter
            painter = new Painter(canvas)
        })

        return {
            canvas: canvasRef,
            events,
            painter: computed((): Painter => {
                if (isNil(painter)) {
                    throw new Error("No painter available yet")
                }
                return painter
            }),
        }
    }
})
</script>

<template>
    <canvas ref="canvas" :width="width" :height="height"/>
</template>
