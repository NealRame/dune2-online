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
import { defineComponent, onMounted, ref } from "vue"
import { clamp, debounce } from "lodash"

import { Painter, Scene } from "@/graphics"

export default defineComponent({
    setup(props, { emit }) {
        const width = ref(0)
        const height = ref(0)
        const canvas = ref<HTMLCanvasElement | null>(null)

        // handle window resize event
        const resize = debounce(() => {
            if (canvas.value != null) {
                const { x: leftPos } = canvas.value.getBoundingClientRect()
                width.value = window.innerWidth - leftPos
                height.value = window.innerHeight
            }
        }, 60)

        // handle mouse move event
        const mouseMove = (e: MouseEvent) => {
            if (canvas.value != null) {
                const { left, top } = canvas.value.getBoundingClientRect()
                const x = clamp(e.clientX - left, 0, width.value)
                const y = clamp(e.clientY - top, 0, height.value)
                emit("mouseMotion", { x, y })
            }
        }

        onMounted(() => {
            if (canvas.value == null) {
                throw new Error("")
            }

            canvas.value.addEventListener("mousemove", mouseMove)
            window.addEventListener("resize", resize)

            resize()

            const scene = new Scene(new Painter(canvas.value as HTMLCanvasElement))
            scene.run()
        })

        return {
            width,
            height,
            canvas,
        }
    }
})
</script>
