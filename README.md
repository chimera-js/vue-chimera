<p align="center">
    <a href="https://github.com/chimera-js/vue-chimera">
        <img src="https://github.com/chimera-js/vue-chimera/raw/master/VueChimeraLogo.png" width="300px">
    </a>
</p>
<h1 align="center">Vue Chimera</h1>

[![vuejs](https://img.shields.io/badge/vue.js-2.x-green.svg)](https://vuejs.org)
[![circle ci](https://img.shields.io/circleci/project/github/chimera-js/vue-chimera/master.svg)](https://circleci.com/gh/chimera-js/vue-chimera)
[![npm version](https://img.shields.io/npm/v/vue-chimera.svg)](https://www.npmjs.org/package/vue-chimera)
[![npm downloads](https://img.shields.io/npm/dt/vue-chimera.svg)](http://npm-stat.com/charts.html?package=vue-chimera)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/vue-chimera.svg)](https://bundlephobia.com/result?p=vue-chimera@1.0.0)
[![codecov](https://codecov.io/gh/chimera-js/vue-chimera/branch/master/graph/badge.svg)](https://codecov.io/gh/chimera-js/vue-chimera)

VueJS RESTful client with reactive features.
Vue-Chimera is based on [axios](https://github.com/axios/axios) http client library.

Overview of features: 
- Loading flags
- Binding vue instances to API endpoints
- Reactive endpoints and auto request based on vue instance data
- Auto refreshing data
- Serverside prefetching (Nuxt.js compatible)
- Request cancellation
- Cancel all pending requests on vue instance destroy (like route changes)
- Events
- Lightweight

## Documents

[Full Documentation](https://vue-chimera.netlify.com)

## Installing

Using npm:

```bash
$ npm install vue-chimera
or
$ yarn add vue-chimera
```

Using cdn:
```html
<script src="https://unpkg.com/vue-chimera@^3.0.0/dist/vue-chimera.min.js"></script>
```

## Getting started

To add **vue-chimera** to your Vue you must use it as a plugin:
*ECMAScript 6*
```javascript
import Vue from 'vue'
import VueChimera from 'vue-chimera'

Vue.use(VueChimera)

```

## Using with Nuxt.js
You can use Vue-Chimera with nuxtjs to use it's SSR features so you can easily prefetch the data.
```javascript
// nuxt.config.js

module.exports = {
  
  modules: [
    'vue-chimera/nuxt'
  ],
  
  chimera: {
    // Enables server side prefetch on endpoints which has `auto` property
    // true: fetched on server
    // false: fetched on client
    // 'override': fetched on server and client (overrided by client)
    prefetch: true,
    
    prefetchTimeout: 2000 // Server side timeout for prefetch
  }
  
}
```

## Maintainer
<p>
<a href="https://github.com/SasanFarrokh" target="_blank" rel="noopener noreferrer"><img src="https://avatars1.githubusercontent.com/u/20913428?s=460&v=4" width="200"></a>
</p>

## Contribution
All PRs are welcome.
Thanks.

## License
[MIT](https://github.com/chimera-js/vue-chimera/blob/master/LICENSE.MD)
