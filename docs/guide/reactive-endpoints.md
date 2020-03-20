# Reactive Endpoints

## How it works?
Like computed properties endpoints can be reactive functions, when any parameter inside the functions
changes, endpoint regenerated. 

Also if `endpoint.auto` evaluates to `true`, request will be sent automatically.

```javascript
let app = new Vue({

    data() {
      return {
        selectedUserId: 1,
        postId: 2
      }
    },

    chimera: {  
      user() {
        return `/api/v1/users/${this.selectedUserId}`
      },
      post() {
        return {
          url: '/api/v1/posts',
          params: {
            postId: this.postId
          },
          method: 'post',
          auto: true,
          // if you want use cache or ssr features define a unique key based on it's parameters
          key: 'post-' + this.postId,
        }
      },
    }

})
```

_Any Endpoint parameters, headers, url, auto, ... can change_

## Example

<<< @/docs/.vuepress/components/reactive-endpoint-example.vue

<reactive-endpoint-example></reactive-endpoint-example>

## keepData property
By default, response data will be kept between reactive changes.

Set `keepData` to `false` to remove all status, data, and error between reactive changes
