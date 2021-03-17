<template>
    <canvas ref="canvas" :width="width" :height="height"></canvas>
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

import Painter from "../graphics/painter"
import Scene from "../graphics/scene"

export default {
    data() {
        return {
            width: 0,
            height: 0,
        }
    },
    computed: {
        canvas() {
            return this.$refs.canvas
        },
        context() {
            return this.canvas.getContext("2d")
        },
    },
    mounted() {
        const update_screen_size = () => {
            const {x: left_pos} = this.canvas.getBoundingClientRect()
            this.width = window.innerWidth - left_pos
            this.height = window.innerHeight
        }
        window.addEventListener("resize", debounce(update_screen_size, 100))
        update_screen_size()

        const scene = Scene(new Painter(this.context))
        scene.run()
    },
}
</script>