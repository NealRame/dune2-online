<template>
    <router-view></router-view>
</template>

<style lang="scss" scoped>
ul {
    padding: 0;
    list-style-type: none;
}
</style>

<script lang="ts">
import "@/styles/global.scss"
import { defineComponent } from "vue"
export default defineComponent({
    setup() {
        return {}
    }
})
</script>
