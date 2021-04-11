<template>
    <canvas ref="canvas" :width="width" :height="height"></canvas>
</template>

<style lang="scss" scoped>
canvas {
    position: absolute;
    left: $palette-width;
    top: 0;
}
</style>

<script lang="ts">
import { Painter } from "@/graphics"

import { defineComponent, onMounted, ref, unref } from "vue"
import { clamp, debounce, isNil } from "lodash"

export default defineComponent({
    emits: ["mouseMotion", "mouseClick"],
    setup(props, { emit }) {
        const widthRef = ref(0)
        const heightRef = ref(0)
        const canvasRef = ref<HTMLCanvasElement | null>(null)
        let painter: Painter | null

        // handle window resize event
        const resize = debounce(() => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            const { x: leftPos } = canvas.getBoundingClientRect()
            widthRef.value = window.innerWidth - leftPos
            heightRef.value = window.innerHeight
        }, 60)
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
            const { left, top } = canvas.getBoundingClientRect()
            const x = Math.round(clamp(e.clientX - left, 0, unref(widthRef)))
            const y = Math.round(clamp(e.clientY - top, 0, unref(heightRef)))
            emit("mouseClick", { x, y })
        }

        onMounted(() => {
            const canvas = unref(canvasRef) as HTMLCanvasElement
            // listen to canvas and window events
            canvas.addEventListener("mousemove", mouseMove)
            canvas.addEventListener("click", mouseClick)
            window.addEventListener("resize", resize)
            // resize canvas
            resize()
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
        }
    }
})
</script>
