# Figma Community Publish Checklist

## Prerequisites

- [ ] Figma Professional/Organization plan (plugin publishing requires it)
- [ ] 2FA enabled on Figma account
- [ ] Plugin tested locally via Figma Desktop

## Plugin Setup

- [ ] Figma Desktop > Plugins > Development > New plugin
- [ ] Copy numeric plugin ID
- [ ] Update `manifest.json` → replace `REPLACE_WITH_FIGMA_PLUGIN_ID` with numeric ID
- [ ] Build: `pnpm figma-plugin:build`
- [ ] Test: load plugin from `figma-plugin/manifest.json` in Figma Desktop

## Testing Checklist

- [ ] Import sample-tokens.json → Variables created correctly
- [ ] Color: Light/Dark modes in single collection
- [ ] Typography, Spacing, BorderRadius collections created
- [ ] Register Styles → Text/Color/Effect styles created
- [ ] Generate Button → 54 variant ComponentSet
- [ ] Manage tab → list/delete/dedupe working
- [ ] Test with empty JSON → no crash
- [ ] Test with partial tokens → graceful skip

## Assets

- [ ] Icon: 128x128 PNG (figma-plugin/icon.png)
- [ ] Cover image: 1920x960 PNG
- [ ] Screenshots: 3-5 PNG (Import tab, Generate tab, Manage tab, result)

## Publish

1. Figma Desktop > Plugins > Development > select "System Design"
2. Click "Publish new release"
3. Fill in:
   - Name: System Design
   - Tagline: Import W3C Design Tokens into Figma
   - Description: (see COMMUNITY_DESCRIPTION.txt)
   - Categories: Design Systems, Utilities
   - Tags: design-tokens, variables, w3c, dtcg, mui
4. Upload icon + cover + screenshots
5. Submit for review (5-10 business days)

## Post-Publish

- [ ] Add Figma Community link to GitHub README
- [ ] Update memory/project notes
- [ ] Plan Phase 2: CLI tool (system-design-export)
