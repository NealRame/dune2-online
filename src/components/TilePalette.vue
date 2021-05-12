<template>
    <div class="tile-palette">
        <form>
            <ul>
                <li v-for="name in sections" :key="name">
                    <tile-palette-section
                        :name="name"
                        :tiles="tilesets[name]"
                        @tile-changed="currentTile = $event"
                    />
                </li>
            </ul>
        </form>
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

<script lang="ts">
import TilePaletteSection from "../components/TilePaletteSection.vue"

import { computed, defineComponent } from "vue"

export default defineComponent({
    components: { TilePaletteSection },
    props: ["tilesets", "modelValue"],
    emits: ["update:modelValue"],
    setup(props, { emit }) {
        const sections = computed(() => {
            return props.tilesets == null
                ? []
                : Object.keys(props.tilesets)
        })
        const currentTile = computed({
            get: () => props.modelValue,
            set: value => emit("update:modelValue", value)
        })
        return {
            sections,
            currentTile,
        }
    },
})
</script>
