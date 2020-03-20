<template>
  <div class="example-box">
    <span
      v-if="newUser.loading"
      class="spinner"
    />
    <span v-else-if="newUser.data">
      {{ newUser.data }}
    </span>
    <br>
    <button @click="newUser.fetch()">
      Submit
    </button>
  </div>
</template>

<script>
export default {
  chimera: {
    newUser: {
      url: '/users',
      method: 'post',
      params: {
        title: 'My test post',
        description: 'Vue Chimera is awesome'
      },
      auto: false // By default auto is false on POST/PUT/PATCH/DELETE requests, but can be set explicitly
    }
  }
}
</script>
