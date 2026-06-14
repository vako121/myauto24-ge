#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const DEFAULT_SEARCH_URL = "https://www.auto.ge";
const DEFAULT_LIMIT = 500;
const DEFAULT_BATCH_SIZE = 1000;
const DEFAULT_USER_ID = process.env.MYAUTO_IMPORT_USER_ID;

const args = parseArgs(process.argv.slice(2));
const dryRun = args["dry-run"] === true;
const limit = toPositiveInteger(args.limit, DEFAULT_LIMIT);
const batchSize = toPositiveInteger(args["batch-size"], DEFAULT_BATCH_SIZE);
const searchUrl = args.url ?? DEFAULT_SEARCH_URL;
const headless = args.headed !== true;

if (args.help) {
  printUsage();
  process.exit(0);
}

if (!DEFAULT_USER_ID) {
  fail(
    "Set MYAUTO_IMPORT_USER_ID to the Supabase user UUID that will own imported listings.",
  );
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!dryRun && (!supabaseUrl || !serviceRoleKey)) {
  fail(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or run with --dry-run.",
  );
}

const { chromium } = await loadPlaywright();
const browser = await chromium.launch({ headless });
const page = await browser.newPage({
  locale: "ka-GE",
  userAgent:
    "Mozilla/5.0 (compatible; myauto24-importer/1.0; +https://myauto24.ge)",
});

