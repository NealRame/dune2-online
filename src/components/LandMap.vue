<template>
    <screen
        ref="screen"
        :width="screenWidth"
        :height="screenHeight"
    />

    <div id="fabs">
        <button id="open-settings" @click="showInspector=!showInspector">
            <font-awesome-icon icon="wrench" />
        </button>
        <button id="seed" @click="onSeedClicked">
            <font-awesome-icon icon="sync-alt" />
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

        <label for="spiceThreshold">Spice threshold</label>
        <input name="spiceThreshold" type="number" min="0" max="1" step="0.001" v-model="spiceThreshold"/>

        <label for="spiceDetails">Spice details</label>
        <input name="spiceDetails" type="number" min="1" max="6" step="1" v-model="spiceDetails"/>
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
import Screen from "@/components/Screen.vue"

import { createMap } from "@/core"
import { createScene, PaintDevice } from "@/graphics"
import { Rect } from "@/maths"

import { computed, defineComponent, onMounted, ref, unref } from "vue"

export default defineComponent({
    components: {
        Screen,
    },
    emits: [
        "update:width",
        "update:height",
        "update:terrainScale",
        "update:terrainDetails",
        "update:terrainSandThreshold",
        "update:terrainRockThreshold",
        "update:terrainMountainsThreshold",
        "update:spiceScale",
        "update:spiceThreshold",
        "update:spiceDetails",
    ],
    setup(props, { emit }) {
        const showInspector = ref<boolean>(false)
        const screen = ref<PaintDevice | null>(null)

        const screenWidth = ref<number>(1920)
        const screenHeight = ref<number>(1280)

        const width = ref<number>(200)
        const height = ref<number>(200)

        const terrainScale = ref(32)
        const terrainDetails = ref(1)
        const terrainSandThreshold = ref(0.4)
        const terrainRockThreshold = ref(0.650)
        const terrainMountainsThreshold = ref(0.85)

        const spiceScale = ref(16)
        const spiceThreshold = ref(0.333)
        const spiceDetails = ref(1)

        const scene = createScene()
        let seed: number = Date.now()

        const update = () => {
            scene
                .clear()
                .addItem(createMap({
                    width: unref(width),
                    height: unref(height),
                }, {
                    seed,
                    terrainScale: unref(terrainScale),
                    terrainDetails: unref(terrainDetails),
                    terrainSandThreshold: unref(terrainSandThreshold),
                    terrainRockThreshold: unref(terrainRockThreshold),
                    terrainMountainsThreshold: unref(terrainMountainsThreshold),
                    spiceScale: unref(spiceScale),
                    spiceThreshold: unref(spiceThreshold),
                    spiceDetails: unref(spiceDetails),
                }))
        }

        const onKeyPressed = (ev: KeyboardEvent) => {
            if (!ev.altKey) return

            const viewport = scene.viewport as Rect
            const rect = scene.rect

            if (ev.code === "ArrowLeft") {
                if (viewport.leftX > 0) {
                    viewport.x -= Math.min(scene.scale*16, viewport.leftX)
                }
            } else
            if (ev.code === "ArrowRight") {
                const deltaX = rect.rightX - viewport.rightX
                if (deltaX > 0) {
                    viewport.x += Math.min(scene.scale*16, deltaX)
                }
            } else
            if (ev.code === "ArrowUp") {
                if (viewport.topY > 0) {
                    viewport.y -= Math.min(scene.scale*16, viewport.topY)
                }
            } else
            if (ev.code === "ArrowDown") {
                const deltaY = rect.bottomY - viewport.bottomY
                if (deltaY > 0) {
                    viewport.y += Math.min(scene.scale*16, deltaY)
                }
            }
        }

        const onSeedClicked = () => {
            seed = Date.now()
            update()
        }

        onMounted(() => {
            const paintDevice = (unref(screen) as PaintDevice)

            update()
            scene.scale = 1
            scene.viewport = paintDevice.rect()
            scene.run(paintDevice.painter())
            document.addEventListener("keydown", onKeyPressed)
        })

        return {
            screen,
            screenWidth,
            screenHeight,
            width: computed({
                get: () => width.value,
                set: value => {
                    width.value = value
                    update()
                    emit("update:width", value)
                }
            }),
            height: computed({
                get: () => height.value,
                set: value => {
                    height.value = value
                    update()
                    emit("update:height", value)
                }
            }),
            terrainScale: computed({
                get: () => terrainScale.value,
                set: value => {
                    terrainScale.value = value
                    update()
                    emit("update:terrainScale", value)
                },
            }),
            terrainDetails: computed({
                get: () => terrainDetails.value,
                set: value => {
                    terrainDetails.value = value
                    emit("update:terrainDetails", value)
                    update()
                },
            }),
            terrainSandThreshold: computed({
                get: () => terrainSandThreshold.value,
                set: value => {
                    terrainSandThreshold.value = value
                    emit("update:terrainSandThreshold", value)
                    update()
                },
            }),
            terrainRockThreshold: computed({
                get: () => terrainRockThreshold.value,
                set: value => {
                    terrainRockThreshold.value = value
                    emit("update:terrainRockThreshold", value)
                    update()
                },
            }),
            terrainMountainsThreshold: computed({
                get: () => terrainMountainsThreshold.value,
                set: value => {
                    terrainMountainsThreshold.value = value
                    emit("update:terrainMountainsThreshold", value)
                    update()
                },
            }),
            spiceScale: computed({
                get: () => spiceScale.value,
                set: value => {
                    spiceScale.value = value
                    emit("update:spiceScale", value)
                    update()
                },
            }),
            spiceThreshold: computed({
                get: () => spiceThreshold.value,
                set: value => {
                    spiceThreshold.value = value
                    emit("update:spiceThreshold", value)
                    update()
                },
            }),
            spiceDetails: computed({
                get: () => spiceDetails.value,
                set: value => {
                    spiceDetails.value = value
                    emit("update:spiceDetails", value)
                    update()
                },
            }),
            showInspector,
            onSeedClicked,
        }
    }
})
</script>
