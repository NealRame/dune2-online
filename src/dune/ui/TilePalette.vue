<script lang="ts">
import { defineComponent } from "vue"

import TilePaletteItem from "./TilePaletteItem.vue"

import { TileDescriptor } from "@/dune2/types"
import { ScaleFactor } from "@/engine"

export default defineComponent({
    components: { TilePaletteItem },
    props: ["tiles", "scale", "modelValue"],
    emits: ["update:modelValue"],
    setup(props: {
        tiles: Array<TileDescriptor>,
        scale: ScaleFactor | undefined,
        modelValue: number,
    }, { emit }) {
        return {
            onChange(tileIndex: number): void {
                emit("update:modelValue", tileIndex)
            },
        }
    },
})
</script>

<template>
    <form>
        <ol v-once>
            <li v-for="(tile, index) in tiles" :key="index">
                <tile-palette-item :index="index" :scale="scale" :tile="tile" @change="onChange(index)" />
            </li>
        </ol>
    </form>
</template>

<style lang="scss" scoped>
form {
    background-color: $palette-bg-color;
    color: $palette-color;

    position: absolute;
    left: 0;
    top: 0;
    width: $palette-width;
    height: 100vh;

    overflow: scroll;

    ol {
        line-height: 0;
        display: block;
        padding: 24px;

        li {
            display: inline-block;
            overflow: visible;
            position: relative;
        }
    }
}
</style>
