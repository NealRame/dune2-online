<template>
    <screen id="minimap" ref="screen"
        :width="width"
        :height="height"
        @mouseClick="onMouseClick"
        @mouseMotion="onMouseMoved"
    />
</template>

<style lang="scss" scoped>
canvas#minimap {
    position: fixed;

    right: $minimap-position-right;
    bottom: $minimap-position-bottom;

    border:
        $minimap-border-color1
        $minimap-border-thickness
        $minimap-border-type;
    border-radius: $minimap-border-radius;
    box-shadow: 0 0 4px $minimap-shadow-color1;

    -webkit-transition: all 0.2s ease-in;
    transition: all 0.2s ease-in;

    &:hover {
        border-color: $minimap-border-color2;
        border-radius: $minimap-border-radius;
        box-shadow: 0 0 16px $minimap-shadow-color2;

        transform: scale(1.01);

        -webkit-transition: all 0.2s ease-out;
        transition: all 0.2s ease-out;
    }
}
</style>

<script lang="ts">
import Screen, { ScreenMouseClickEvent, ScreenMouseMotionEvent } from "@/components/Screen.vue"

import * as Engine from "@/engine"
import { Game } from "@/dune2"
import { PaintDevice } from "@/graphics"

import { isNil } from "lodash"
import { computed, defineComponent, onUpdated, ref, toRef, unref } from "vue"

interface Data {
    game: Game|null
}

export default defineComponent({
    components: { Screen },
    props: ["game"],
    setup(props: Data) {
        const gameRef = toRef(props, "game")
        const scaleRef = ref<Engine.ScaleFactor>(3)
        const screenRef = ref<PaintDevice | null>(null)

        const width = computed(() => {
            const game = unref(gameRef)
            const scale = unref(scaleRef)
            if (!isNil(game)) {
                return scale*game.engine.scene.width
            }
            return 0
        })

        const height = computed(() => {
            const game = unref(gameRef)
            const scale = unref(scaleRef)
            if (!isNil(game)) {
                return scale*game.engine.scene.height
            }
            return 0
        })

        const onMouseClick = (ev: ScreenMouseClickEvent) => {
            // console.log(`minimap: ${ev.position.x} ${ev.position.y}`)
        }

        const onMouseMoved = (ev: ScreenMouseMotionEvent) => {
            // console.log(`minimap: ${ev.position.x} ${ev.position.y}`)
        }

        onUpdated(() => {
            console.log("updated!")
            const game = unref(gameRef)
            if (!isNil(game)) {
                const minimap = Engine.createMiniMap(game.engine)
                minimap.onChanged.subscribe(() => {
                    const image = minimap.image
                    const painter = (unref(screenRef) as PaintDevice).painter

                    if (!(isNil(painter) || isNil(image))) {
                        painter.drawImageBitmap(
                            image,
                            { x: 0, y: 0 },
                            game.engine.scene.rect,
                            painter.size,
                        )
                    }
                })
            }
        })

        return {
            screen: screenRef,
            width,
            height,
            onMouseClick,
            onMouseMoved,
        }
    }
})
</script>
