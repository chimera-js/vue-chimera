<template>
    <section class="container">
        <ul>
            <li v-if="blogPost.data">
                <strong>NonePrefetch:</strong> {{ blogPost.data[0].title }} ({{ prefetched(blogPost) }})
            </li>
            <li v-if="blogPostPrefetch.data">
                <strong>Prefetch:</strong> {{ blogPostPrefetch.data[2].title }} ({{ prefetched(blogPostPrefetch) }})
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

  chimera: {

    $options: {
    },

    blogPostPrefetch: {
      url: '/posts',
      ssrPrefetch: true
    },
    blogPost: {
      url: '/posts?i=1',
      ssrPrefetch: false
    },
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

