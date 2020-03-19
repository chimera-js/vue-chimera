# Mixin
You can mix chimera property using mixins.

All endpoints with same name gets override like vue data merging strategy.
`$options` property gets merged.

Event listeners, headers, params will be merged.

```javascript
const myMixin = {
   chimera: {
      $options: {
         headers: {
           'X-Custom-Header': 'xxx'
         }
      },
      user: '/user',
      post: '/posts',
   }
}
export default {

    mixins: [
       myMixin
    ],

    // You can mix chimera functions
    chimera () {
       return {
          $options: {
             // Headers are merged with mixin
             headers: {
               'X-Custom-Header-2': '...'
             }
          },
          // User endpoint completely gets override
          user: '/user?query=2'
       }
    },


}
```
