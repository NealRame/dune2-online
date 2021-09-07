<template>
    <canvas ref="canvas" :width="width" :height="height"></canvas>
</template>

<script lang="ts">
import { Rect, IRectangularCoordinates } from "@/maths"
import { Painter } from "@/graphics"

import { clamp, isNil } from "lodash"
import { computed, defineComponent, onMounted, ref, unref } from "vue"

export type ScreenMouseMotionEvent = {
    button: boolean,
    altKey: boolean,
    ctrlKey: boolean,
    metaKey: boolean,
    movement: IRectangularCoordinates,
    position: IRectangularCoordinates,
}

export type ScreenMouseClickEvent = {
    button: boolean,
    altKey: boolean,
    ctrlKey: boolean,
    metaKey: boolean,
    position: IRectangularCoordinates,
}

export default defineComponent({
    emits: ["mouseMotion", "mouseClick"],
    props: ["width", "height"],
    setup(props, { emit }) {
        const canvasRef = ref<HTMLCanvasElement | null>(null)
        let painter: Painter | null

        // handle mouse move event
        const mouseMove = (e: MouseEvent) => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            const { left, top } = canvas.getBoundingClientRect()

            emit("mouseMotion", {
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

            emit("mouseClick", {
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

        onMounted(() => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            // listen to canvas and window events
            canvas.addEventListener("mousemove", mouseMove)
            canvas.addEventListener("click", mouseClick)
            // initialize painter
            painter = new Painter(canvas)
        })

        return {
            canvas: canvasRef,
            painter: computed((): Painter => {
                if (isNil(painter)) {
                    throw new Error("No painter available yet")
                }
                return painter
            }),
            rect: computed((): Rect => {
                const canvas = unref(canvasRef)
                return new Rect({ x: 0, y: 0 }, {
                    width: canvas?.width ?? 0,
                    height: canvas?.height ?? 0,
                })
            })
        }
    }
})
</script>
