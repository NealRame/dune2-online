<template>
    <screen
        ref="screen"
        :width="width"
        :height="height"
    />

    <div id="noise-settings">
        <label for="range">Scale</label>
        <input type="range" name="scale" id="scale" min="1" max="250" v-model="scale"/>
        <span>{{scale}}</span>

        <label for="contrast">Contrast</label>
        <input type="range" name="contrast" id="contrast" min="-10" max="10" v-model="contrast">
        <span>{{contrast}}</span>

        <label for="amplitude">Amplitude</label>
        <input type="range" name="amplitude" id="amplitude" min="1" max="2" step=".1" v-model="amplitude">
        <span>{{amplitude}}</span>

        <label for="octaves">Octaves</label>
        <input type="range" name="octaves" id="octaves" min="1" max="6" v-model="octaves">
        <span>{{octaves}}</span>

        <button name="seed" @click="onSeedClicked">
            <font-awesome-icon icon="sync-alt" />
        </button>
    </div>

</template>

<style lang="scss" scoped>
canvas {
    border: 1px solid whitesmoke;
    display: block;
    margin: 2rem auto;
}
#noise-settings {
    width: 512px;
    padding: 0;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 25% auto 10%;
    column-gap: 2px;
    row-gap: 2px;
    label {
        text-align: left;
        grid-column: 1;
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
        border: 2px solid lightgray;
        grid-column: 1 / span 3;
        margin: .5rem 0;
    }
}
</style>

<script lang="ts">
import Screen from "@/components/Screen.vue"

import { Noise2DGenerator } from "@/maths"
import { PaintDevice } from "@/graphics"

import { computed, defineComponent, onMounted, ref, unref } from "vue"

export default defineComponent({
    components: {
        Screen,
    },
    emits: ["update:scale", "update:contrast", "update:amplitude", "update:octaves"],
    setup(props, { emit }) {
        const screen = ref<PaintDevice | null>(null)
        const width = ref(512)
        const height = ref(512)
        const scale = ref(128)
        const contrast = ref(0)
        const amplitude = ref(1)
        const octaves = ref(1)

        let seed = Date.now()

        const update = () => {
            const noise = Noise2DGenerator({
                seed,
                amplitude: unref(amplitude),
                octaves: unref(octaves),
            })
            const image1 = new ImageData(unref(width), unref(height))
            for (let x = 0; x < unref(width); ++x) {
                for (let y = 0; y < unref(height); ++y) {
                    const contrastValue = Number(unref(contrast))
                    const p = noise(x/unref(scale), y/unref(scale))

                    const pc = contrastValue !== 0
                        ? 255/(1 + Math.exp(-unref(contrast)*p))
                        : 255*((p + 1)/2)

                    image1.data[4*(unref(width)*y + x) + 0] = pc
                    image1.data[4*(unref(width)*y + x) + 1] = pc
                    image1.data[4*(unref(width)*y + x) + 2] = pc
                    image1.data[4*(unref(width)*y + x) + 3] = 255
                }
            }
            (unref(screen) as PaintDevice).painter()
                .clear("#000")
                .drawImageData(image1, { x: 0, y: 0 })
        }

        const onSeedClicked = () => {
            seed = Date.now()
            update()
        }

        onMounted(update)

        return {
            screen,
            width,
            height,
            scale: computed({
                get: () => scale.value,
                set: value => {
                    scale.value = value
                    update()
                    emit("update:scale", value)
                },
            }),
            contrast: computed({
                get: () => contrast.value,
                set: value => {
                    contrast.value = value
                    emit("update:contrast", value)
                    update()
                },
            }),
            amplitude: computed({
                get: () => amplitude.value,
                set: value => {
                    amplitude.value = value
                    emit("update:amplitude", value)
                    update()
                },
            }),
            octaves: computed({
                get: () => octaves.value,
                set: value => {
                    octaves.value = value
                    emit("update:octaves", value)
                    update()
                },
            }),
            onSeedClicked,
        }
    }
})
</script>
