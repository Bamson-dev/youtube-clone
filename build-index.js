/**
 * Rebuilds index.html as a single self-contained file (inline CSS + data + app).
 * Run: node build-index.js
 * Required for reliable opening via file:// — external <script src> is often blocked.
 */
const fs = require("fs");
const path = require("path");

const root = __dirname;
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const data = fs.readFileSync(path.join(root, "data.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Youtube-clone — clean UI replica</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
${css.replace(/<\/style>/gi, "<\\/style>")}
    </style>
  </head>
  <body>
    <div id="app"></div>
    <noscript>
      <div style="position:fixed;inset:0;display:grid;place-items:center;background:#0f0f0f;color:#f5f5f5;font-family:system-ui,sans-serif;">
        JavaScript is disabled. Enable JavaScript to use Youtube-clone.
      </div>
    </noscript>
    <script>
${data}
${app}
    </script>
  </body>
</html>
`;

fs.writeFileSync(path.join(root, "index.html"), html);
console.log("Wrote index.html (" + html.length + " bytes)");
