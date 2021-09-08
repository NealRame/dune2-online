<template>
    <screen ref="screen"
        :width="screenWidth"
        :height="screenHeight"
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
import Screen from "@/components/Screen.vue"

import { Units } from "@/dune2/game"
import { createGrid, createScene, ScaleFactor, IScene } from "@/engine"
import { Direction } from "@/maths"

import { IPaintDevice } from "@/graphics"

import { defineComponent, onMounted, ref, unref } from "vue"
import { debounce, isNil } from "lodash"

export default defineComponent({
    components: { Screen },
    setup() {
        const screen = ref<IPaintDevice | null>(null)
        const screenWidth = ref(0)
        const screenHeight = ref(0)
        const scale = ref<ScaleFactor>(4)
        let scene: IScene|null = null

        // handle window resize event
        const resize = debounce(() => {
            screenWidth.value = window.innerWidth
            screenHeight.value = window.innerHeight
        }, 60)

        // const onMouseClick = (ev: ScreenMouseClickEvent) => {
        //     const scenePos = screenToSceneCoordinate(scene, ev.position)
        //     console.log(scenePos, scene.rect)
        // }

        onMounted(async () => {
            scene = createScene({
                width: 60,
                height: 60,
            }, (unref(screen) as IPaintDevice).painter)
            scene.scale = unref(scale)

            ;(function animationLoop() {
                if (!isNil(scene)) {
                    scene
                        .update()
                        .render()
                    requestAnimationFrame(animationLoop)
                }
            })()

            const unit = new Units.Trike(scene, { x: 8, y: 8 })

            scene.addLayer(createGrid(scene))
            scene.addLayer("units").addItem(unit)

            window.addEventListener("resize", resize)

            const directions = [
                Direction.North,
                Direction.Northeast,
                Direction.East,
                Direction.Southeast,
                Direction.South,
                Direction.Southwest,
                Direction.West,
                Direction.Northwest,
                // Direction.East,
                // Direction.East,
                // Direction.West,
                // Direction.West,
            ]

            let directionIndex = 0
            unit.onDestinationReached(() => {
                directionIndex = (directionIndex + 1)%directions.length
                unit.move(directions[directionIndex])
            })

            setTimeout(() => {
                unit.move(directions[directionIndex])
            }, 1000)

            resize()
        })

        return {
            screen,
            screenWidth,
            screenHeight,
            // onMouseClick
        }
    }
})
</script>
