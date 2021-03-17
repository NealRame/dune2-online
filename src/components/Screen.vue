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
    methods: {
        resize() {
            const {x: left_pos} = this.canvas.getBoundingClientRect()
            this.width = window.innerWidth - left_pos
            this.height = window.innerHeight
        }
    },
    created() {
        window.addEventListener("resize", debounce(this.resize, 40))
    },
    mounted() {
        this.resize()

        const scene = Scene(new Painter(this.context))
        scene.run()
    },
}
</script>