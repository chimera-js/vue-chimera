<template>
  <section class="container">
    <div>
      <app-logo/>
      <h1 class="title">
        Nuxt.js
      </h1>
      <h2 class="subtitle">
        <small v-if="$chimera.blogPost.loading">loading...</small>
        <span v-if="$chimera.blogPost.data">{{ $chimera.blogPost.data.title }}</span>
      </h2>
      <div class="links">
        <a
          href="https://nuxtjs.org/"
          target="_blank"
          class="button--green">Documentation</a>
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          class="button--grey">GitHub</a>
      </div>
    </div>
  </section>
</template>

<script>
import AppLogo from '~/components/AppLogo.vue'

export default {
  components: {
    AppLogo
  },

    chimera: {
        resources: {
            blogPost: {
                url: '/blog/posts/55',
                prefetch: true
            }
        }
    },

    computed: {
    },

    mounted() {
      window.APP = this
    }
}
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>

