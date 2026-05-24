#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (/\.html?$/i.test(e.name)) files.push(p);
  }
  return files;
}

function ensureAttrs(attrStr) {
  attrStr = attrStr || '';
  // ensure cellpadding
  if (!/\bcellpadding\s*=\s*"?/i.test(attrStr)) attrStr += ' cellpadding="4"';
  // ensure cellspacing
  if (!/\bcellspacing\s*=\s*"?/i.test(attrStr)) attrStr += ' cellspacing="4"';

  const styleMatch = attrStr.match(/style\s*=\s*"([^"]*)"/i);
  if (styleMatch) {
    let style = styleMatch[1];
    if (!/\bborder\s*:/i.test(style)) {
      if (style.trim() && !/;\s*$/.test(style)) style += ';';
      style += 'border:2px solid black;';
    }
    if (!/border-collapse\s*:/i.test(style)) style += 'border-collapse:collapse;';
    attrStr = attrStr.replace(styleMatch[0], `style="${style}"`);
  } else {
    attrStr += ' style="border:2px solid black;border-collapse:collapse;"';
  }

  return attrStr;
}

function processFile(filePath) {
  let text = fs.readFileSync(filePath, 'utf8');
  const updated = text.replace(/<table\b([^>]*)>/gi, (match, attrs) => {
    const newAttrs = ensureAttrs(attrs);
    return `<table${newAttrs}>`;
  });

  if (updated !== text) {
    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const start = process.argv[2] || '.';
  const absStart = path.resolve(start);
  if (!fs.existsSync(absStart)) {
    console.error('Start path does not exist:', absStart);
    process.exit(1);
  }

  const files = fs.statSync(absStart).isDirectory() ? walk(absStart) : [absStart];
  let changed = 0;
  for (const f of files) {
    try {
      if (processFile(f)) {
        console.log('Updated:', f);
        changed++;
      }
    } catch (err) {
      console.error('Error processing', f, err.message);
    }
  }

  console.log(`Done. Modified ${changed} file(s).`);
}

if (require.main === module) main();
