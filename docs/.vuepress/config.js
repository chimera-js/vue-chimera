module.exports = {
  base: '/',
  serviceWorker: true,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
  ],
  title: 'Vue Chimera',
  plugins: {
    '@vuepress/pwa': {
      serviceWorker: true,
      updatePopup: {
        '/': {
          message: "New content is available.",
          buttonText: "Refresh"
        },
      },
    },
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
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference',  link: '/api/' },
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
            'chimera',
          ],
        },
        {
          title: 'Topics',
          collapsable: false,
          children: [
            'basic-usage'
          ],
        },
        'examples',
      ]
    },
    sidebarsj: {
      '/guide/': [
        '',
        'installation',
        {
          title: 'Getting Started',
          collapsable: false,
          children: [
            'apollo/',
            'apollo/queries',
            'apollo/mutations',
            'apollo/subscriptions',
            'apollo/pagination',
            'apollo/special-options',
          ],
        },
        {
          title: 'Components',
          collapsable: false,
          children: [
            'components/',
            'components/query',
            'components/mutation',
            'components/subscribe-to-more',
          ],
        },
        {
          title: 'Advanced topics',
          collapsable: false,
          children: [
            'multiple-clients',
            'ssr',
            'local-state',
            'testing',
          ],
        },
      ],
      '/api/': [
        {
          title: 'Vue Apollo',
          collapsable: false,
          children: [
            'apollo-provider',
            'dollar-apollo',
            'ssr',
          ],
        },
        {
          title: 'Smart Apollo',
          collapsable: false,
          children: [
            'smart-query',
            'smart-subscription',
          ],
        },
        {
          title: 'Apollo Components',
          collapsable: false,
          children: [
            'apollo-query',
            'apollo-mutation',
            'apollo-subscribe-to-more',
          ],
        },
      ],
    },
  },
}
