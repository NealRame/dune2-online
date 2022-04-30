<script lang="ts">
import { computed, defineComponent, toRefs, unref } from "vue"

export enum IconType {
    Refresh = "refresh",
    Settings = "settings",
    ZoomIn = "zoom-in",
    ZoomOut = "zoom-out",
}

export default defineComponent({
    name: "Name",
    props: ["type"],
    setup(props: { type: IconType }) {
        const { type: typeRef } = toRefs(props)
        return {
            classObject: computed(() => ({
                "fa-magnifying-glass-minus": unref(typeRef) === IconType.ZoomOut,
                "fa-magnifying-glass-plus": unref(typeRef) === IconType.ZoomIn,
                "fa-rotate": unref(typeRef) === IconType.Refresh,
                "fa-wrench": unref(typeRef) === IconType.Settings,
            })),
        }
    },
})
</script>

<template>
    <i class="fa-solid" :class="classObject"></i>
</template>
