<template>
    <div class="tile-palette">
        <ul>
            <li v-for="section in sections" :key="section">
                <tile-palette-section
                    :palette="palette"
                    :name="section"
                    :tiles="tiles(section)" />
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
    props: ["tilesets", "palette"],
    computed: {
        sections() {
            return this.tilesets.keys()
        }
    },
    methods: {
        tiles(name) {
            const tileset = this.tilesets.get(name)
            return tileset != null
                ? tileset.getTilesList()
                : []
        }
    }
}
</script>