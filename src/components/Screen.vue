<template>
    <canvas ref="canvas"></canvas>
</template>

<style lang="scss" scoped>
canvas {
    position: absolute;
    top: 0;
    left: $palette-width;
}
</style>

<script>
import debounce from "lodash/debounce"

import Rect from "../maths/rect"
import Painter from "../graphics/painter"
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
        },
        size() {
            return {
                width: this.width,
                height: this.height
            }
        },
        rect() {
            return Rect({ x: 0, y: 0, }, this.size)
        },
    },
    mounted() {
        const update_screen_size = () => {
            const {x: left_pos} = this.$refs.canvas.getBoundingClientRect()
            this.$refs.canvas.width = window.innerWidth - left_pos
            this.$refs.canvas.height = window.innerHeight
        }

        update_screen_size()
        window.addEventListener("resize", debounce(update_screen_size, 200))

        const painter = Painter(this)

        const loop = () => {
            painter.clear()
            requestAnimationFrame(loop)
        }
        loop()
    },
}
</script>