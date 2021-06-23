<template>
    <form>
        <ol>
            <li v-for="(item, index) in items" :key="index">
                <label>
                    <input type="radio" name="palette-item" :value="index" @change="onChange"/>
                    <img :src="dataURI(item)" :title="index">
                </label>
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

            input[type=radio] {
                opacity: 0;
                position: absolute;
                height: 0;
                width: 0;
                & + img {
                    border: 1px solid gray;
                    display: inline-block;
                    margin: 1px;
                    &:hover {
                        border-color:red;
                    }
                }
                &:checked + img {
                    border-color: rgb(221, 136, 38);
                }
            }
        }
    }
}
</style>

<script lang="ts">
import { ScaleFactor, Tile } from "@/engine"
import { Painter } from "@/graphics"

import { computed, defineComponent } from "vue"

export default defineComponent({
    props: ["items", "modelValue"],
    emits: ["update:modelValue"],
    setup(props, { emit }) {
        const currentItem = computed({
            get: () => props.modelValue,
            set: value => emit("update:modelValue", value)
        })
        return {
            currentItem,
            dataURI(tile: Tile) {
                const scale: ScaleFactor = 2
                const canvas = document.createElement("canvas")
                const gridSpacing = 16*scale
                const rect = tile.rect

                canvas.width = gridSpacing*rect.width
                canvas.height = gridSpacing*rect.height
                tile.render(new Painter(canvas), rect)

                return canvas.toDataURL()
            },
            onChange(ev: InputEvent): void {
                const index = Number((ev.target as HTMLInputElement).value)
                currentItem.value = index
            },
        }
    },
})
</script>
