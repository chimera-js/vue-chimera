<template>
  <div class="example-box">
    {{ user.baseURL }}{{ user.url }}
    <br>
    <input
      v-model="userId"
      type="number"
    >
    <br>
    <span v-if="user.data">{{ user.data.name }}</span>
    <span v-if="user.loading">Loading...</span>

    <span v-if="user.error">Error: {{ user.status }} {{ user.error }}</span>
  </div>
</template>

<script>
import { MemoryCache } from '../../../dist/vue-chimera.es'

export default {
  name: 'ReactiveEndpointExample',
  data () {
    return {
      userId: 1,
      keepData: true
    }
  },
  chimera: {
    $options: {
      // 15 seconds expiration
      cache: new MemoryCache(15000)
    },
    user () {
      return {
        url: '/users/' + this.userId,
        // Key property is required to use cache features
        // Provide a unique key based on endpoint parameters
        key: 'user-' + this.userId
      }
    }
  }
}
</script>
