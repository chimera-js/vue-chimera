# Cache
You can use `cache` property to leverage cache feature on endpoints

Endpoints using cache should have unique `key` property

Current cache implementations are:
- Memory Cache
- Storage Cache

<<< @/docs/.vuepress/components/cache-example.vue

<cache-example />

## Cache busting
You can use `.reload(true)` or `.fetch(true)` to ignore cache

```javascript
export default {
   methods: {
       forceReload() {
          this.users.reload(true)
       }
   }
}
```

Also to delete cache you can call `.deleteCache()` on endpoint. But be ware on reactive endpoints
this only removes current endpoint cache, you can use `.cache.clear()` to completely remove cache keys
from a cache store.

## Custom cache implementation
You can easily extend `MemoryCache` or `StorageCache` classes to implement your own rules.
(LRU cache, ...)
