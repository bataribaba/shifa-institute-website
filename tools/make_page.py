"""Builds a page of the Shifa website from a main-content fragment.

Header, footer and <head> are taken from 4-website/index.html so every page
stays identical. Usage: python3 make_page.py pages/donate.html

Each fragment starts with one settings comment:
<!-- file: donate.html || title: ... || desc: ... || current: donate.html -->
Optional settings: scripts (extra script tags), robots (for example noindex).
"""
import re
import sys
import pathlib

SITE = pathlib.Path(__file__).resolve().parent.parent / '4-website'
SNAP = '<script src="https://snapwidget.com/js/snapwidget.js" defer></script>\n'


def build(fragment_path):
    frag = pathlib.Path(fragment_path).read_text()
    m = re.match(r'\s*<!--(.*?)-->', frag, re.S)
    cfg = {}
    for part in m.group(1).split(' || '):
        key, _, value = part.partition(':')
        cfg[key.strip()] = value.strip()
    main = frag[m.end():].strip()

    s = (SITE / 'index.html').read_text()
    s = re.sub(r'<title>.*?</title>', lambda _: '<title>%s</title>' % cfg['title'], s, flags=re.S)
    s = re.sub(r'<meta name="description" content=".*?">',
               lambda _: '<meta name="description" content="%s">' % cfg['desc'], s, flags=re.S)
    s = re.sub(r'<meta property="og:title" content=".*?">',
               lambda _: '<meta property="og:title" content="%s">' % cfg['title'], s)
    if cfg.get('robots'):
        s = s.replace('<meta name="theme-color"',
                      '<meta name="robots" content="%s">\n<meta name="theme-color"' % cfg['robots'])
    s = s.replace(' aria-current="page"', '')
    cur = cfg.get('current', '')
    if cur:
        s = s.replace('<a href="%s">' % cur, '<a href="%s" aria-current="page">' % cur, 1)
    s = re.sub(r'<main id="main">.*?</main>',
               lambda _: '<main id="main">\n\n' + main + '\n\n</main>', s, flags=re.S)
    extra = cfg.get('scripts', '')
    s = s.replace(SNAP, (extra + '\n') if extra else '')
    (SITE / cfg['file']).write_text(s)
    print('wrote', cfg['file'], len(s))


if __name__ == '__main__':
    for f in sys.argv[1:]:
        build(f)
