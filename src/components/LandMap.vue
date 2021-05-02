<template>
    <screen
        ref="screen"
        :width="screenWidth"
        :height="screenHeight"
    />

    <div id="fabs">
        <button id="open-settings" @click="toggleInspector">
            <font-awesome-icon icon="wrench" />
        </button>
        <button id="seed" @click="onSeedClicked">
            <font-awesome-icon icon="sync-alt" />
        </button>
    </div>

    <div class="settings" v-show="showInspector">
        <label for="width">Width</label>
        <input name="width" type="number" min="16" max="110" v-model="width"/>

        <label for="height">Height</label>
        <input name="height" type="number" min="16" max="128" v-model="height"/>

        <hr>

        <label for="terrainScale">Terrain scale</label>
        <input name="terrainScale" type="number" min="1" max="256" v-model="terrainScale"/>

        <label for="terrainThreshold">Terrain threshold</label>
        <input name="terrainThreshold" type="number" min="0" max="1" step="0.001" v-model="terrainThreshold"/>

        <label for="terrainDetails">Terrain details</label>
        <input name="terrainDetails" type="number" min="1" max="6" step="1" v-model="terrainDetails"/>

        <hr>

        <label for="mountainsThreshold">Moutains threshold</label>
        <input name="mountainsThreshold" type="number" min="0" max="1" step="0.001" v-model="mountainsThreshold"/>

        <label for="mountainsDetails">Moutains details</label>
        <input name="mountainsDetails" type="number" min="1" max="6" step="1" v-model="mountainsDetails"/>

        <hr>

        <label for="dunesThreshold">Dunes threshold</label>
        <input name="dunesThreshold" type="number" min="0" max="1" step="0.001" v-model="dunesThreshold"/>

        <label for="dunesDetails">Dunes details</label>
        <input name="dunesDetails" type="number" min="1" max="6" step="1" v-model="dunesDetails"/>

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
    border: 1px solid whitesmoke;
    display: block;
    margin: 16px auto;
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

import { GameData, LandItem, createLandMap, TerrainType } from "@/core"
import { PaintDevice, Scene } from "@/graphics"

import { computed, defineComponent, onMounted, ref, unref } from "vue"

export default defineComponent({
    components: {
        Screen,
    },
    emits: [
        "update:width",
        "update:height",
        "update:terrainScale",
        "update:terrainThreshold",
        "update:terrainDetails",
        "update:mountainsThreshold",
        "update:mountainsDetails",
        "update:dunesThreshold",
        "update:dunesDetails",
        "update:spiceScale",
        "update:spiceThreshold",
        "update:spiceDetails",
    ],
    setup(props, { emit }) {
        const showInspector = ref<boolean>(false)
        const screen = ref<PaintDevice | null>(null)
        const width = ref<number>(110)
        const height = ref<number>(50)
        const terrainScale = ref(32)
        const terrainThreshold = ref(0.666)
        const terrainDetails = ref(1)
        const mountainsThreshold = ref(0.1)
        const mountainsDetails = ref(1)
        const dunesThreshold = ref(0.666)
        const dunesDetails = ref(3)
        const spiceScale = ref(16)
        const spiceThreshold = ref(0.333)
        const spiceDetails = ref(1)

        const tileset = GameData.tileset("Terrain")
        const scene = new Scene()
        let seed: number = Date.now()

        const update = () => {
            const landMap = createLandMap({
                width: unref(width),
                height: unref(height),
            }, {
                seed,
                terrainScale: unref(terrainScale),
                terrainThreshold: unref(terrainThreshold),
                terrainDetails: unref(terrainDetails),
                mountainsThreshold: unref(mountainsThreshold),
                mountainsDetails: unref(mountainsDetails),
                dunesThreshold: unref(dunesThreshold),
                dunesDetails: unref(dunesDetails),
                spiceScale: unref(spiceScale),
                spiceThreshold: unref(spiceThreshold),
                spiceDetails: unref(spiceDetails),
            })
            scene.clear()
            for (let i = 0; i < unref(width); ++i) {
                for (let j = 0; j < unref(height); ++j) {
                    const terrain = landMap[j][i]
                    const k = 16
                    switch (terrain.type) {
                    case TerrainType.Sand:
                        if (terrain.spice > 0) {
                            scene.addItem(LandItem(tileset[191], { x: i*k, y: j*k }))
                        } else {
                            scene.addItem(LandItem(tileset[127], { x: i*k, y: j*k }))
                        }
                        break
                    case TerrainType.Dunes:
                        if (terrain.spice > 0) {
                            scene.addItem(LandItem(tileset[207], { x: i*k, y: j*k }))
                        } else {
                            scene.addItem(LandItem(tileset[159], { x: i*k, y: j*k }))
                        }
                        break
                    case TerrainType.Rock:
                        scene.addItem(LandItem(tileset[143], { x: i*k, y: j*k }))
                        break
                    case TerrainType.Mountain:
                        scene.addItem(LandItem(tileset[160], { x: i*k, y: j*k }))
                        break
                    }
                }
            }
        }

        const onSeedClicked = () => {
            seed = Date.now()
            update()
        }

        const toggleInspector = () => {
            showInspector.value = !showInspector.value
        }

        onMounted(() => {
            update()
            scene
                .setPainter((unref(screen) as PaintDevice).painter())
                .setScale(2)
                .run()
        })

        return {
            screen,
            showInspector,
            onSeedClicked,
            toggleInspector,
            screenWidth: computed(() => 16*unref(width)),
            screenHeight: computed(() => 16*unref(height)),
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
            terrainThreshold: computed({
                get: () => terrainThreshold.value,
                set: value => {
                    terrainThreshold.value = value
                    emit("update:terrainThreshold", value)
                    update()
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
            mountainsThreshold: computed({
                get: () => mountainsThreshold.value,
                set: value => {
                    mountainsThreshold.value = value
                    emit("update:mountainsThreshold", value)
                    update()
                },
            }),
            mountainsDetails: computed({
                get: () => mountainsDetails.value,
                set: value => {
                    mountainsDetails.value = value
                    emit("update:mountainsDetails", value)
                    update()
                },
            }),
            dunesThreshold: computed({
                get: () => dunesThreshold.value,
                set: value => {
                    dunesThreshold.value = value
                    emit("update:dunesThreshold", value)
                    update()
                },
            }),
            dunesDetails: computed({
                get: () => dunesDetails.value,
                set: value => {
                    dunesDetails.value = value
                    emit("update:dunesDetails", value)
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
        }
    }
})
</script>
