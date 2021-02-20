<template>
    <section>
        <header>{{name}}</header>
        {{count}}
        <ol>
            <li v-for="index in count" :key="index">
                <img :src="tileDataURI(index)">
            </li>
        </ol>
    </section>
</template>

<style scoped>
</style>

<script>
import {tileToDataURI} from "../core/tile"
// import {setImmediate} from "../core/async"

export default {
    props: ["name", "tiles", "palette"],
    computed: {
        count() {
            return this.tiles.length
        },
    },
    methods: {
        tileDataURI(index) {
            return tileToDataURI(this.tiles[index - 1], this.palette)
        }
    }
}
</script>