try {
  const scraped = await scrapeAutoGe(page, searchUrl, limit);
  const importRows = scraped.map(toImportListing);
  console.log(`Scraped ${importRows.length} listing(s) from Auto.ge.`);

  if (dryRun) {
    console.log(JSON.stringify(importRows.slice(0, 3), null, 2));
    console.log("Dry run finished. Nothing was inserted.");
    process.exit(0);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const sourceUrls = importRows.map((row) => row.source_url).filter(Boolean);
  const existing = await loadExistingSourceUrls(supabase, sourceUrls);
  const newRows = importRows.filter((row) => !existing.has(row.source_url));

  console.log(
    `Skipping ${importRows.length - newRows.length} duplicate listing(s).`,
  );
  await insertBatches(supabase, newRows, batchSize);
  console.log(`Done. Imported ${newRows.length} new listing(s).`);
} finally {
  await browser.close();
}

export async function scrapeAutoGe(
  page,
  url = DEFAULT_SEARCH_URL,
  limitCount = DEFAULT_LIMIT,
) {
  const listings = [];
  const seenUrls = new Set();
  let nextUrl = url;

  while (nextUrl && listings.length < limitCount) {
    await page.goto(nextUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await dismissCookieBanner(page);
    await autoScroll(page, 10);

    const pageListings = await page.evaluate(() => {
      const absoluteUrl = (value) => {
        try {
          return new URL(value, window.location.href).href;
        } catch {
          return "";
        }
      };

      const cleanText = (value) => value?.replace(/\s+/g, " ").trim() ?? "";
      const imageUrl = (img) =>
        img?.currentSrc ||
        img?.src ||
        img?.getAttribute("data-src") ||
        img?.getAttribute("data-original") ||
        "";

      return Array.from(document.querySelectorAll("article.item"))
        .map((article) => {
          const anchor = article.querySelector("a[href]");
          const url = anchor ? absoluteUrl(anchor.getAttribute("href")) : "";
          const title =
            cleanText(
              article.querySelector("h1, h2, h3, .title, [class*=title]")
                ?.textContent,
            ) || cleanText(anchor?.textContent);
          const text = cleanText(article.textContent);
          const images = Array.from(article.querySelectorAll("img"))
            .map(imageUrl)
            .map(absoluteUrl)
            .filter((src) => src && !src.startsWith("data:"));

          return { url, title, text, images: Array.from(new Set(images)) };
        })
        .filter((listing) => listing.url);
    });

    console.log("Found listings:", pageListings.length);

    for (const summary of pageListings) {
      if (seenUrls.has(summary.url) || listings.length >= limitCount) continue;
      seenUrls.add(summary.url);
      console.log("Importing listing:", summary.url);
      const detail = await scrapeAutoGeDetailPage(page, summary.url).catch(
        (error) => {
          console.warn(`Could not scrape ${summary.url}: ${error.message}`);
          return {};
        },
      );
      listings.push({ ...summary, ...detail });
    }

    nextUrl = await findNextPageUrl(page, nextUrl, seenUrls.size);
  }

  return listings;
}

async function scrapeAutoGeDetailPage(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await dismissCookieBanner(page);
  await autoScroll(page, 4);

  return page.evaluate(() => {
    const cleanText = (value) => value?.replace(/\s+/g, " ").trim() ?? "";
    const absoluteUrl = (value) => {
      try {
        return new URL(value, window.location.href).href;
      } catch {
        return "";
      }
    };
    const imageUrl = (img) =>
      img.currentSrc ||
      img.src ||
      img.getAttribute("data-src") ||
      img.getAttribute("data-original") ||
      "";

    const title =
      cleanText(document.querySelector("h1")?.textContent) ||
      cleanText(document.querySelector("h2")?.textContent) ||
      cleanText(document.title);
    const text = cleanText(document.body.textContent);
    console.log("DETAIL TEXT:", text.slice(0, 1000));
    const images = Array.from(document.querySelectorAll("img"))
      .map(imageUrl)
      .map(absoluteUrl)
      .filter(
        (src) =>
          src &&
          !src.startsWith("data:") &&
          /auto\.ge|static|cloud|image|images|uploads|photos|files/i.test(src),
      );
    console.log("IMAGES:", images.slice(0, 10));

    return {
      title,
      text,
      description:
        cleanText(
          document.querySelector(
            ".description, [class*=description], .desc, [class*=desc]",
          )?.textContent,
        ) || text,
      images: Array.from(new Set(images)),
    };
  });
}

async function findNextPageUrl(page, currentUrl, offset) {
  const nextFromDom = await page.evaluate(() => {
    const absoluteUrl = (value) => {
      try {
        return new URL(value, window.location.href).href;
      } catch {
        return "";
      }
    };

    const links = Array.from(document.querySelectorAll("a[href]"));
    const nextLink = links.find((link) => {
      const text = link.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const rel = link.getAttribute("rel") ?? "";
      const aria = link.getAttribute("aria-label") ?? "";
      return /next|შემდეგ|›|»/i.test(`${text} ${rel} ${aria}`);
    });

    return nextLink ? absoluteUrl(nextLink.getAttribute("href")) : "";
  });

  if (nextFromDom && nextFromDom !== currentUrl)
return nextFromDom;
return null;
  return url.href;
}

function toImportListing(listing) {
  const parsed = parseSummaryText(
    `${listing.title ?? ""} ${listing.text ?? ""} ${listing.description ?? ""}`,
  );
  const title = listing.title || parsed.title || "Auto.ge listing";
  const { make, model } = splitTitle(title);

  return {
    make,
    model,
    year: parsed.year ?? new Date().getFullYear(),
    price: parsed.price ?? 0,
    mileage: parsed.mileage ?? 0,
    fuel: normalizeFuel(parsed.fuel),
    transmission: normalizeTransmission(parsed.transmission),
    city: parsed.city ?? "თბილისი",
    engine: parsed.engine ?? "N/A",
    drive: parsed.drive ?? "წინა",
    color: parsed.color ?? "N/A",
    description: listing.description || buildDescription(title, listing.url),
    image_url: listing.images?.[0] ?? "https://www.auto.ge/favicon.ico",
    user_id: DEFAULT_USER_ID,
    contact_name: process.env.MYAUTO_IMPORT_CONTACT_NAME ?? "Auto.ge Import",
    contact_phone: process.env.MYAUTO_IMPORT_CONTACT_PHONE ?? "",
    vip: null,
    source_url: listing.url,
  };
}

function parseSummaryText(text) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return {
    title: normalized.split(/(?=\b\d{4}\b|\$|₾|GEL|USD)/i)[0]?.trim(),
    price: parsePrice(normalized),
    year: parseYear(normalized),
    mileage: parseMileage(normalized),
    fuel: parseFuel(normalized),
    transmission: parseTransmission(normalized),
    engine: parseEngine(normalized),
    drive: parseDrive(normalized),
    city: parseCity(normalized),
    color: parseColor(normalized),
  };
}

function buildDescription(title, sourceUrl) {
  return `${title}\n\nწყარო: ${sourceUrl}\nიმპორტირებულია Auto.ge-დან ავტომატური სინქრონიზაციით.`;
}

function splitTitle(title) {
  const cleaned = title.replace(/[-–|].*$/, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  return {
    make: parts[0] ?? "Unknown",
    model: parts.slice(1, 4).join(" ") || "Unknown",
  };
}

function parsePrice(text) {
  const match =
    text.match(/(?:[$₾]\s*)?([\d\s,.]{2,})(?:\s*(?:USD|GEL|\$|₾))/i) ??
    text.match(/(?:ფასი|price)\D*([\d\s,.]+)/i);
  return match ? numberFromText(match[1]) : null;
}

function parseYear(text) {
  const currentYear = new Date().getFullYear() + 1;
  const years = [...text.matchAll(/\b(19\d{2}|20\d{2})\b/g)].map((match) =>
    Number(match[1]),
  );
  return years.find((year) => year >= 1900 && year <= currentYear) ?? null;
}

function parseMileage(text) {
  const match = text.match(/([\d\s,.]+)\s*(?:km|კმ|კილომეტრი|miles)/i);
  return match ? numberFromText(match[1]) : null;
}

function parseFuel(text) {
  if (/ჰიბრიდ|hybrid/i.test(text)) return "ჰიბრიდი";
  if (/ელექტრო|electric|ev/i.test(text)) return "ელექტრო";
  if (/დიზელ|diesel/i.test(text)) return "დიზელი";
  if (/ბენზინ|petrol|gasoline/i.test(text)) return "ბენზინი";
  return null;
}

function parseTransmission(text) {
  if (/მექან|manual/i.test(text)) return "მექანიკა";
  if (/ავტომატ|automatic|auto/i.test(text)) return "ავტომატიკა";
  return null;
}

function parseEngine(text) {
  return (
    text.match(/\b\d(?:[.,]\d)?\s*(?:l|ლ)\b/i)?.[0]?.replace(",", ".") ?? null
  );
}

function parseDrive(text) {
  if (/4x4|awd|4wd/i.test(text)) return "4x4";
  if (/უკანა|rear|rwd/i.test(text)) return "უკანა";
  if (/წინა|front|fwd/i.test(text)) return "წინა";
  return null;
}

function parseCity(text) {
  const cities = [
    "თბილისი",
    "ბათუმი",
    "ქუთაისი",
    "რუსთავი",
    "ფოთი",
    "გორი",
    "ზუგდიდი",
  ];
  return cities.find((city) => text.includes(city)) ?? null;
}

function parseColor(text) {
  const colors = [
    "შავი",
    "თეთრი",
    "ვერცხლისფერი",
    "ნაცრისფერი",
    "წითელი",
    "ლურჯი",
    "მწვანე",
  ];
  return colors.find((color) => text.includes(color)) ?? null;
}

function normalizeFuel(value) {
  return value && ["ბენზინი", "დიზელი", "ჰიბრიდი", "ელექტრო"].includes(value)
    ? value
    : "ბენზინი";
}

function normalizeTransmission(value) {
  return value && ["ავტომატიკა", "მექანიკა"].includes(value)
    ? value
    : "ავტომატიკა";
}

function numberFromText(text) {
  const value = Number(String(text).replace(/[^\d.]/g, ""));
  return Number.isFinite(value) ? value : null;
}

async function loadExistingSourceUrls(supabase, sourceUrls) {
  const existing = new Set();
  for (let index = 0; index < sourceUrls.length; index += 1000) {
    const chunk = sourceUrls.slice(index, index + 1000);
    const { data, error } = await supabase
      .from("listings")
      .select("source_url")
      .in("source_url", chunk);
    if (error) fail(`Could not check duplicates: ${error.message}`);
    for (const row of data ?? []) existing.add(row.source_url);
  }
  return existing;
}

async function insertBatches(supabase, rows, size) {
  let imported = 0;
  for (let index = 0; index < rows.length; index += size) {
    const batch = rows.slice(index, index + size);
    const { error } = await supabase
      .from("listings")
      .upsert(batch, { onConflict: "source_url", ignoreDuplicates: true });
    if (error)
      fail(`Import failed at batch starting ${index + 1}: ${error.message}`);
    imported += batch.length;
    console.log(`Imported ${imported}/${rows.length} new listing(s).`);
  }
}

async function dismissCookieBanner(page) {
  const labels = ["Accept", "Agree", "ვეთანხმები", "თანხმობა", "OK"];
  for (const label of labels) {
    const button = page
      .getByRole("button", { name: new RegExp(label, "i") })
      .first();
    if (await button.isVisible().catch(() => false)) {
      await button.click().catch(() => undefined);
      return;
    }
  }
}

async function autoScroll(page, steps) {
  for (let index = 0; index < steps; index += 1) {
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(500);
  }
}

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch (error) {
    fail(
      `Playwright is not installed or could not be loaded: ${error.message}. Run npm install first.`,
    );
  }
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const [key, inlineValue] = arg.slice(2).split("=");
    if (inlineValue !== undefined) {
      parsed[key] = inlineValue;
      continue;
    }
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

function toPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function printUsage() {
  console.log(
    `Usage: node scripts/auto-scraper.mjs -- --limit 500 [--dry-run] [--url https://www.auto.ge]\n\nRequired env: MYAUTO_IMPORT_USER_ID. Real imports also require SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.`,
  );
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
