<template>
    <h1>Dune2</h1>
    <p>
        <router-link to="/tiles">Tiles configurator</router-link>
    </p>
    <router-view></router-view>
</template>

<script lang="ts">
import "@/styles/global.scss"
import { defineComponent } from "vue"
export default defineComponent({
    setup() {
        return {}
    }
})
</script>
