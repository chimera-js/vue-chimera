<template>
  <div style="padding: 50px;">
    <img src="./assets/VueChimeraLogo.svg" alt="">
    <h1>
      <span v-if="simple.loading">Loading...</span>
      <span v-if="simple.data">{{ simple.data.title }}</span>
    </h1>
    <div>
      {{ $chimera.$loading ? 'LOADING' : 'N' }}
    </div>
  </div>
</template>

<script>
  export default {
    name: 'HelloWorld',

    chimera: {
      simple() {
        return {
          url: `https://idehhub.com/api/v1/blog/posts/${this.id}?lang=en`,
          params: {
            id: this.id
          },
          key: 'key-' + this.id
        }
      },
    },

    data () {
      return {
        id: 55,
      }
    },

    mounted () {
      window.app = this
    }
  }
</script>

<style>
  body {
    text-align: center;
    margin: 0;
  }
</style>
