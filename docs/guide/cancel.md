# Cancellation
Endpoints current pending situation can be easily canceled by calling `.cancel()` method

By default, on vue instance `beforeDestroy` hook, all pending endpoints will be canceled.

```javascript
export default {

    chimera: {
       users: '/users',
       on: {
          cancel () {
              console.log('Canceled')
          }
       }
    },

    methods: {
       cancelUser () {
          this.users.cancel()
       }
    }
}
```
