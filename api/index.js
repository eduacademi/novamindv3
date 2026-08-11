const server = require("../dist/server.cjs");
const app = server.default || server;

module.exports = (req, res) => {
  return app(req, res);
};
