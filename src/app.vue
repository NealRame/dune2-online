<script lang="ts">
import "@/styles/global.scss"

import { defineComponent } from "vue"
import { constant } from "lodash"

export default defineComponent({
    setup: constant({})
})
</script>

<template>
    <router-view />
</template>
