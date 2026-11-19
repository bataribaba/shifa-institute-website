"""Builds the Resources page from the verified data files.

Reads tools/data/resources-*.json, applies The Shifa Institute's own wording
for the entries that were already on its website, and writes
tools/pages/resources.html (which make_page.py then turns into the page).
"""
import json
import pathlib
import re

TOOLS = pathlib.Path(__file__).resolve().parent
DATA = TOOLS / 'data'

# Descriptions carried over from the current website's Resources page.
OWN_WORDS = {
    'muslimtherapist.directory': 'An online platform that connects individuals with licensed Muslim mental health professionals across various regions.',
    'maristan.org': 'A collection of mental health tools, articles, and educational materials designed to support Muslim communities through spiritually integrated care and culturally sensitive guidance.',
    'khalilcenter.com': 'Clinical services integrating Islamic spirituality and psychology. Offers individual therapy, workshops, and training for professionals.',
    'blackmentalhealth.com': 'Education, training, and resources to support mental wellness in Black communities, including a therapist referral service.',
    'beam.community': 'Healing, training, and peer support for Black individuals and families with a trauma-informed, community-centered approach.',
    'latinxtherapy.com': 'Bilingual therapy directories, podcast episodes, and resources aimed at dismantling mental health stigma in Latinx communities.',
    'asianmhc.org': 'A therapist directory and mental health resources designed to make care more accessible for Asian and Pacific Islander individuals.',
    'stevefund.org': 'Supports the mental health and emotional well-being of young people of color through campus programs, research, and crisis support.',
    'cognitivecarecenter.com': 'Psychiatric evaluations, therapy, and medication management for children and adults, with providers experienced in treating clients from Muslim and minority backgrounds.',
    'thefyi.org/michigan': "A community-based directory developed by The Family & Youth Institute to connect Michigan Muslims with faith-sensitive therapists across the state.",
    'icnarelief.org/michigan': "Free and low-cost social services, including refugee support, food aid, and limited mental health services tailored to the needs of Michigan's Muslim communities.",
}

# Listed on the current website; its site blocks automated checks, so it is
# carried over with a note rather than dropped.
EXTRA = [{
    'name': 'Inclusive Therapists',
    'url': 'https://www.inclusivetherapists.com/',
    'type': 'Therapist directory', 'community': 'Everyone', 'area': 'National',
    'phone': '', 'text': '', 'hours': '', 'cost': 'Varies by provider', 'languages': '',
    'description': 'A nationwide directory centering BIPOC, LGBTQ+, and neurodivergent therapists, with filters for cultural, spiritual, and language-based needs.',
    'source': 'https://www.inclusivetherapists.com/', 'verified': '2026-11-10',
    'confidence': 'Partly verified', 'notes': 'Carried over from the current Resources page.',
}]

# Left out on purpose: the organisation's website showed signs of tampering when checked.
SKIP = ['arab-american and chaldean council', 'teen line', 'never use alone', 'videophone', 'center for victims of torture']

KEEP = ['id', 'name', 'url', 'type', 'topic', 'community', 'area', 'phone', 'text', 'chat', 'hours', 'cost', 'languages', 'description', 'source', 'verified', 'confidence']

# Page text that the directory script writes itself (kept in step with resources.js).
SCRIPT_TEXT = {
    'showingAll': 'Showing all {n} resources', 'showingSome': 'Showing {a} of {n} resources',
    'lCall': 'Call', 'lText': 'Text', 'lHours': 'Hours', 'lCost': 'Cost', 'lLanguages': 'Languages',
    'callNow': 'Call now', 'call988': 'Call 988', 'visit': 'Visit website', 'chat': 'Chat online',
    'checkedFull': 'Details checked on the official website, {date}.', 'checkedPart': 'Listing checked, {date}.',
    'source': 'Source', 'confirm': 'Please confirm details with the organization.',
    'michigan': 'Michigan', 'national': 'National',
}


