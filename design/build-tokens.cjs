#!/usr/bin/env node
/**
 * Token pipeline for the Keola site.
 *
 *   docs/brand-guidelines.md
 *     └─ brand skill: sync-brand-to-tokens.cjs  → assets/design-tokens.json (brand colour scales)
 *          └─ this script merges tokens.extra.json (night palette, type, space, motion, components)
 *               └─ design-system skill: generate-tokens.cjs → ../keolahtml/css/tokens.css
 *
 * Run from this folder:  node build-tokens.cjs
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const here = __dirname;
const brand = JSON.parse(fs.readFileSync(path.join(here, 'assets/design-tokens.json'), 'utf8'));
const extra = JSON.parse(fs.readFileSync(path.join(here, 'tokens.extra.json'), 'utf8'));

const merged = {
  brand: 'Keola — Senja ke Fajar',
  primitive: {
    ...extra.primitive,
    color: {
      primary: brand.primitive.color.primary,
      secondary: brand.primitive.color.secondary,
      accent: brand.primitive.color.accent,
      ...extra.primitive.color,
    },
  },
  semantic: extra.semantic,
  component: extra.component,
};

const out = path.join(here, 'tokens.json');
fs.writeFileSync(out, JSON.stringify(merged, null, 2) + '\n');

const generator = path.join(os.homedir(), '.claude/skills/design-system/scripts/generate-tokens.cjs');
const css = path.resolve(here, '../keolahtml/css/tokens.css');
execFileSync(process.execPath, [generator, '--config', out, '-o', css], { stdio: 'inherit' });
