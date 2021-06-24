<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
        @mouseClick="onMouseClick"
    />
</template>

<style lang="scss" scoped>
canvas {
    position: absolute;
    left: 0;
    top: 0;
}
</style>

<script lang="ts">
import Screen, { ScreenMouseClickEvent } from "@/components/Screen.vue"

import { Data } from "@/dune2"
import { createScene, createSprite, ScaleFactor, Scene, screenToSceneCoordinate } from "@/engine"

import { PaintDevice } from "@/graphics"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce } from "lodash"

function makeSprite(scene: Scene, tiles: number[]) {
    const tileDescriptors = Data.tiles()
    const frameCount = 30
    let frame = 0
    const sprite = createSprite(scene, {
        onUpdate() {
            frame = (frame + 1) % frameCount
            if (frame === 0) {
                sprite.frameIndex = (sprite.frameIndex + 1) % sprite.frameCount
            }
        }
    })

    tiles.forEach(index => {
        const tileDescriptor = tileDescriptors[index]
        sprite.addFrame(tileDescriptor.shape, tileDescriptor.images)
    })

    return sprite
}

export default defineComponent({
    components: { Screen },
    setup() {
        const screen = ref<PaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const scale = ref<ScaleFactor>(4)
        const scene = createScene()

        // handle window resize event
        const resize = debounce(() => {
            screenWidth.value = window.innerWidth
            screenHeight.value = window.innerHeight
        }, 60)

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            const scenePos = screenToSceneCoordinate(scene, ev.position)
            console.log(scenePos, scene.rect)
        }

        onMounted(async () => {
            scene.gridEnabled = true
            scene.scale = unref(scale)

            scene
                .run((unref(screen) as PaintDevice).painter)

            window.addEventListener("resize", resize)

            resize()
        })

        return {
            screen,
            screenWidth,
            screenHeight,
            onMouseClick
        }
    }
})
</script>
