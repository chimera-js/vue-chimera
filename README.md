# Vue Chimera

[![npm version](https://img.shields.io/npm/v/vue-chimera.svg?style=flat-square)](https://www.npmjs.org/package/vue-chimera)
[![npm downloads](https://img.shields.io/npm/dm/vue-chimera.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vue-chimera)

VueJS RESTful client with reactive features.
Vue-Chimera is based on [axios](https://github.com/axios/axios) http client library.

## Installing

Using npm:

```bash
$ npm install vue-chimera
```

Using bower:
```bash
$ bower install vue-chimera
```

Using cdn:
```html
<script src="https://unpkg.com/vue-chimera@latest/dist/vue-chimera.js"></script>
```

## Getting started

To add **vue-chimera** to your Vue you must use it as a plugin:
*ECMAScript 6*
```javascript
import Vue from 'vue'
import VueChimera from 'vue-chimera'

Vue.use(VueChimera)

```

If you use old browser style just add `vue.min.js` and `dist/vue-chimera.js` script tag to your HTML file and everything would be fine to go on.

#### Defining Resources
To use Vue Chimera in your vue instance you should add `chimera` property to root of your vue component instance:

```javascript
let app = new Vue({
  
  // Chimera property contains all of chimera restful queries/resources and options
  chimera: {
    
    // Here you can define your restful resources and api endpoints
    resources: {
      mySampleResource: '/users'
    }
  },
  
  data() {
    return { ... }
  }
  
})
```

Vue Chimera automatically converts your `resources` to [Resource](https://github.com/SasanFarrokh/vue-chimera/blob/master/src/Resource.js) Object
Your resources can be:
* A simple **string** for simple GET requests
* An **Object** for complex resources like: POST, PATCH, with Parameters, with Headers, Response/Error transformer, Event listeners
* A instance of **Resource**
* It can also be a **Function** for a reactive resource. The function must return a string, plain object or a Resource instance

```javascript

var app = new Vue({
    
    chimera: {
      
      // You can use axios config to set default config for your axios http client library
      axios: {
        baseURL: 'https://my-domain.com/api/v1',
        headers: {
          'X-Sample-Access-Token': 'xxx'
        }
      },
      
      // Or you can directly pass a axios client for more control over your client
      axios: axios.create(),
      
      resources: {
      
        users: '/users',
        
        // This resource will change when 'selectedUserID' changes and view updates automatically.
        selectedUser: () => `/users/${this.selectedUserID}`,
        
        time: {
          'url': '/time',
          // With interval option set to 5000, resource will be refreshed every 5000 miliseconds
          'interval': 5000
        },
        
        // a sample POST request
        sendPost: {
          url: '/posts',
          method: 'POST',
          params: {
            title: 'Sample',
            body: '<h1>Vue Chimera is awesome...</h1>'
          },
          
          // Set prefetch to false to prevent request from sending on application load.
          prefetch: false
        }
        
      }
      
    },
    
    data() {
      return {
        selectedUserID: 1
      }
    }
    
})

```

Now it's time to use our resources in our vue template or inside vue methods.

#### Use Resources in template

`chimera` instance can be accessed in templates with `$chimera` (Dollar sign prepended)
`data` is the final json result of our restful resource
`loading` is a boolean, identifies the resource is loading.
You can read other resource property and methods [here](#resource-properties-and-methods).

```html
<template>
  <div>
    <ul v-if="$chimera.users.data && !$chimera.users.loading">
      <li v-for="user in $chimera.users.data">
        {{ user.name }}
      </li>
    </ul>
    <small v-else>Loading...</small>
  </div>
</template>
```

#### Use Resources in script

You can simply access `chimera` instance with `$chimera`

```javascript
let app = new Vue({
  
  methods: {
    
    sendUser() {
      
      // Execute function on resources, sends the request and returns a Promise
      this.$chimera.sendUser.execute().then(res => {
          
          // You can do other things after request success here.
          
      }).catch(err => {
          // Or error handlings
      })
    
    }
    
  }

})
```

#### Resource properties and methods

| Property | Type  | Default Value | Description
| -------- | :-----: | :-------------: | -----------
| data     | Object/ Array |  null | The resource response object or string returned from server when request is successfull
| loading  | Boolean | false       | Indentifies the resource is in loading state 
| error    | Object/string  | null | Error json object or string returned from server when request failed
| lastLoaded | Date         | null | The date/time from last time resource successfully loaded (null if not loaded yet)
| status    | number        | null | Resource response status

|   Method   | Return type | Description
| ---------- | ----------- | -----------
| reload(force)    | Promise   | Fetches the resource from server. `force`: True for cache busting
| execute(force)  | Promise   | Same as Reload
| on(event, handler)|           | Sets an event listener. [Events](#events)

#### Chimera instance properties
```javascript
...
  methods: {
    send() {
      
      // Global identifier to check if any request is pending
      this.$chimera.$loading
      
      // Get the axios client to modify or ...
      this.$chimera.$client
      
    }
  }
...
```

#### Transformers
Transformers is used to change the response to another format. It would be called before the request response (error or success) is mapped to the `data` attribute of Resource object.

```javascript
new Vue({
  
  chimera: {
    resources: {
      users: {
        
        url: '/users',
        
        transformers: {
          response: (response) => {
            if (response.user)
              response.user.id = 'UID: ' + response.user.id
            return response
          },
          error: (error) => {
            error.msg = error.msg || 'Something went wrong'
            return error
          }
        }
      }
    }
  }
  
})
```

#### Events
```javascript

import { EVENT_SUCCESS, EVENT_ERROR, EVENT_LOADING } from 'vue-chimera/src/Resource.js'

function aVuejsMethod() {
  this.$chimera.users.on(EVENT_ERROR, function(err) {
    alert('Oops error occured! status: ' + err.status)
  })
}

```

## Using with Nuxt.js
You can use Vue-Chimera with nuxtjs to use it's SSR features. You can easily prefetch the resources that has been marked with `prefetch: true` to prefetch the data.
Use this snippet of code in your nuxtjs plugin folder:
```javascript
import Vue from 'vue'
import VueChimera  from 'vue-chimera'
import { NuxtPlugin } from 'vue-chimera'
 
Vue.use(VueChimera, { /* Pass options */ })
 
export default NuxtPlugin({
  prefetch: true, // Enables server side prefetch on resources with `prefetch: true`
  prefetchTimeout: 5000 // Server side timeout for prefetch
})
```

## Examples
[example](https://cdn.rawgit.com/sasanfarrokh/vue-chimera/e1bd4faf/example/simple/index.html)

## Maintainer
<p>
<a href="https://github.com/SasanFarrokh" target="_blank" rel="noopener noreferrer"><img src="https://avatars1.githubusercontent.com/u/20913428?s=460&v=4" width="200"></a>
</p>

## Contribution
This project is open for any contribution. We are waiting for your pull requests.
Thanks to all our contributors.

## Roadmap
* Unit/Integration/e2e Tests
* Vue Directives
* Different Cache implementations
* Vuex Implementation
* Inject restful resources to children components
* Vuejs web components

## License
[MIT](https://github.com/SasanFarrokh/vue-chimera/blob/master/LICENSE.MD)
