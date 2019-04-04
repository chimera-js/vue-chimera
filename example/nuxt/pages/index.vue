<template>
    <section class="container">
        <ul>
            <li v-if="blogPost.data">
                <strong>NonePrefetch:</strong> {{ blogPost.data[0].title }} ({{ prefetched(blogPost) }})
            </li>
            <li v-if="blogPostPrefetch.data">
                <strong>Prefetch:</strong> {{ blogPostPrefetch.data[2].title }} ({{ prefetched(blogPostPrefetch) }})
            </li>
            <li>
                <nuxt-link to="page">NextPage</nuxt-link>
                <a href="#" @click="i++">increment</a>
            </li>
        </ul>
    </section>
</template>

<script>
import AppLogo from '~/components/AppLogo.vue'

export default {
  components: {
    AppLogo
  },
  data() {
      return {
          i: 0
      }
  },
  chimera: {

    $options: {
    },

    blogPostPrefetch: {
      url: '/posts',
      ssrPrefetch: true
    },
    blogPost: {
      url: '/posts?i=1',
      ssrPrefetch: false,
      // interval: 3000
    },

    blogPostReactive() {
        return {
            url: '/posts?i=' + this.i,
            interval: 3000
        }
    }
  },

  mounted() {
    window.app = this
  },

  methods: {
    prefetched(resource) {
      return resource.ssrPrefetched ? 'SSR Prefetch' : '!'
    }
  }
}
</script>

<style>
    .container {
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    ul {
        line-height: 3em;
    }
</style>

