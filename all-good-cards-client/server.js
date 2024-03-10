var https = require("https");
var fs = require("fs");

var dotenv = require("dotenv");
dotenv.config();

const next = require("next");
const port = process.env.PORT | 5500;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

const sslLocation = process.env.SSL_URI || "";

const options = {
  key: fs.readFileSync(sslLocation + ".key"),
  cert: fs.readFileSync(sslLocation + ".crt"),
};

app.prepare().then(() => {
  https
    .createServer(options, (req, res) => {
      const parsedUrl = req.parsedUrl;
      handle(req, res, parsedUrl);
    })
    .listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on https://localhost:${port}`);
    });
});
