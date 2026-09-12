const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    video: false,
    viewportWidth: 1400,
    viewportHeight: 900,
  },
});
