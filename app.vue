<template>
  <div class="bg">
    <div id="app">
      <div class="container">
        <h1>FILE MAGICIAN</h1>
        <DropZone />
      </div>
    </div>
  </div>
</template>

<script setup>
import DropZone from './components/drop-zone.vue'
</script>

<style>
h1 {
  color: #FAF4D3;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bg {
  width: 100%;
  height: 100%;
  background-color: #0C1618;
}

html,
body {
  height: 100vh;
  width: 100vw;
  margin: 0;
}

#__nuxt {
  height: inherit;
  width: inherit;
}
</style>