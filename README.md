# The Shifa Institute website

Source for https://theshifainstitute.org. Static HTML, CSS and plain JavaScript. There is no framework and no build step for hosting: the `4-website` folder is uploaded as it is.

## Layout

| Folder | What it holds |
|---|---|
| `4-website/` | The site as served. Nine pages, `assets/` (CSS, JS, fonts, images), `_headers` (security headers), `robots.txt`, `sitemap.xml`. |
| `tools/pages/` | The main content of every page except Home, one fragment per page. |
| `tools/make_page.py` | Wraps each fragment in the header, footer and `<head>` taken from `4-website/index.html`. |
| `tools/data/` | The resource listings (JSON). Each entry has its source URL and the date it was checked. |
| `tools/i18n/` | Translations for the Resources page. |
| `tools/build_resources.py` | Builds the Resources page from the data and translations. |
| `DESIGN-RULES.md` | The design rules the site is held to. |

## Editing

- Home: edit `4-website/index.html`. Its header and footer are the master copy.
- Any other page: edit the fragment in `tools/pages/`, then run `python3 tools/make_page.py tools/pages/*.html`.
- Resources list: edit the JSON in `tools/data/`, then run `python3 tools/build_resources.py && python3 tools/make_page.py tools/pages/resources.html`.
- Preview: `python3 -m http.server 4610 --directory 4-website`.

## Styles

- `assets/css/shifa.css`: colour tokens, the three corner sizes, base elements, buttons.
- `assets/css/site.css`: the type ramp (at the top), layout and components.
- Spacing uses multiples of 4px up to 32px and multiples of 8px above that.
- One web font, Libre Franklin. Non-Latin scripts use system fonts.

## Third parties

- Donation form: Donorbox embed on `donate.html`.
- Instagram posts: SnapWidget embed on the home page.
- The Content Security Policy is set twice, in `4-website/_headers` and in the `<meta>` tag in `index.html`. Change both together.

## Known open items

- `sitemap.xml` and `robots.txt` use the `www` address; the live primary is the bare domain.
- The translations were made with AI and have not been reviewed by a fluent reader. English controls.
- The Privacy Policy and Terms of Use have not had attorney review.
- The Oakland and Mustang chapter logos are low resolution.
