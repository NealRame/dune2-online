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
import { Surface } from "@/graphics"
import { defineComponent } from "@vue/runtime-core"

export default defineComponent({
    emits: ["tileChanged"],
    props: ["name", "tiles"],
    methods: {
        onChange(ev: InputEvent): void {
            const tileIndex = Number((ev.target as HTMLInputElement).value)
            this.$emit("tileChanged", {
                tileset: this.name,
                tile: tileIndex
            })
        },
        dataURI(tile: ImageData) {
            return new Surface(tile).dataURI()
        }
    }
})
</script>
