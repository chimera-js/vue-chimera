<template>
  <div class="container">
    <h1 class="title" v-if="simple.data">
      {{ simple.data.name }}
    </h1>
    <div>
      {{ $chimera.$loading ? 'Loading' : '' }}
      {{ env }}
    </div>
  </div>
</template>

<script>
export default {
  chimera: {
    simple() {
      return {
        url: 'https://elastic.indraproject.ir/',
        key: 'el'
      }
    },
  },
  data () {
    return {
      id: 55,
      env: process.env.VUE_ENV
    };
  },
  mounted () {
    window.app = this
  },
}
</script>

<style>
.container {
  margin: 200px auto;
  min-height: 100vh;
  text-align: center;
  line-height: 4em;
}

</style>
