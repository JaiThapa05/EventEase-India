const db = require("./config/db");
const fs = require("fs");
const path = require("path");

const EVENTS_DIR = path.join(
  __dirname,
  "uploads",
  "events"
);

if (!fs.existsSync(EVENTS_DIR)) {
  fs.mkdirSync(EVENTS_DIR, {
    recursive: true,
  });
}


// ========================================
// HTML ENTITY DECODER
// ========================================

function decodeHtmlEntities(text = "") {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}


// ========================================
// MAKE ABSOLUTE URL
// ========================================

function absoluteUrl(value, sourceUrl) {
  if (!value) {
    return null;
  }

  try {
    return new URL(
      decodeHtmlEntities(value.trim()),
      sourceUrl
    ).href;
  } catch {
    return null;
  }
}


// ========================================
// GENERIC IMAGE CHECK
// ========================================

function isBadImage(url = "") {
  const value = url.toLowerCase();

  const badWords = [
    "logo",
    "favicon",
    "icon",
    "avatar",
    "sprite",
    "tracking",
    "pixel",
    "placeholder",
    "og-image",
    "og_image",
    "incredible-india-og",
    "header-logo",
  ];

  return badWords.some((word) =>
    value.includes(word)
  );
}


// ========================================
// EVENT KEYWORDS
// ========================================

function getKeywords(title = "") {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        word.length >= 4 &&
        ![
          "2026",
          "2027",
          "india",
          "event",
          "festival",
          "conference",
          "expo",
        ].includes(word)
    );
}


// ========================================
// EXTRACT IMAGE CANDIDATES
// ========================================

function extractImageCandidates(
  html,
  sourceUrl,
  title
) {
  const candidates = [];
  const keywords = getKeywords(title);


  const addCandidate = (
    rawUrl,
    source,
    metaText = ""
  ) => {
    const url = absoluteUrl(
      rawUrl,
      sourceUrl
    );

    if (!url) {
      return;
    }

    if (isBadImage(url)) {
      return;
    }

    const lower = (
      `${url} ${metaText}`
    ).toLowerCase();

    let score = 0;

    // Event-title relevance
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        score += 5;
      }
    }

    // Better image formats
    if (
      lower.includes(".webp") ||
      lower.includes(".jpg") ||
      lower.includes(".jpeg") ||
      lower.includes(".png")
    ) {
      score += 2;
    }

    // Prefer content/gallery names
    if (
      lower.includes("banner") ||
      lower.includes("hero") ||
      lower.includes("gallery") ||
      lower.includes("cover") ||
      lower.includes("event")
    ) {
      score += 3;
    }

    candidates.push({
      url,
      source,
      score,
    });
  };


  // ========================================
  // OG IMAGE
  // ========================================

  let matches = html.matchAll(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi
  );

  for (const match of matches) {
    addCandidate(
      match[1],
      "og:image"
    );
  }


  // Reverse attribute order
  matches = html.matchAll(
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/gi
  );

  for (const match of matches) {
    addCandidate(
      match[1],
      "og:image"
    );
  }


  // ========================================
  // TWITTER IMAGE
  // ========================================

  matches = html.matchAll(
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi
  );

  for (const match of matches) {
    addCandidate(
      match[1],
      "twitter:image"
    );
  }


  matches = html.matchAll(
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/gi
  );

  for (const match of matches) {
    addCandidate(
      match[1],
      "twitter:image"
    );
  }


  // ========================================
  // LINK IMAGE SOURCE
  // ========================================

  matches = html.matchAll(
    /<link[^>]+rel=["'][^"']*image_src[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/gi
  );

  for (const match of matches) {
    addCandidate(
      match[1],
      "image_src"
    );
  }


  // ========================================
  // JSON-LD IMAGE
  // ========================================

  const jsonLdBlocks = [
    ...html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ),
  ];

  for (const block of jsonLdBlocks) {

    try {

      const parsed =
        JSON.parse(
          block[1].trim()
        );

      const stack = [parsed];

      while (stack.length > 0) {

        const item = stack.pop();

        if (!item) {
          continue;
        }

        if (
          typeof item === "object"
        ) {

          if (Array.isArray(item)) {
            stack.push(...item);
          } else {

            if (item.image) {

              if (
                typeof item.image ===
                "string"
              ) {
                addCandidate(
                  item.image,
                  "json-ld"
                );
              }

              if (
                Array.isArray(item.image)
              ) {
                item.image.forEach(
                  (img) =>
                    addCandidate(
                      img,
                      "json-ld"
                    )
                );
              }

              if (
                typeof item.image ===
                  "object" &&
                item.image.url
              ) {
                addCandidate(
                  item.image.url,
                  "json-ld"
                );
              }
            }

            Object.values(item).forEach(
              (value) => {
                if (
                  value &&
                  typeof value ===
                    "object"
                ) {
                  stack.push(value);
                }
              }
            );
          }
        }
      }

    } catch {
      // Ignore invalid JSON-LD
    }
  }


  // ========================================
  // NORMAL IMG TAGS
  // ========================================

  matches = html.matchAll(
    /<img\b[^>]*>/gi
  );

  for (const match of matches) {

    const tag = match[0];

    const srcMatch =
      tag.match(
        /\bsrc=["']([^"']+)["']/i
      );

    const altMatch =
      tag.match(
        /\balt=["']([^"']*)["']/i
      );

    const titleMatch =
      tag.match(
        /\btitle=["']([^"']*)["']/i
      );

    if (srcMatch) {

      addCandidate(
        srcMatch[1],
        "img",
        `${altMatch?.[1] || ""} ${
          titleMatch?.[1] || ""
        }`
      );
    }
  }


  // ========================================
  // REMOVE DUPLICATES + SORT
  // ========================================

  const unique = new Map();

  for (const candidate of candidates) {

    if (
      !unique.has(candidate.url) ||
      unique.get(candidate.url).score <
        candidate.score
    ) {
      unique.set(
        candidate.url,
        candidate
      );
    }
  }

  return [...unique.values()]
    .sort(
      (a, b) =>
        b.score - a.score
    );
}


