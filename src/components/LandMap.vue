<template>
    <screen
        ref="screen"
        :width="screenWidth"
        :height="screenHeight"
    />
    <div id="settings">
        <label for="width">Width</label>
        <input name="width" type="number" min="16" max="128" v-model="width"/>

        <label for="height">Height</label>
        <input name="height" type="number" min="16" max="64" v-model="height"/>

        <label for="scale">Tile scale</label>
        <input name="scale" type="number" min="1" max="4" v-model="scale"/>

        <label for="noiseScale">Noise scale</label>
        <input name="noiseScale" type="number" min="1" max="256" v-model="noiseScale"/>

        <label for="noiseAmplitude">Noise amplitude</label>
        <input type="number" name="noiseAmplitude" id="noiseAmplitude" min="1" max="2" step=".1" v-model="noiseAmplitude">

        <label for="noiseOctaves">Noise octaves</label>
        <input type="number" name="noiseOctaves" id="noiseOctaves" min="1" max="6" v-model="noiseOctaves">

        <button name="seed" @click="onSeedClicked">
            <font-awesome-icon icon="sync-alt" />
        </button>
    </div>
</template>

<style lang="scss" scoped>
canvas {
    border: 1px solid whitesmoke;
    display: block;
    margin: 16px auto;
}
#settings {
    width: 25%;
    padding: 0;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 33% auto 10%;
    column-gap: 2px;
    row-gap: 2px;
    label {
        text-align: left;
        grid-column: 1;
    }
    * {
        grid-column: 2 / span 2;
    }
    span {
        border: 1px solid lightgray;
    }
    button {
        &:enabled {
            background-color: whitesmoke;
        }
        &:hover {
            background-color: lightgray;
        }
        &:active {
            background-color: gray;
        }
        border: 1px solid lightgray;
        grid-column: 1 / span 3;
        margin: 1px 0;
    }
}
</style>

<script lang="ts">
import Screen from "@/components/Screen.vue"

import { GameData, LandItem, LandMap, Terrain } from "@/core"
import { PaintDevice, ScaleFactor, Scene } from "@/graphics"
import { Noise2DGenerator } from "@/maths"
import { flow, spread } from "lodash"

import { computed, defineComponent, onMounted, ref, unref } from "vue"

export default defineComponent({
    components: {
        Screen,
    },
    emits: [
        "update:width",
        "update:height",
        "update:noiseScale",
        "update:amplitude",
        "update:octaves"
    ],
    setup(props, { emit }) {
        const screen = ref<PaintDevice | null>(null)
        const width = ref<number>(64)
        const height = ref<number>(48)
        const scale = ref<ScaleFactor>(1)
        const noiseScale = ref(16)
        const amplitude = ref(1)
        const octaves = ref(1)

        const tileset = GameData.tileset("Terrain")
        const scene = new Scene()
        let seed: number = Date.now()

        const update = () => {
            const landMap = LandMap(
                {
                    width: unref(width),
                    height: unref(height),
                },
                flow(
                    (x: number, y: number) => [
                        x/unref(noiseScale),
                        y/unref(noiseScale),
                    ],
                    spread(Noise2DGenerator({
                        seed,
                        amplitude: unref(amplitude),
                        octaves: unref(octaves),
                    }))
                )
            )
            scene.clear()
            for (let i = 0; i < unref(width); ++i) {
                for (let j = 0; j < unref(height); ++j) {
                    const terrain = landMap[j][i]
                    const k = unref(scale)*16
                    switch (terrain) {
                    case Terrain.Sand:
                        scene.addItem(LandItem(tileset[127], { x: i*k, y: j*k }))
                        break
                    case Terrain.Dunes:
                        scene.addItem(LandItem(tileset[159], { x: i*k, y: j*k }))
                        break
                    case Terrain.SpiceField:
                        scene.addItem(LandItem(tileset[191], { x: i*k, y: j*k }))
                        break
                    case Terrain.Rock:
                        scene.addItem(LandItem(tileset[143], { x: i*k, y: j*k }))
                        break
                    case Terrain.Mountain:
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

        onMounted(() => {
            update()
            scene
                .setPainter((unref(screen) as PaintDevice).painter())
                .setScale(2)
                .run()
        })

        return {
            scale,
            screen,
            screenWidth: computed(() => 16*unref(scale)*unref(width)),
            screenHeight: computed(() => 16*unref(scale)*unref(height)),
            width: computed({
                get: () => width.value,
                set: value => {
                    width.value = value
                    update()
                    emit("update:width", value)
                }
            }),
            height,
            noiseScale: computed({
                get: () => noiseScale.value,
                set: value => {
                    noiseScale.value = value
                    update()
                    emit("update:noiseScale", value)
                },
            }),
            noiseAmplitude: computed({
                get: () => amplitude.value,
                set: value => {
                    amplitude.value = value
                    emit("update:amplitude", value)
                    update()
                },
            }),
            noiseOctaves: computed({
                get: () => octaves.value,
                set: value => {
                    octaves.value = value
                    emit("update:octaves", value)
                    update()
                },
            }),
            onSeedClicked
        }
    }
})
</script>
