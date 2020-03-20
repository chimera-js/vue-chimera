<template>
  <div class="example-box">
    <span
      v-if="simpleGet.loading"
      class="spinner"
    />
    <span v-else-if="simpleGet.data">
      {{ simpleGet.data.name }}
    </span>
    <br>
    <button @click="simpleGet.reload()">
      Reload
    </button>
  </div>
</template>

<script>
export default {
  chimera: {
    simpleGet: '/users/1'
  }
}
</script>
