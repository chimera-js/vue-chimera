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

    <div>
      <input type="checkbox" v-model="keepData"> Keep data
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReactiveEndpointExample',
  data () {
    return {
      userId: 1,
      keepData: true
    }
  },
  chimera: {
    user () {
      return {
        url: '/users/' + this.userId,
        keepData: this.keepData
      }
    }
  }
}
</script>
