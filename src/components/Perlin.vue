<template>
    <screen
        ref="screen"
        :width="800"
        :height="600"
    />
</template>

<style lang="scss" scoped>
canvas {
    border: 1px solid whitesmoke;
}
</style>

<script lang="ts">
import Screen from "@/components/Screen.vue"

import { PaintDevice, Painter } from "@/graphics"
import { defineComponent, onMounted, ref, unref } from "vue"

export default defineComponent({
    components: {
        Screen,
    },
    setup() {
        const screen = ref<PaintDevice | null>(null)
        let painter: Painter | null = null

        onMounted(async () => {
            painter = (unref(screen) as PaintDevice).painter()
            painter.clear("#b4d")
        })

        return {
            screen,
        }
    }
})
</script>
