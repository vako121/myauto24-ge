#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

const REQUIRED_FIELDS = [
  "make",
  "model",
  "year",
  "price",
  "mileage",
  "fuel",
  "transmission",
  "city",
  "engine",
  "drive",
  "color",
  "description",
  "image_urls",
  "user_id",
  "contact_phone",
];
const ALLOWED_FUEL = new Set(["ბენზინი", "დიზელი", "ჰიბრიდი", "ელექტრო"]);
const ALLOWED_TRANSMISSION = new Set(["ავტომატიკა", "მექანიკა"]);
const ALLOWED_DRIVE = new Set(["წინა", "უკანა", "4x4"]);
const ALLOWED_VIP = new Set(["super", "vip", "color"]);
const DEFAULT_BATCH_SIZE = 500;

const args = parseArgs(process.argv.slice(2));
const source = args.source;
const dryRun = args["dry-run"] === true;
const batchSize = Number(args["batch-size"] ?? DEFAULT_BATCH_SIZE);

if (!source || args.help) {
  printUsage();
  process.exit(source ? 0 : 1);
}

if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 1000) {
  fail("--batch-size must be an integer from 1 to 1000.");
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!dryRun && (!supabaseUrl || !serviceRoleKey)) {
  fail(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing. Use --dry-run to validate only.",
  );
}

const rawListings = await loadListings(source);
const { listings, errors } = normalizeListings(rawListings);

if (errors.length > 0) {
  console.error(`Found ${errors.length} validation error(s):`);
  for (const error of errors.slice(0, 50)) console.error(`- ${error}`);
  if (errors.length > 50) console.error(`...and ${errors.length - 50} more.`);
  process.exit(1);
}

console.log(`Validated ${listings.length} listing(s) from ${source}.`);

if (dryRun) {
  console.log("Dry run finished. Nothing was inserted.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let imported = 0;
for (let index = 0; index < listings.length; index += batchSize) {
  const batch = listings.slice(index, index + batchSize);
  const { error } = await supabase
    .from("listings")
    .upsert(batch, { onConflict: "source_url", ignoreDuplicates: true });
  if (error)
    fail(
      `Import failed at rows ${index + 1}-${index + batch.length}: ${error.message}`,
    );
  imported += batch.length;
  console.log(`Imported ${imported}/${listings.length} listing(s).`);
}

console.log(`Done. Imported ${imported} listing(s).`);

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

async function loadListings(sourceUrlOrPath) {
  const content = await readSource(sourceUrlOrPath);
  if (sourceUrlOrPath.toLowerCase().endsWith(".csv")) return parseCsv(content);

  const parsed = JSON.parse(content);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.listings)) return parsed.listings;
  throw new Error(
    "JSON source must be an array or an object with a listings array.",
  );
}

async function readSource(sourceUrlOrPath) {
  if (/^https?:\/\//i.test(sourceUrlOrPath)) {
    const response = await fetch(sourceUrlOrPath, {
      headers: args.token
        ? { Authorization: `Bearer ${args.token}` }
        : undefined,
    });
    if (!response.ok)
      throw new Error(
        `Could not download source: ${response.status} ${response.statusText}`,
      );
    return response.text();
  }
  return readFile(sourceUrlOrPath, "utf8");
}

function normalizeListings(rows) {
  const listings = [];
  const errors = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    const normalized = {
      make: cleanString(row.make),
      model: cleanString(row.model),
      year: toInteger(row.year),
      price: toNumber(row.price),
      mileage: toInteger(row.mileage),
      fuel: normalizeFuel(row.fuel),
      transmission: normalizeTransmission(row.transmission),
      city: cleanString(row.city),
      engine: cleanString(row.engine),
      drive: normalizeDrive(row.drive),
      color: cleanString(row.color),
      description: cleanString(row.description),
      image_url: cleanString(row.image_url ?? row.image),
      user_id: cleanString(row.user_id),
      contact_name: cleanString(row.contact_name),
      contact_phone: cleanString(row.contact_phone),
      vip: cleanString(row.vip) || null,
      source_url: cleanString(row.source_url) || null,
    };

    for (const field of REQUIRED_FIELDS) {
      if (
        normalized[field] === "" ||
        normalized[field] === null ||
        Number.isNaN(normalized[field])
      ) {
        errors.push(`Row ${rowNumber}: missing or invalid ${field}.`);
      }
    }
    validateChoice(errors, rowNumber, "fuel", normalized.fuel, ALLOWED_FUEL);
    validateChoice(
      errors,
      rowNumber,
      "transmission",
      normalized.transmission,
      ALLOWED_TRANSMISSION,
    );
    validateChoice(errors, rowNumber, "drive", normalized.drive, ALLOWED_DRIVE);
    if (normalized.vip && !ALLOWED_VIP.has(normalized.vip))
      errors.push(`Row ${rowNumber}: vip must be super, vip, color, or empty.`);
    if (
      normalized.year < 1900 ||
      normalized.year > new Date().getFullYear() + 1
    )
      errors.push(`Row ${rowNumber}: year is outside the allowed range.`);
    if (normalized.price < 0 || normalized.mileage < 0)
      errors.push(
        `Row ${rowNumber}: price and mileage must be positive numbers.`,
      );

    listings.push(normalized);
  });

  return { listings, errors };
}

function parseCsv(content) {
  const rows = content.trim().split(/\r?\n/).filter(Boolean).map(parseCsvLine);
  const headers = rows.shift()?.map((header) => header.trim()) ?? [];
  return rows.map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    ),
  );
}

function parseCsvLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  values.push(value);
  return values;
}

function normalizeFuel(value) {
  const normalized = cleanString(value).toLowerCase();
  const aliases = {
    petrol: "ბენზინი",
    gasoline: "ბენზინი",
    gas: "ბენზინი",
    diesel: "დიზელი",
    hybrid: "ჰიბრიდი",
    electric: "ელექტრო",
    ev: "ელექტრო",
  };
  return aliases[normalized] ?? cleanString(value);
}

function normalizeTransmission(value) {
  const normalized = cleanString(value).toLowerCase();
  const aliases = {
    automatic: "ავტომატიკა",
    auto: "ავტომატიკა",
    manual: "მექანიკა",
  };
  return aliases[normalized] ?? cleanString(value);
}

function normalizeDrive(value) {
  const normalized = cleanString(value).toLowerCase();
  const aliases = {
    fwd: "წინა",
    front: "წინა",
    rwd: "უკანა",
    rear: "უკანა",
    awd: "4x4",
    "4wd": "4x4",
  };
  return aliases[normalized] ?? cleanString(value);
}

function validateChoice(errors, rowNumber, field, value, allowed) {
  if (!allowed.has(value))
    errors.push(`Row ${rowNumber}: ${field} has unsupported value "${value}".`);
}

function cleanString(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function toInteger(value) {
  return Number.parseInt(cleanString(value).replace(/[^0-9-]/g, ""), 10);
}

function toNumber(value) {
  return Number(cleanString(value).replace(/[^0-9.-]/g, ""));
}

function printUsage() {
  console.log(
    `Usage: npm run import:listings -- --source ./listings.json [--dry-run] [--batch-size 500]\n\nSource can be a local JSON/CSV file or an authorized HTTP(S) JSON/CSV feed.\nRequired env for real import: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.`,
  );
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
