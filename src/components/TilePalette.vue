<template>
    <div class="tile-palette">
        <ul>
            <li v-for="name in sections" :key="name">
                <tile-palette-section 
                    :name="name"
                    :tiles="tiles(name)" />
            </li>
        </ul>
    </div>
</template>

<style scoped>
.tile-palette {
    border-right: 1px solid black;
    background-color: rgb(24, 24, 24);
    color: rgb(128, 128, 128);

    position: absolute;
    left: 0;
    top: 0;
    width: 256px;
    height: 100vh;

    overflow: scroll;
}
ul {
    padding: 0;
}
</style>

<script>
import TilePaletteSection from "./TilePaletteSection.vue"
export default {
    components: {TilePaletteSection},
    props: ["tilesets"],
    computed: {
        sections() {
            return Object.keys(this.tilesets)
        },
    },
    methods: {
        tiles(section) {
            return this.tilesets[section].map(tile => tile[3])
        },
    }
}
</script>