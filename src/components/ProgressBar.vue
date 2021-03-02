<template>
    <div>
        <label>
            {{label}}
            <progress id="" :value="current" :max="total"></progress>
        </label>
    </div>
</template>

<style scoped>
</style>

<script>
export default {
    props: ["current", "label"],
}
</script>
