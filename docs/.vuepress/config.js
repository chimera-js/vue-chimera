module.exports = {
  base: '/',
  serviceWorker: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }]
  ],
  title: 'Vue Chimera',
  plugins: {
    '@vuepress/pwa': {
      serviceWorker: true,
      updatePopup: {
        '/': {
          message: 'New content is available.',
          buttonText: 'Refresh'
        }
      }
    }
  },
  themeConfig: {
    repo: 'chimera-js/vue-chimera',
    docsDir: 'docs',
    // editLinks: true,
    selectText: 'Languages',
    label: 'English',
    lastUpdated: 'Last Updated',
    smoothScroll: true,
    nav: [
      { text: 'Guide', link: '/guide/installation' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Demo', link: '/demo' }
    ],
    sidebarDepth: 1,
    sidebar: {
      '/guide/': [
        {
          title: 'Introduction',
          collapsable: false,
          children: [
            'installation',
            'getting-started',
            'endpoint',
            'reactive-endpoints',
            'chimera'
          ]
        },
        {
          title: 'Topics',
          collapsable: false,
          children: [
            'events',
            'cache',
            'ssr',
            'cancel',
            'mixin'
          ]
        },
        'examples'
      ]
    }
  },
  chainWebpack: (config, isServer) => {
    return config.resolve.alias.set('vue-chimera$', '../../src/index.es.js')
  }
}
