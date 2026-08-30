/**
 * LevelUp lobby display — photo list Worker
 *
 * Why this exists: a public R2 bucket will serve an image if you know its
 * exact name, but it won't tell you what's in a folder. This Worker does.
 * Deploy it once and the TV picks up new photos on its own — drop a JPG in
 * the TV/ folder and it shows up on the next refresh. No file edits, no
 * manifest to maintain.
 *
 * ---------------------------------------------------------------
 * SETUP
 *
 * 1. wrangler.toml:
 *
 *      name = "levelup-tv"
 *      main = "levelup-tv-worker.js"
 *      compatibility_date = "2026-01-01"
 *
 *      [[r2_buckets]]
 *      binding     = "BUCKET"
 *      bucket_name = "levelupclub"
 *
 * 2. npx wrangler deploy
 *
 * 3. In levelup-tv-slideshow.html set:
 *      MANIFEST: "https://levelup-tv.<your-subdomain>.workers.dev/photos"
 *
 * That's it — BASE_URL isn't needed when you use the Worker, because the
 * list comes back with full URLs already pointed at this Worker.
 * ---------------------------------------------------------------
 */

const FOLDER = "TV/";
const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif)$/i;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // ---- the photo list -------------------------------------------------
    if (url.pathname === "/photos") {
      const photos = [];
      let cursor;

      do {
        const page = await env.BUCKET.list({ prefix: FOLDER, cursor, limit: 1000 });
        for (const obj of page.objects) {
          if (!IMAGE_RE.test(obj.key)) continue;
          if (obj.size === 0) continue;
          photos.push({
            key: obj.key,
            url: url.origin + "/" + encodeURI(obj.key),
            size: obj.size,
            uploaded: obj.uploaded
          });
        }
        cursor = page.truncated ? page.cursor : undefined;
      } while (cursor);

      // Filename order, so "court-2.jpg" sorts before "court-10.jpg".
      photos.sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));

      return new Response(JSON.stringify({ count: photos.length, photos }, null, 2), {
        headers: {
          ...CORS,
          "Content-Type": "application/json",
          // Short cache: new uploads show up within a minute of a refresh.
          "Cache-Control": "public, max-age=60"
        }
      });
    }

    // ---- serve an image out of the bucket -------------------------------
    const key = decodeURIComponent(url.pathname.slice(1));

    if (!key) {
      return new Response("LevelUp TV. Photo list is at /photos", {
        headers: { ...CORS, "Content-Type": "text/plain" }
      });
    }

    if (!key.startsWith(FOLDER)) {
      return new Response("Not found", { status: 404, headers: CORS });
    }

    const object = await env.BUCKET.get(key);
    if (!object) {
      return new Response("Not found", { status: 404, headers: CORS });
    }

    const headers = new Headers(CORS);
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=86400");

    return new Response(object.body, { headers });
  }
};
