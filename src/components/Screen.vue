<template>
    <canvas :width="width" :height="height" ref="canvas"></canvas>
</template>

<style scoped>
</style>

<script>
export default {
    data() {
        return {
            width: 800,
            height: 600,
        }
    },
    computed: {
        context() {
            return this.$refs.canvas.getContext("2d")
        },
    }
}
</script>