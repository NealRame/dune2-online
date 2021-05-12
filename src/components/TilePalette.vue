<template>
    <form>
        <ol>
            <li v-for="(tile, index) in tileset" :key="index">
                <label>
                    <input type="radio" name="tile" :value="index" @change="onChange"/>
                    <img :src="dataURI(tile[3])" :title="index">
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
import { computed, defineComponent } from "vue"

export default defineComponent({
    props: ["tileset", "modelValue"],
    emits: ["update:modelValue"],
    setup(props, { emit }) {
        const currentTile = computed({
            get: () => props.modelValue,
            set: value => emit("update:modelValue", value)
        })
        return {
            currentTile,
            dataURI(image: ImageData|ImageBitmap) {
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
            },
            onChange(ev: InputEvent): void {
                const tileIndex = Number((ev.target as HTMLInputElement).value)
                currentTile.value = props.tileset[tileIndex]
            },
        }
    },
})
</script>