// ========================================
// DOWNLOAD IMAGE
// ========================================

async function downloadImage(
  imageUrl,
  sourceUrl,
  filePath
) {

  const response = await fetch(
    imageUrl,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36",

        "Accept":
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",

        "Referer":
          sourceUrl,
      },
    }
  );


  if (!response.ok) {
    throw new Error(
      `Image download failed: ${response.status}`
    );
  }


  const contentType =
    response.headers.get(
      "content-type"
    ) || "";


  if (
    !contentType.startsWith("image/")
  ) {
    throw new Error(
      `Not an image: ${contentType}`
    );
  }


  const buffer =
    Buffer.from(
      await response.arrayBuffer()
    );


  // Very tiny files are usually icons/logos
  if (buffer.length < 10000) {
    throw new Error(
      "Image is too small"
    );
  }


  fs.writeFileSync(
    filePath,
    buffer
  );
}


// ========================================
// SAFE FILE NAME
// ========================================

function createSafeFileName(
  id,
  title
) {
  const safeTitle =
    title
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .substring(
        0,
        60
      );

  return `${id}-${
    safeTitle || "event"
  }.jpg`;
}


// ========================================
// MAIN
// ========================================

async function updateEventBanners() {

  try {

    console.log(
      "\n🚀 Smart event image import started...\n"
    );


    const [events] =
      await db.query(
        `SELECT
          id,
          title,
          source_url,
          banner
         FROM events
         WHERE source_url IS NOT NULL
           AND source_url <> ''
           AND (
             banner IS NULL
             OR banner = ''
           )
         ORDER BY event_date ASC`
      );


    console.log(
      `Found ${events.length} events without banners.\n`
    );


    let success = 0;
    let failed = 0;


    for (const event of events) {

      console.log(
        `\n🔎 ${event.id} - ${event.title}`
      );

      console.log(
        `Source: ${event.source_url}`
      );


      try {

        const pageResponse =
          await fetch(
            event.source_url,
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36",

                Accept:
                  "text/html,application/xhtml+xml",
              },
            }
          );


        if (!pageResponse.ok) {
          throw new Error(
            `Page returned ${pageResponse.status}`
          );
        }


        const html =
          await pageResponse.text();


        const candidates =
          extractImageCandidates(
            html,
            event.source_url,
            event.title
          );


        if (
          candidates.length === 0
        ) {
          throw new Error(
            "No usable image candidates found"
          );
        }


        console.log(
          `🖼 Found ${candidates.length} image candidates`
        );


        let saved = false;


        for (
          const candidate of candidates
        ) {

          console.log(
            `   Trying [${candidate.source}] score=${candidate.score}`
          );

          console.log(
            `   ${candidate.url}`
          );


          const fileName =
            createSafeFileName(
              event.id,
              event.title
            );


          const filePath =
            path.join(
              EVENTS_DIR,
              fileName
            );


          try {

            await downloadImage(
              candidate.url,
              event.source_url,
              filePath
            );


            const bannerPath =
              `/uploads/events/${fileName}`;


            await db.query(
              `UPDATE events
               SET banner = ?
               WHERE id = ?`,
              [
                bannerPath,
                event.id,
              ]
            );


            console.log(
              `✅ Saved: ${bannerPath}`
            );


            success++;
            saved = true;

            break;

          } catch (imageError) {

            console.log(
              `   ❌ ${imageError.message}`
            );

          }
        }


        if (!saved) {

          throw new Error(
            "All image candidates failed"
          );
        }


        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              500
            )
        );

      } catch (error) {

        console.log(
          `❌ FAILED EVENT: ${event.id} - ${event.title}`
        );

        console.log(
          `❌ REASON: ${error.message}`
        );

        failed++;
      }
    }


    console.log(
      "\n========================================"
    );

    console.log(
      `✅ Successful: ${success}`
    );

    console.log(
      `❌ Failed: ${failed}`
    );

    console.log(
      "========================================\n"
    );


  } catch (error) {

    console.error(
      "\n🔥 IMPORT ERROR:",
      error
    );

  } finally {

    await db.end();
  }
}


updateEventBanners();