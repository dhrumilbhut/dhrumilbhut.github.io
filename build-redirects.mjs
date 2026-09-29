// Builds the user-site repository (dhrumilbhut.github.io) that keeps the old Regrade documentation
// URLs working: one redirect page per page of the built site, and a 404.html that maps any other
// /regrade/... path to /behavtest/....   node redirects.mjs <built site dir> <out dir>
import { mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const [siteDir, outDir] = process.argv.slice(2);
const NEW = "https://dhrumilbhut.github.io/behavtest/";

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name === "index.html") pages.push(relative(siteDir, dir).replace(/\\/g, "/"));
  }
})(siteDir);

const stub = (target) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>BehavTest (formerly Regrade)</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${target}">
<meta http-equiv="refresh" content="0; url=${target}">
<script>location.replace(${JSON.stringify(target)} + location.hash)</script>
</head>
<body>
<p>Regrade is now <strong>BehavTest</strong>. This page moved to <a href="${target}">${target}</a>.</p>
</body>
</html>
`;

for (const path of pages) {
  const dir = join(outDir, "regrade", path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), stub(NEW + (path ? `${path}/` : "")));
}

writeFileSync(
  join(outDir, "404.html"),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Not found</title>
<meta name="robots" content="noindex">
<script>
var p = location.pathname;
if (p === "/regrade" || p.indexOf("/regrade/") === 0) location.replace("/behavtest" + p.slice("/regrade".length) + location.search + location.hash);
</script>
</head>
<body>
<p>Page not found. Looking for Regrade? It is now <a href="${NEW}">BehavTest</a>.</p>
</body>
</html>
`,
);

writeFileSync(
  join(outDir, "index.html"),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dhrumil Bhut</title>
</head>
<body>
<p><a href="${NEW}">BehavTest</a>: behavioral regression testing for AI applications. · <a href="https://github.com/dhrumilbhut">GitHub</a></p>
</body>
</html>
`,
);

writeFileSync(
  join(outDir, "README.md"),
  `# dhrumilbhut.github.io

Keeps the old documentation URLs of Regrade (\`dhrumilbhut.github.io/regrade/...\`) working after the project
was renamed to [BehavTest](https://github.com/dhrumilbhut/behavtest): each old page redirects to the same page
under \`dhrumilbhut.github.io/behavtest/\`, and \`404.html\` redirects any other \`/regrade/...\` path.

Publish from the \`main\` branch, root folder (Settings → Pages). Do not create a repository named \`regrade\`:
it would break GitHub's redirect from the renamed repository.
`,
);
process.stdout.write(`${pages.length} redirect pages → ${outDir}\n`);
