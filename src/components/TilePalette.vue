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
import { ScaleFactor, Tile } from "@/core"
import { Painter } from "@/graphics"
import { Rect } from "@/maths"

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
                const { width, height } = tile.getSize(scale)

                canvas.width = width
                canvas.height = height
                tile.render(
                    new Painter(canvas),
                    scale,
                    new Rect({ x: 0, y: 0 }, {
                        width,
                        height
                    })
                )

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
