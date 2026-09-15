const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, "public");
const databasePath = path.join(__dirname, "app.db");
const database = new DatabaseSync(databasePath);

database.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));

const selectRandomQuote = database.prepare(`
  SELECT id, author, text, source, tags
  FROM quotes
  ORDER BY RANDOM()
  LIMIT 1
`);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET" && requestUrl.pathname === "/api/quote") {
    try {
      const quote = selectRandomQuote.get();

      if (!quote) {
        response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ error: "No quotes are available." }));
        return;
      }

      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify(quote));
    } catch (error) {
      console.error("Unable to read a quote:", error);
      response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Unable to load a quote." }));
    }

    return;
  }

  const requestPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const filePath = path.join(publicDirectory, path.normalize(requestPath));

  if (!filePath.startsWith(publicDirectory)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      response.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    const contentType = contentTypes[path.extname(filePath)] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    response.end(content);
  });
});

server.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
