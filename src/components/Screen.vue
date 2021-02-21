<template>
    <canvas ref="canvas"></canvas>
</template>

<style scoped>
canvas {
    position: absolute;
    top: 0;
    left: 256px;
}
</style>

<script>
import debounce from "lodash/debounce"
export default {
    computed: {
        context() {
            return this.$refs.canvas.getContext("2d")
        },
        width() {
            return this.$refs.canvas.width
        },
        height() {
            return this.$refs.canvas.height
        }
    },
    mounted() {
        const update_screen_size = () => {
            const {x: left_pos} = this.$refs.canvas.getBoundingClientRect()
            this.$refs.canvas.width = window.innerWidth - left_pos
            this.$refs.canvas.height = window.innerHeight
        }
        update_screen_size()
        window.addEventListener("resize", debounce(update_screen_size, 200))

        const loop = () => {
            const context = this.context

            context.lineWidth = 1
            context.fillStyle = "#dead33"
            context.fillRect(64, 64, 128, 128)

            requestAnimationFrame(loop)
        }
        loop()
    },
}
</script>