# Basic Usage

Resources are class objects that uses
[axios configuration](https://github.com/axios/axios#request-config)
to call endpoints, then results and errors are stored inside them.

For example an api endpoint with method GET, is a resource.

## Defining Resources
To use Vue Chimera in your vue instance you should add `chimera` property to root of your vue component instance:

```javascript
export default {
  
  // Chimera property contains all restful resources
  chimera: {
    
    // Here you can define your restful resources and api endpoints
    products: '/products',

    // a sample POST request
    sendProduct: {
        url: '/products',
        method: 'POST',
        params: {
          title: 'My Product',
          body: '<h1>Vue Chimera is awesome...</h1>'
        },
        autoFetch: false
    }
  },
  
  data() {
    return { ... }
  }
  
}
```

Chimera properties will be automatically converted to [Endpoint](https://github.com/chimera-js/vue-chimera/blob/master/src/Resource.js) object

Your resources can be anything with
[axios configuration](https://github.com/axios/axios#request-config)
with additional keys for resources
format:
* A simple **string** for simple GET requests
* An **Object** for complex resources like: POST, PATCH, with Parameters, with Headers, Response/Error transformer, Event listeners
* An instance of **Endpoint** (manually instantiate resource object)
* A **Function** for reactive resources [Reactive-Resources](#reactive-resources) (explained later)

## Fetch resources
Component resources can be accessed via `$chimera` property injected to vue instance,
and also for simplicity if there is no props or data conflicting resource name, 
Resources can directly accessed via it's name.

Resources are automatically loaded on component create
if method is GET, but can be overrided with 
setting `autoFetch` is set to `true` or `false`

Or they can be manually fetched via calling `.fetch()` or `.reload()`
method on the resource instance

## Using Resources

### Inside template
- `data` is the final json result of our restful resource
- `loading` is a boolean flag, identifies the resource is loading.
- `error` is a final json result of error response.
You can read other resource property and methods [here](#resource-properties-and-methods).

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

### Programmatically

```javascript
export default {
    chimera: {
        users: '/users'
    },
    methods: {
       getUsersResponse () {
          return this.$chimera.users.data
       },
       reloadUsers () {
          this.$chimera.users.reload() // or users.reload()
       }
    }

}
```
