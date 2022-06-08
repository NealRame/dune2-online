<script lang="ts">
import InputRange from "@/dune/ui/InputRange.vue"

import * as Dune from "@/dune"

import { cloneDeep } from "lodash"
import { defineComponent, reactive, watch } from "vue"

export default defineComponent({
    props: ["modelValue"],
    emits: ["update:modelValue"],
    components: { InputRange },
    setup(props: { modelValue: Dune.Land.Config }, { emit }) {
        const landConfig = reactive(cloneDeep(props.modelValue))
        watch(landConfig, value => {
            emit("update:modelValue", cloneDeep(value))
        })
        return {
            landConfig
        }
    },
})
</script>

<template>
<div id="land-config-inspector">
    <h2>Size</h2>
    <input-range
        label="Width"
        v-model="landConfig.size.width"
        :range="[16, 128]"
        :step="1"
    />
    <input-range
        label="Height"
        v-model="landConfig.size.height"
        :range="[16, 128]"
        :step="1"
    />
    <h2>Terrain</h2>
    <input-range
        label="Scale"
        v-model="landConfig.terrainScale"
        :range="[16, 64]"
        :step="1"
    />
    <input-range
        label="Details"
        v-model="landConfig.terrainDetails"
        :range="[1, 6]"
        :step="1"
    />
    <input-range
        label="Sand"
        v-model="landConfig.terrainSandThreshold"
    />
    <input-range
        label="Rock"
        v-model="landConfig.terrainRockThreshold"
    />
    <input-range
        label="Mountain"
        v-model="landConfig.terrainMountainsThreshold"
    />
    <h2>Spice</h2>
    <input-range
        label="Scale"
        v-model="landConfig.spiceScale"
        :range="[16, 64]"
        :step="1"
    />
    <input-range
        label="Details"
        v-model="landConfig.spiceDetails"
        :range="[1, 6]"
        :step="1"
    />
    <input-range
        label="Threshold"
        :step="0.001"
        v-model="landConfig.spiceThreshold"
    />
    <input-range
        label="Saturation"
        :step="0.001"
        v-model="landConfig.spiceSaturationThreshold"
    />
</div>
</template>

<style lang="scss" scoped>
#land-config-inspector {
    background-color: rgba($color: black, $alpha: .5);
    border: 2px solid sandybrown;
    border-radius: 8px;

    font-size: .75rem;

    display: grid;
    grid-template-columns: auto 100fr min(6ch);

    justify-items: stretch;
    align-items: center;

    padding: 1ch;

    & > h2 {
        background-color: rgba($color: black, $alpha: .25);
        font-size: 1rem;
        grid-column: 1 / span 3;
        margin: .25rem 0;
        width: 100%;
    }
}
</style>
