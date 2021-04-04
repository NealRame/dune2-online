<template>
    <div class="tile-palette">
        <form>
            <ul>
                <li v-for="name in sections" :key="name">
                    <tile-palette-section
                        :name="name"
                        :tiles="tilesets[name]"
                        @tile-changed="$emit('tileChanged', $event)"
                    />
                </li>
            </ul>
        </form>
    </div>
</template>>

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

<script lang="ts">
import TilePaletteSection from "../components/TilePaletteSection.vue"

import { computed, defineComponent } from "vue"

export default defineComponent({
    components: { TilePaletteSection },
    props: ["tilesets"],
    emits: ["tileChanged"],
    setup(props) {
        const sections = computed(() => {
            return props.tilesets == null
                ? []
                : Object.keys(props.tilesets)
        })
        const tiles = (section: string) => {
            return props.tilesets[section]
        }
        return {
            sections,
            tiles,
        }
    },
})

// export default defineComponent({
//     components: { TilePaletteSection },
//     emits: ["tileChanged"],
//     data() {
//         return {
//             tilesets: {}
//         }
//     },
//     computed: {
//         sections() {
//             return Object.keys(this.tilesets)
//         },
//     },
//     methods: {
//         tiles(section) {
//             return this.tilesets[section]
//         },
//         setTilesets(tilesets) {
//             for (const [name, tiles] of Object.entries(tilesets)) {
//                 this.tilesets[name] = Object.freeze(tiles.map(tile => Surface.fromImageData(tile[3])))
//             }
//         }
//     }
// })
</script>
