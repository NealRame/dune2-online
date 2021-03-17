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
import clamp from "lodash/clamp"

import Painter from "../graphics/painter"
import Scene from "../graphics/scene"

export default {
    emits: ["mouseMotion"],
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
        },
        mouseMove(e) {
            const {left, top} = this.canvas.getBoundingClientRect()
            const x = clamp(e.clientX - left, 0, this.width)
            const y = clamp(e.clientY - top, 0, this.height)
            this.$emit("mouseMotion", {x, y})
        }
    },
    created() {
        window.addEventListener("resize", debounce(this.resize, 40))
    },
    mounted() {
        this.canvas.addEventListener("mousemove", this.mouseMove)
        this.resize()

        const scene = Scene(new Painter(this.context))
        scene.run()
    },
}
</script>