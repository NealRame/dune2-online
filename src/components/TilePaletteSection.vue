<template>
    <section>
        <header>{{name}}</header>
        {{count}}
        <ol>
            <li class="item" v-for="index in count" :key="index">
                <img :src="tileDataURI(index)">
            </li>
        </ol>
    </section>
</template>

<style scoped>
header {
    font-family: sans-serif;
    font-weight: bold;
}
ol {
    line-height: 0;
    /* padding: 0; */
}
.item {
    /* display: inline-block; */
    overflow: visible;
}
</style>

<script>
import {tileToImageData} from "../core/tile"

export default {
    props: ["name", "tiles", "palette"],
    computed: {
        count() {
            return this.tiles.length
        },
    },
    methods: {
        tileDataURI(index) {
            const surface = tileToImageData(this.tiles[index - 1], this.palette, 4)
            return surface.dataUri
        }
    }
}
</script>