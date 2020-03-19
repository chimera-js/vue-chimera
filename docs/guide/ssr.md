# Server-Side Rendering

::: warning
**Requires Vue 2.6+ with `serverPrefetch` support**
:::

If you have server side rendering on your Vue app you can easily prefetch all endpoints
on any component (even nested components)
on server side, So there will be no loading and flashes in contents.

How awesome is that?

## Using Nuxt.js
If you're using [Nuxt.js](https://nuxtjs.org/), You can easily add `vue-chimera/nuxt` to
nuxt.config.js modules. SSR prefetch enabled by default.
```javascript
// nuxt.config.js
module.exports = {

    modules: [
       'vue-chimera/nuxt'
    ],
    chimera: {
       prefetch: true, // Set to false to disable prefetch
       prefetchTimeout: 4000, // Maximum number in milliseconds to wait on server to prefetch
    }

}
```

::: tip
You can set `prefetch` to 'override' in order to prefetch on server and fetch it again on client
:::

## Using custom server
If you configured SSR on your own custom application server,
just before rendering app, attach `vue-chimera/ssr` to context with a custom name.

Then pass the property name on the context to VueChimera plugin
```javascript
// Example express server
app.get('/*', (req, res) => {
  const VueChimeraSSR = require('vue-chimera/ssr')
  res.setHeader('Content-Type', 'text/html')
  const context = {
    req,
    url: req.url,
    chimera: VueChimeraSSR.getStates()
  }

  renderer.renderToString(context, (err, renderedHtml) => {
    let html = renderedHtml

    if (err) {
      res.status(500)
    } else {
      res.status(200)
    }

    res.send(html)
  })
})
```

Attach context to window in render:
```html
<!-- App Template -->
<html>
<head></head>
<body>
    {{{ renderState({ contextKey: 'chimera', windowKey: '__CHIMERA__' }) }}}
</body>
</html>
```

Pass context to VuePlugin:

```javascript
import Vue from 'vue'
import VueChimera from 'vue-chimera'

Vue.use(VueChimera, {
   ssrContext: '__CHIMERA__'
})
```
