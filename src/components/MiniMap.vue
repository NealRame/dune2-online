<template>
    <div id="minimap-wrapper">
        <button id="zoom-in">
            <font-awesome-icon icon="search-plus" @click="onZoomInClicked"/>
        </button>
        <button id="zoom-out">
            <font-awesome-icon icon="search-minus" @click="onZoomOutClicked"/>
        </button>
        <screen id="minimap" ref="screen"
            :width="width"
            :height="height"
            @mouseClick="onMouseEvent"
            @mouseMotion="onMouseEvent"
        />
    </div>
</template>

<style lang="scss" scoped>
#minimap-wrapper {
    position: fixed;
    right: $minimap-position-right;
    bottom: $minimap-position-bottom;
    padding: 0;

    canvas#minimap {
        border:
            $minimap-color1
            $minimap-border-thickness
            $minimap-border-type;
        border-radius: $minimap-border-radius;
        box-shadow: 0 0 4px $minimap-shadow-color1;

        transition: all 0.2s ease-in;
        -webkit-transition: all 0.2s ease-in;

        &:hover {
            border-color: $minimap-color2;
            border-radius: $minimap-border-radius;
            box-shadow: 0 0 16px $minimap-shadow-color2;

            transform: scale($minimap-scale-factor);

            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
        }
    }

    button {
        background-color: transparent;

        border: none;
        color: $minimap-color1;
        cursor: pointer;

        float: left;
        clear: both;

        height: $minimap-zoom-button-width;
        width: $minimap-zoom-button-height;

        -webkit-transition: all 0.2s ease-in;
        transition: all 0.2s ease-in;

        &:hover {
            color: $minimap-color2;
            transform: scale($minimap-zoom-button-scale-factor);

            -webkit-transition: all 0.2s ease-out;
            transition: all 0.2s ease-out;
        }
    }
}

</style>

<script lang="ts">
import Screen, { ScreenMouseClickEvent, ScreenMouseMotionEvent } from "@/components/Screen.vue"

import * as Engine from "@/engine"
import { Game } from "@/dune2"
import { IPaintDevice } from "@/graphics"

import { isNil } from "lodash"
import { computed, defineComponent, onUpdated, ref, toRef, unref } from "vue"
import { MiniMap, Viewport } from "@/engine"
import { Vector } from "@/maths"

interface Data {
    game: Game|null
}

export default defineComponent({
    components: { Screen },
    props: ["game"],
    setup(props: Data) {
        const gameRef = toRef(props, "game")
        const scaleRef = ref<Engine.ScaleFactor>(3)
        const screenRef = ref<IPaintDevice | null>(null)

        let miniMap: MiniMap|null = null
        let viewport: Viewport|null = null

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

        const refresh = () => {
            const game = unref(gameRef)
            const painter = (unref(screenRef) as IPaintDevice).painter

            if (isNil(game)) return
            if (isNil(painter)) return

            const image = miniMap?.image

            painter.clear("#000")

            if (!isNil(image)) {
                painter.drawImageBitmap(
                    image,
                    { x: 0, y: 0 },
                    game.engine.scene.rect,
                    painter.size,
                )
            }

            if (!isNil(viewport)) {
                const rect = viewport.rect.scale(unref(scaleRef))
                painter.pen = {
                    lineWidth: 1,
                    strokeStyle: "#fff",
                }
                painter.drawRect(rect.topLeft(), rect.size)
            }
        }

        const onZoomInClicked = () => {
            const game = unref(gameRef)
            if (!isNil(game)) {
                game.engine.scene.zoomIn()
            }
        }

        const onZoomOutClicked = () => {
            const game = unref(gameRef)
            if (!isNil(game)) {
                game.engine.scene.zoomOut()
            }
        }

        const onMouseEvent = ({ button, position }: ScreenMouseClickEvent|ScreenMouseMotionEvent) => {
            if (!isNil(viewport) && button) {
                const { x, y } = position
                const { width, height } = viewport.size
                viewport.position = (new Vector(x, y)).mul(1/unref(scaleRef)).sub({
                    x: width/2,
                    y: height/2,
                })
            }
        }

        onUpdated(() => {
            const game = unref(gameRef)
            if (!isNil(game)) {
                miniMap = game.miniMap
                miniMap.onChanged.subscribe(refresh)

                viewport = game.engine.scene.viewport
                viewport.onChanged.subscribe(refresh)

                refresh()
            }
        })

        return {
            screen: screenRef,
            width,
            height,
            onMouseEvent,
            onZoomInClicked,
            onZoomOutClicked,
        }
    }
})
</script>
