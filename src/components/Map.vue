<template>
    <modal :show="showModal">
        <progress-bar label="Generating map ..." />
    </modal>
    <screen
        ref="screen"
        @mouseMotion="onMouseMoved"
        :width="screenWidth"
        :height="screenHeight"
    />

    <div id="fabs">
        <button id="open-settings" @click="showInspector=!showInspector">
            <font-awesome-icon icon="wrench"/>
        </button>
        <button id="seed" @click="onSeedClicked">
            <font-awesome-icon icon="sync-alt"/>
        </button>
        <button id="zoom-in">
            <font-awesome-icon icon="search-plus" @click="onZoomInClicked"/>
        </button>
        <button id="zoom-out">
            <font-awesome-icon icon="search-minus" @click="onZoomOutClicked"/>
        </button>
    </div>

    <div class="settings" v-show="showInspector">
        <label for="width">Width</label>
        <input name="width" type="number" min="16" max="256" v-model="width"/>

        <label for="height">Height</label>
        <input name="height" type="number" min="16" max="256" v-model="height"/>

        <hr>

        <label for="terrainScale">Terrain scale</label>
        <input name="terrainScale" type="number" min="1" max="256" v-model="terrainScale"/>

        <label for="terrainDetails">Terrain details</label>
        <input name="terrainDetails" type="number" min="1" max="6" step="1" v-model="terrainDetails"/>

        <label for="terrainSandThreshold">Sand threshold</label>
        <input name="terrainSandThreshold" type="number" min="0" max="1" step="0.001" v-model="terrainSandThreshold"/>

        <label for="terrainRockThreshold">Rock threshold</label>
        <input name="terrainRockThreshold" type="number" min="0" max="1" step="0.001" v-model="terrainRockThreshold"/>

        <label for="terrainMountainsThreshold">Moutains threshold</label>
        <input name="terrainMountainsThreshold" type="number" min="0" max="1" step="0.001" v-model="terrainMountainsThreshold"/>

        <hr>

        <label for="spiceScale">Spice scale</label>
        <input name="spiceScale" type="number" min="16" max="64" step="1" v-model="spiceScale"/>

        <label for="spiceDetails">Spice details</label>
        <input name="spiceDetails" type="number" min="1" max="6" step="1" v-model="spiceDetails"/>

        <label for="spiceThreshold">Spice threshold</label>
        <input name="spiceThreshold" type="number" min="0" max="1" step="0.001" v-model="spiceThreshold"/>

        <label for="spiceSaturationThreshold">Spice saturation threshold</label>
        <input name="spiceSaturationThreshold" type="number" min="0" max="1" step="0.001" v-model="spiceSaturationThreshold"/>

    </div>
</template>

<style lang="scss" scoped>
canvas {
    display: block;
}

#fabs {
    position: fixed;
    bottom: 32px;
    right: 24px;
    button {
        background-color: rgba(0, 0, 0, .5);

        border: 1px solid whitesmoke;
        border-radius: 100%;

        color: whitesmoke;

        font-size: 1.5rem;

        margin-left: 8px;
        float: right;
        height: 64px;
        width: 64px;

        &:hover {
            background-color: rgba(245, 245, 245, .25);
        }
        &:active {
            background-color: rgba(245, 245, 245, .5);
        }
    }
}

.settings {
    background-color: rgba(0, 0, 0, .5);
    color: whitesmoke;

    border: 1px solid whitesmoke;
    border-radius: .5rem;

    position: fixed;
    width: 512px;
    bottom: 104px;
    right: 24px;
    z-index: 10;

    padding: .5rem;
    display: grid;
    grid-template-columns: 33% auto;
    column-gap: 2px;
    row-gap: 2px;

    label {
        text-align: left;
        grid-column: 1;
    }
    input {
        &[type=number] {
            grid-column: 2 / span 1;
        }
        &[type=range] {
            grid-column: 2 / span 1;
        }
    }
    hr {
        border: none;
        border-bottom: 1px solid whitesmoke;
        clear: both;
        grid-column: 1 / span 2;
        padding: 0;
        height: 0;
        width: 100%;
    }
}
</style>

<script lang="ts">
import Modal from "@/components/Modal.vue"
import ProgressBar from "@/components/ProgressBar.vue"
import Screen, { ScreenMouseMotionEvent } from "@/components/Screen.vue"

import { createTerrainGenerator } from "@/dune2"
import { createLand, createScene } from "@/engine"
import { PaintDevice } from "@/graphics"
import { Rect, RectangularCoordinates, Vector } from "@/maths"

import { clamp, debounce } from "lodash"
import { defineComponent, onMounted, ref, unref, watch } from "vue"

