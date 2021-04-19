<template>
    <section>
        <header>{{name}}</header>
        <ol>
            <li class="item" v-for="(tile, index) in tiles" :key="index">
                <label>
                    <input type="radio" name="tile" :value="index" @change="onChange"/>
                    <img :src="dataURI(tile[3])" :title="index">
                </label>
            </li>
        </ol>
    </section>
</template>

<style lang="scss" scoped>
header {
    font-family: sans-serif;
    font-weight: bold;
}
ol {
    line-height: 0;
    display: block;
    padding: 24px;
    .item {
        display: inline-block;
        overflow: visible;
        position: relative;
        label {
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
import { defineComponent } from "@vue/runtime-core"

function dataURI(image: ImageData|ImageBitmap) {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    canvas.width = image.width
    canvas.height = image.height

    if (context != null) {
        if (image instanceof ImageData) {
            context.putImageData(image, 0, 0)
        } else {
            context.drawImage(image, 0, 0)
        }
    }
    return canvas.toDataURL()
}

export default defineComponent({
    emits: ["tileChanged"],
    props: ["name", "tiles"],
    methods: {
        onChange(ev: InputEvent): void {
            const tileIndex = Number((ev.target as HTMLInputElement).value)
            const tile = this.tiles[tileIndex]
            this.$emit("tileChanged", tile)
        },
        dataURI(tile: ImageBitmap) {
            return dataURI(tile)
        }
    }
})
</script>
