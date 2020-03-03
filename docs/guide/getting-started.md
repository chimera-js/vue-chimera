# Installation

vue-chimera is available on npm

## Using npm/yarn

```bash
$ npm install --save vue-chimera
# or
$ yarn add vue-chimera
```


Then install plugin into Vue:

```javascript
import Vue from 'vue'
import VueChimera from "vue-chimera"

Vue.use(VueChimera)
``` 

## Using Nuxt.js

Simply after adding installing `vue-chimera` package, add `vue-chimera/nuxt`
to modules in `nuxt.config.js`
```javascript
// nuxt.config.js
module.exports = {
    modules: [
        'vue-chimera/nuxt'
    ]
}
```

## Using Script tag (CDN)
```html
<script src="https://unpkg.com/vue-chimera@latest/dist/vue-chimera.min.js"></script>
```
If you use old browser style and `Vue` is publicly exposed as global variable
just add `dist/vue-chimera.min.js` script tag to your HTML file and everything would be fine to go on.