export default defineComponent({
    components: {
        Modal,
        ProgressBar,
        Screen,
    },
    setup() {
        const showInspector = ref<boolean>(false)
        const screen = ref<PaintDevice | null>(null)

        const showModal = ref<boolean>(true)

        const screenWidth = ref<number>(0)
        const screenHeight = ref<number>(0)

        const width = ref<number>(200)
        const height = ref<number>(200)

        const terrainScale = ref(32)
        const terrainDetails = ref(1)
        const terrainSandThreshold = ref(0.4)
        const terrainRockThreshold = ref(0.650)
        const terrainMountainsThreshold = ref(0.85)

        const spiceScale = ref(16)
        const spiceThreshold = ref(0.6)
        const spiceSaturationThreshold = ref(0.8)
        const spiceDetails = ref(1)

        const scene = createScene()
        let seed: number = Date.now()

        const resize = debounce(() => {
            const width = window.innerWidth
            const height = window.innerHeight
            const topLeft = scene.viewport?.topLeft() ?? { x: 0, y: 0 }

            screenWidth.value = width
            screenHeight.value = height
            scene.viewport = new Rect(topLeft, {
                width: width/scene.gridSpacing,
                height: height/scene.gridSpacing,
            })
        }, 60)

        const update = async () => {
            showModal.value = true
            const size = {
                width: unref(width),
                height: unref(height),
            }

            const generateTerrain = createTerrainGenerator({
                seed,
                size,
                terrainScale: unref(terrainScale),
                terrainDetails: unref(terrainDetails),
                terrainSandThreshold: unref(terrainSandThreshold),
                terrainRockThreshold: unref(terrainRockThreshold),
                terrainMountainsThreshold: unref(terrainMountainsThreshold),
                spiceScale: unref(spiceScale),
                spiceDetails: unref(spiceDetails),
                spiceThreshold: unref(spiceThreshold),
                spiceSaturationThreshold: unref(spiceSaturationThreshold),
            })

            scene.clear()
            scene.addItem(createLand(scene, { size }, generateTerrain))

            showModal.value = false
        }

        const updateViewport = ({ x: xOffset, y: yOffset }: RectangularCoordinates) => {
            const viewport = scene.viewport as Rect
            const rect = scene.rect
            viewport.x = clamp(viewport.x + xOffset, 0, rect.rightX - viewport.width)
            viewport.y = clamp(viewport.y + yOffset, 0, rect.bottomY - viewport.height)
        }

        const onKeyPressed = (ev: KeyboardEvent) => {
            if (!ev.altKey) return
            if (ev.code === "ArrowLeft") {
                updateViewport(Vector.Left())
            } else
            if (ev.code === "ArrowRight") {
                updateViewport(Vector.Right())
            } else
            if (ev.code === "ArrowUp") {
                updateViewport(Vector.Up())
            } else
            if (ev.code === "ArrowDown") {
                updateViewport(Vector.Down())
            }
        }

        const screenToSceneCoordinates = (position: RectangularCoordinates) => {
            const gridSpacing = scene.gridSpacing
            return new Vector(
                position.x/gridSpacing, // x
                position.y/gridSpacing, // y
            )
        }

        const onMouseMoved = (ev: ScreenMouseMotionEvent) => {
            if (ev.button) {
                updateViewport(screenToSceneCoordinates(ev.movement).opposite)
            }
        }

        const onSeedClicked = () => {
            seed = Date.now()
            update()
        }

        const onZoomInClicked = () => {
            if (scene.scale < 4) {
                scene.scale += 1
            }
        }

        const onZoomOutClicked = () => {
            if (scene.scale > 1) {
                scene.scale -= 1
            }
        }

        onMounted(() => {
            const paintDevice = (unref(screen) as PaintDevice)

            scene.scale = 1
            scene.run(paintDevice.painter)

            document.addEventListener("keydown", onKeyPressed)
            window.addEventListener("resize", resize)

            resize()
            update()
        })

        watch(width, update)
        watch(height, update)
        watch(terrainScale, update)
        watch(terrainDetails, update)
        watch(terrainSandThreshold, update)
        watch(terrainRockThreshold, update)
        watch(terrainMountainsThreshold, update)
        watch(spiceScale, update)
        watch(spiceDetails, update)
        watch(spiceThreshold, update)
        watch(spiceSaturationThreshold, update)

        return {
            screen,
            screenWidth,
            screenHeight,
            width,
            height,
            terrainScale,
            terrainDetails,
            terrainSandThreshold,
            terrainRockThreshold,
            terrainMountainsThreshold,
            spiceScale,
            spiceDetails,
            spiceThreshold,
            spiceSaturationThreshold,
            showModal,
            showInspector,
            onSeedClicked,
            onMouseMoved,
            onZoomInClicked,
            onZoomOutClicked,
        }
    }
})
</script>
