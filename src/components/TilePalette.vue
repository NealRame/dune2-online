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

<style lang="scss" scoped>
.tile-palette {
    background-color: $palette-bg-color;
    color: $palette-color;

    position: absolute;
    left: 0;
    top: 0;
    width: $palette-width;
    height: 100vh;

    overflow: scroll;

    ul {
        padding: 0;
    }
}
</style>

<script>
import TilePaletteSection from "@/components/TilePaletteSection.vue"

export default {
    components: {TilePaletteSection},
    data() {
        return {
            tilesets: {}
        }
    },
    computed: {
        sections() {
            return Object.keys(this.tilesets)
        },
    },
    methods: {
        tiles(section) {
            return this.tilesets[section]
        },
        setTilesets(tilesets) {
            for (const [name, tiles] of Object.entries(tilesets)) {
                this.tilesets[name] = Object.freeze(tiles.map(tile => tile[3]))
            }
        }
    }
}
</script>