def main():
    items = []
    for f in sorted(DATA.glob('resources-*.json')):
        items += json.loads(f.read_text())['resources']
    items += EXTRA
    seen, out = set(), []
    for r in items:
        key = r['name'].strip().lower()
        if key in seen or any(x in key for x in SKIP):
            continue
        seen.add(key)
        for domain, words in OWN_WORDS.items():
            if domain in (r.get('url') or '').lower():
                r['description'] = words
        if r.get('community') == 'Refugees and immigrants':
            r['community'] = 'Immigrants and refugees'
        area = r.get('area') or ''
        if area.startswith('Southeast Michigan'):
            r['area'] = 'Southeast Michigan'
        elif area == 'East Lansing':
            r['area'] = 'East Lansing and Ingham County'
        if (r.get('phone') or '').strip() == '988' and '988' not in r['name']:
            r['phone'] = ''  # the organisation points people to 988; it is not its own line
        r['id'] = re.sub(r'[^a-z0-9]+', '-', key).strip('-')[:60]
        if not r.get('topic'):
            r['topic'] = 'Suicide and crisis' if r.get('type') == 'Crisis line' else 'General mental health'
        if (r.get('url') or '').startswith('http://'):
            r['url'] = 'https://' + r['url'][7:]
        out.append({k: (r.get(k) or '').strip() for k in KEEP})
    blob = json.dumps({'resources': out}, ensure_ascii=False).replace('</', '<\\/')
    template = (TOOLS / 'resources.template.html').read_text()
    (TOOLS / 'pages' / 'resources.html').write_text(template.replace('{{DATA}}', blob))
    print('resources:', len(out))

    # English source file for translators: page text, labels and listing text.
    ui = dict(SCRIPT_TEXT)
    for key, text in re.findall(r'data-i18n="([^"]+)"[^>]*>([^<]+)<', template):
        ui.setdefault(key, text.strip())
    for key, text in re.findall(r'placeholder="([^"]+)" data-i18n-placeholder="([^"]+)"', template):
        ui[text] = key.replace('&quot;', '"')
    labels = sorted({r[k] for r in out for k in ('type', 'topic', 'community', 'area') if r[k] and r[k] != 'National'})
    res = {r['id']: {k: v for k, v in (('d', r['description']), ('text', r['text']), ('hours', r['hours']), ('cost', r['cost']), ('languages', r['languages'])) if v} for r in out}
    (TOOLS / 'i18n').mkdir(exist_ok=True)
    (TOOLS / 'i18n' / 'en.json').write_text(json.dumps({'ui': ui, 'tax': {l: l for l in labels}, 'res': res}, ensure_ascii=False, indent=1))
    print('strings: ui', len(ui), 'labels', len(labels), 'listings', len(res))


def export_languages(write_source=True):
    """Packages each translated file in tools/i18n as a script the page can load.
    Only keys that still exist in the English source are published, and any
    missing listing simply falls back to English on the page."""
    src = json.loads((TOOLS / 'i18n' / 'en.json').read_text())
    out_dir = TOOLS.parent / '4-website' / 'assets' / 'i18n'
    out_dir.mkdir(parents=True, exist_ok=True)
    for f in sorted((TOOLS / 'i18n').glob('??.json')):
        code = f.stem
        if code == 'en':
            continue
        t = json.loads(f.read_text())
        extra = TOOLS / 'i18n' / (code + '-delta.json')
        if extra.exists():
            more = json.loads(extra.read_text())
            t.setdefault('tax', {}).update(more.get('tax', {}))
            t.setdefault('res', {}).update(more.get('res', {}))
        pack = {
            'ui': {k: v for k, v in t.get('ui', {}).items() if k in src['ui'] and v},
            'tax': {k: v for k, v in t.get('tax', {}).items() if k in src['tax'] and v},
            'res': {k: {f2: v2 for f2, v2 in v.items() if f2 in src['res'][k] and v2}
                    for k, v in t.get('res', {}).items() if k in src['res']},
        }
        missing = [k for k in src['res'] if k not in pack['res']] + [k for k in src['tax'] if k not in pack['tax']] + [k for k in src['ui'] if k not in pack['ui']]
        blob = json.dumps(pack, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/').replace('\u2028', '').replace('\u2029', '')
        (out_dir / (code + '.js')).write_text('window.SHIFA_I18N=window.SHIFA_I18N||{};window.SHIFA_I18N.%s=%s;\n' % (code, blob))
        print('language', code, 'listings', len(pack['res']), 'missing', len(missing))


if __name__ == '__main__':
    main()
    export_languages()
