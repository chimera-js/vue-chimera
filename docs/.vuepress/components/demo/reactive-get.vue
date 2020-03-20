<template>
  <div class="example-box">
    User ID: <input
      v-model="id"
      type="number"
    >
    <br>
    <span
      v-if="reactiveGet.loading"
      class="spinner"
    />
    <span v-else-if="reactiveGet.data">
      {{ reactiveGet.data.name }}
    </span>
    <br>
  </div>
</template>

<script>
export default {
  data () {
    return {
      id: 1
    }
  },
  chimera: {
    reactiveGet () {
      return '/users/' + this.id
    }
  }
}
</script>
