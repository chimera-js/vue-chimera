module.exports = {
    base: '/',
    serviceWorker: true,
    head: [
        ['link', {rel: 'icon', href: '/favicon.png'}],
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
            {text: 'Guide', link: '/guide/'},
            {text: 'API Reference', link: '/api/'},
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
                        'reactive-endpoints'
                    ],
                },
                {
                    title: 'Topics',
                    collapsable: false,
                    children: [
                        'events',
                        'cache',
                        'ssr',
                    ],
                },
                'examples',
            ]
        },
    },
}
