module.exports = {
  name: 'fgc-labeler', // Name of your application
  script: 'main.ts', // Entry point of your application
  interpreter: 'bun', // Bun interpreter
  env: {
    PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add "~/.bun/bin/bun" to PATH
  },
};
