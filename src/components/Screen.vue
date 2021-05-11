<template>
    <canvas ref="canvas" :width="width" :height="height"></canvas>
</template>

<script lang="ts">
import { Rect } from "@/maths"
import { Painter } from "@/graphics"

import { clamp, isNil } from "lodash"
import { defineComponent, onMounted, ref, unref } from "vue"

export default defineComponent({
    emits: ["mouseMotion", "mouseClick"],
    setup(props, { emit }) {
        const widthRef = ref(0)
        const heightRef = ref(0)
        const canvasRef = ref<HTMLCanvasElement | null>(null)
        let painter: Painter | null

        // handle mouse move event
        const mouseMove = (e: MouseEvent) => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            const { left, top } = canvas.getBoundingClientRect()
            const x = Math.round(clamp(e.clientX - left, 0, unref(widthRef)))
            const y = Math.round(clamp(e.clientY - top, 0, unref(heightRef)))
            emit("mouseMotion", { x, y })
        }
        // handle mouse click event
        const mouseClick = (e: MouseEvent) => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            const { left, top, width, height } = canvas.getBoundingClientRect()
            const x = Math.round(clamp(e.clientX - left, 0, width))
            const y = Math.round(clamp(e.clientY - top, 0, height))
            emit("mouseClick", { x, y })
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
            width: widthRef,
            height: heightRef,
            canvas: canvasRef,
            painter() {
                if (isNil(painter)) {
                    throw new Error("No painter available yet")
                }
                return painter
            },
            rect() {
                const canvas = unref(canvasRef)
                if (!isNil(canvas)) {
                    return new Rect({ x: 0, y: 0 }, {
                        width: canvas.width,
                        height: canvas.height,
                    })
                }
            }
        }
    }
})
</script>
