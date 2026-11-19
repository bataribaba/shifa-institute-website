# Shifa website tools

The website itself is the `4-website` folder. Upload that folder as it is.
Nothing in this `tools` folder goes online.

## Changing a page

- **Home:** edit `4-website/index.html` directly. Its header and footer are the master copy.
- **Any other page:** edit its file in `tools/pages/`, then rebuild:

```bash
python3 tools/make_page.py tools/pages/*.html
```

Rebuild after any change to the Home header or footer too, so every page picks it up.

## Changing the resources list

Edit the entries in `tools/data/resources-national.json` or `resources-michigan.json`
(update the `verified` date when you re-check one), then:

```bash
python3 tools/build_resources.py && python3 tools/make_page.py tools/pages/resources.html
```

## Previewing

```bash
python3 -m http.server 4610 --directory 4-website
```

Then open http://localhost:4610.
