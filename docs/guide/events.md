# Events

You can also bind events to endpoints to have more control over REST communications

- **success**: emits when endpoint request successfully sent
- **error**: emits when endpoint gets error
- **cancel**: emits when endpoint canceled (error event not emitted on cancellation)
- **loading**: emits when endpoint gets to loading
- **timeout**: emits when endpoint gets timeout error

## Attach event listeners
You can add listeners on chimera property inside `$options` or directly on endpoint definition

<<< @/docs/.vuepress/components/events-example.vue

<events-example></events-example>

## Attach programmatically
Use `on` method to attach events to endpoints

```javascript
export default {

    mounted () {
       this.$chimera.users.on('success', () => {
          console.log('!')
       })
    }
}
```
