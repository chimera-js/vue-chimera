# Endpoints

Endpoints are base class objects that uses
[axios](https://github.com/axios/axios#request-config)
to call endpoints, then results and errors are stored inside them.

## Defining Endpoints
To define an endpoint, just add `chimera` property to root of your vue component instance, 
then add your endpoint definitions to chimera object.
 
Chimera properties will be automatically converted to 
[Endpoint](https://github.com/chimera-js/vue-chimera/blob/master/src/Endpoint.js) 
object


```javascript
export default {
  
  // Chimera property contains all restful endpoints
  chimera: {
    
    // Here you can define your restful endpoints and api endpoints
    products: '/products',

    // a sample POST request
    sendProduct: {
        url: '/products',
        method: 'POST',
        params: {
          title: 'My Product',
          body: '<h1>Vue Chimera is awesome...</h1>'
        },
        auto: false
    }

    // endpoint keys cannot start with $ (dollor sign)
  },
  
  data() {
    return { ... }
  }
  
}
```

Endpoint definition can be anything coompatible with
[axios configuration](https://github.com/axios/axios#request-config)
format:
* **string**: A simple string for simple GET requests
* **Object**: For complex endpoints like: POST, PATCH, with Parameters, with Headers
* **Endpoint**: An instance of 
 [Endpoint](https://github.com/chimera-js/vue-chimera/blob/master/src/Endpoint.js) (manually instantiate Endpoint)
* **Function**: for reactive endpoints [Reactive-Endpoints](#reactive-endpoints) (explained later)

## Extra endpoint options
Additional to
[axios configuration](https://github.com/axios/axios#request-config)
endpoints can have these options

| Properties | Type   | Default value | Description |
| ---------- | -----  | ------------- | ----------- |
| [Axios config keys] |  |           | [axios configuration](https://github.com/axios/axios#request-config) 
| key        | String | null          | Unique key that identifies an endpoint, used for caching and server side fetching purpose. <br>_We recommend to always set it on every endpoint_ |      |
| auto  | Boolean/String | 'get' | A boolean flag that indicates endpoint should be fetched on instantiation or reactive changes. <br> If it's a string, fetches endpoints with same request method |
| transformer | Function/Object | null | Transform response or error results to something else |
| interval   | Number  | undefined | A number in miliseconds to auto refresh an api
| debounce   | Number  | 50 | A number in miliseconds that prevent duplicate api calls during this time, can be set to `false` to disable debouncing. |
| cache      | Cache   | null | Cache strategy object. [More info](/guide/cache)
| axios      | Axios/Object | null | Axios instance to send requests
| on      | Object | null | Sets event listeners
| prefetch   | Boolean | Equals to `auto` if not set | A boolean flag that indicates endpoint should be fetched on server. [More Info](/guide/ssr) |
| prefetchTimeout   | Number | 4000 | A number in milliseconds that indicates how much should wait for server to fetch endpoints |

## Sending request to endpoints
Component endpoints can be accessed via `$chimera` property injected to vue instance,
and also for simplicity if there is no props or data conflicting endpoint name, 
endpoints can directly accessed via it's name.

Endpoints are automatically loaded on component create
if method is GET, but can be overrided with 
setting `auto` is set to `true` or `false`

Or they can be manually fetched via calling `.fetch()` or `.reload()`
method on the endpoint instance

## Using endpoints
Endpoints have props and methods that can be used to send requests and extract the results

### Properties
| Property | Type  | Initial Value | Description
| -------- | :-----: | :-------------: | -----------
| data     | Object/Array |  null | Endpoint response JSON object returned from server when request is successful. <br> _Might be transformed through transformers_
| loading  | Boolean | false       | Indicates the endpoint is in loading state 
| error    | Object/Array/String  | null | Error json object or string returned from server when request failed
| lastLoaded | Date         | null | Date object from last time endpoint successfully loaded (null if not loaded yet)
| status    | number        | null | Endpoint response status
| headers    | Object        | {} | Endpoint response/error headers
| ---- | ---- | ---- | ----
| params    | Object         |      | Parameters passed to endpoint on definition
| url       | String         |      | Url passed to endpoint on definition
| method    | String         |      | Request method (GET/POST/...) passed to endpoint on definition
| looping  | Boolean         |      | Boolean indicates that endpoint is looping (`interval` option)

### Methods

|   Method   | Return type | Description
| ---------- | ----------- | -----------
| <nobr>fetch(force, extraOptions)</nobr>    | Promise   | Fetches the endpoint from server. <br> `force`: True for cache busting, <br> `extraOptions` Merged into current endpoint axios config for extra options & params
| reload(force)    | Promise   | Same as fetch, (debounced)
| send(extraParams)  | Promise   | Send request but with extra parameters in body or query string
| on(event, handler)|           | Sets an event listener. [Events](#events)
| cancel()         | void       | Interupts request
| startInterval()  | void       | Manually starts interval (auto refresh)
| stopInterval()         | void       | Manually stops interval

### Using Inside template
- `data` is the final json result of our restful endpoint
- `loading` is a boolean flag, identifies the endpoint is loading.
- `error` is a final json result of error response.
You can read other endpoint property and methods [here](#endpoint-properties-and-methods).

```html
<template>
  <div>
    <!-- `users` is Endpoint object (same as: `$chimera.users`) -->
    <ul v-if="users.data && !users.loading">
      <li v-for="user in users.data">
        {{ user.name }}
      </li>
    </ul>
    <small v-else>Loading...</small>
  </div>
</template>

<script>
export default {
    chimera: {
        users: '/users'
    }
}
</script>
```

### Using Programmatically

```javascript
export default {
    chimera: {
        users: '/users'
    },
    computed: {
       users () {
           const users = this.$chimera.users.data
           if (!Array.isArray(users)) return []
           return users
       }
    },
    mounted () {
        setTimeout(() => {
            this.$chimera.users.reload() // or users.reload()
        }, 15000)
    },
}
```
