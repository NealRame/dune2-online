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

export default defineComponent({
    emits: ["mouseMotion", "mouseClick"],
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
                const x = Math.round(clamp(e.clientX - left, 0, width.value))
                const y = Math.round(clamp(e.clientY - top, 0, height.value))
                emit("mouseMotion", { x, y })
            }
        }

        const mouseClick = (e: MouseEvent) => {
            if (canvas.value != null) {
                const { left, top } = canvas.value.getBoundingClientRect()
                const x = Math.round(clamp(e.clientX - left, 0, width.value))
                const y = Math.round(clamp(e.clientY - top, 0, height.value))
                emit("mouseClick", { x, y })
            }
        }

        onMounted(() => {
            if (canvas.value == null) {
                throw new Error("")
            }

            canvas.value.addEventListener("mousemove", mouseMove)
            canvas.value.addEventListener("click", mouseClick)
            window.addEventListener("resize", resize)

            resize()
        })

        return {
            width,
            height,
            canvas,
        }
    }
})
</script>
