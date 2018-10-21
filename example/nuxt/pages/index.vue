<template>
    <section class="container">
        <div>
            <app-logo/>
            <h1 class="title">
                Nuxt.js
            </h1>
            <h2 class="subtitle">
                <small v-if="blogPost.loading">loading...</small>
                <span v-if="blogPost.data">{{ blogPost.data[0].title }}</span>
            </h2>
            <small v-if="blogPost.ssrPrefetched">SSR Prefetched!</small>
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

    $options: {
      axios: {
        baseURL: 'https://jsonplaceholder.typicode.com'
      }
    },

    blogPost: {
      url: '/posts',
      ssrPrefetch: true
    },
  },

  mounted() {
    window.app = this
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

