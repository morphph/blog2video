#!/usr/bin/env node
/**
 * SVG to PNG converter for blog2video
 * Renders SVGs centered on a 1080×1920 dark background using Puppeteer.
 *
 * Usage: node scripts/svg-to-png.mjs <svg-path> <output-png> [--width=960]
 */

import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const svgPath = path.resolve(process.argv[2]);
const outputPath = path.resolve(process.argv[3]);
const maxWidth = parseInt(process.argv.find(a => a.startsWith("--width="))?.split("=")[1] || "960");

if (!svgPath || !outputPath) {
  console.error("Usage: node scripts/svg-to-png.mjs <svg.svg> <output.png> [--width=960]");
  process.exit(1);
}

const svgContent = fs.readFileSync(svgPath, "utf-8");

const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; width:1080px; height:1920px; background:#0D0D1A; display:flex; align-items:center; justify-content:center;">
  <div style="width:${maxWidth}px; display:flex; align-items:center; justify-content:center;">
    ${svgContent}
  </div>
</body>
</html>`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle0" });

// Force SVG to fill container width
await page.evaluate((w) => {
  const svg = document.querySelector("svg");
  if (svg) {
    svg.setAttribute("width", w);
    svg.removeAttribute("height");
  }
}, maxWidth);

await page.screenshot({ path: outputPath, type: "png" });
await browser.close();

const stats = fs.statSync(outputPath);
console.log(`Saved: ${outputPath} (${(stats.size / 1024).toFixed(0)} KB)`);
