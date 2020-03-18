module.exports = {
  "extends": "standard",
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
