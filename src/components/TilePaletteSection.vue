<template>
    <section>
        <header>{{name}}</header>
        <ol>
            <li class="item" v-for="(tile, index) in tiles" :key="index">
                <img :src="tile.dataURI">
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
export default {
    props: ["name", "tiles"],
    methods: {
        dataURI(tile) {
            return tile.dataUri
        }
    },
}
</script>