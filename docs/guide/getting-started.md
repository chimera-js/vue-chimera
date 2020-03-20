# Getting Started

With vue chimera we can easily bind rest apis to our vue components.

After installation, every component can use these features through `chimera` special option.

### Basic example
We are going to show list of posts on this api:
[https://jsonplaceholder.typicode.com/posts](https://jsonplaceholder.typicode.com/posts)

```html
<template>
    <div>
        <!-- We can access our through posts as we named it -->
        <!-- `posts.loading` is a loading flag that indicates endpoint is loading -->
        <span v-if="posts.loading">Loading...</span>

        <!-- Final json response can be accessed through `posts.data` -->
        <ul v-if="posts.data">
            <li v-for="post in posts.data">{{ post.title }}</li>
        </ul>

        <!-- If an error occess during API call, json response stored in `posts.error`  -->
        <span v-if="posts.error">{{ posts.error.message }}</span>
    </div>
</template>

<script>
// sample-component.vue
export default {
    chimera: {
        // For simple GET requests we can easily just put the url in here
        posts: 'https://jsonplaceholder.typicode.com/posts'
    }
}
</script>
```

Simple as that. No promise handling, loading and error indicators so far.


### Next sections
You might now ask, what if there are more complicated API calls, 
like variable parameters or url, POST calls, paginations, response headers and...

Vue chimera comes with solution to most rest api concerns.
 
We introduce more awesome features in next sections.

Thanks for reading.

