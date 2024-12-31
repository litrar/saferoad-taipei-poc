<template>
  <div id="app">
    <GoogleMap />
  </div>
</template>

<script>
import GoogleMap from "./components/GoogleMap.vue";

export default {
  name: 'App',
  components: {
    GoogleMap,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 20px;
}
</style>
