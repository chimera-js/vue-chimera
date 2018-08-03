# Vue Chimera

[![npm version](https://img.shields.io/npm/v/vue-chimera.svg?style=flat-square)](https://www.npmjs.org/package/vue-chimera)
[![npm downloads](https://img.shields.io/npm/dm/vue-chimera.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vue-chimera)

VueJS RESTful client with reactive features.

## Installing

Using npm:

```bash
$ npm install vue-chimera
```

## Docs

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

## Examples
[example](http://htmlpreview.github.io/?https://github.com/SasanFarrokh/vue-chimera/blob/master/example/index.html)

## Maintainer
<p>
<a href="https://github.com/SasanFarrokh" target="_blank" rel="noopener noreferrer"><img src="https://avatars1.githubusercontent.com/u/20913428?s=460&v=4" width="200"></a>
</p>

## Contribution
This project is open for any contribution. We are waiting for your pull requests.
Thanks to all our contributors.

## License
[MIT](https://github.com/SasanFarrokh/vue-chimera/blob/master/LICENSE.MD)
