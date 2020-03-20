module.exports = {
  "extends": ["standard", "plugin:vue/recommended"],
  "plugins": [
      'vue'
  ],
  "rules": {
    "no-console": ["error"],
    "no-alert": ["error"],
    "no-debugger": ["error"]
  },
  overrides: [
    {
      files: [
        'tests/**/*.js',
      ],
      env: {
        jest: true
      },
    }
  ]

};
