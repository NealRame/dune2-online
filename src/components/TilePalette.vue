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