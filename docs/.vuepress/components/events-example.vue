<template>
  <div class="example-box">
    <ul v-if="users.data">
      <li
        v-for="user in users.data"
        :key="user.id"
      >
        {{ user.name }}
      </li>
    </ul>
    <button @click="users.reload()">Reload</button> <span v-if="users.loading">Loading...</span>
      <div>
      <p
        v-for="(ev, i) in events"
        :key="i"
      >
        {{ ev }} {{ i+1 }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      events: []
    }
  },
  chimera: {
    $options: {
      on: {
        success () {
          this.events.push('"success" listener called on any endpoint')
        }
      }
    },
    users: {
      url: '/users',
      key: 'users',
      on: {
        success () {
          this.events.push('"success" listener called on users endpoint')
        }
      }
    }
  }
}
</script>
