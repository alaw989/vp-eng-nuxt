#!/usr/bin/env python3
"""Turn a vector shop-drawing PDF into the animated banner drawing PageBanner uses.

    python3 scripts/banner-drawing.py <drawing.pdf> <name> [--crop x0,y0,x1,y1] [--skip x0,y0,x1,y1 ...]

Writes public/images/drawings/<name>.svg, and <name>-lite.svg with --lite (smaller,
fewer short details, no grating layer) for phones. The files carry no styles or
animation: BannerDrawing.vue fetches one, inlines it, and animates it with its
own CSS, so it replays on every visit and respects reduced motion.

How it works: pdftocairo converts the PDF to SVG; every stroke is flattened to
page coordinates; the sheet border, title block and any --skip boxes are dropped;
segments are deduped (CAD exports draw hidden edges many times), short ones
removed, and touching ones chained into polylines. Dense grating hatch goes to a
fainter layer that fades in last. The rest is bucketed into bands by height so
the frame "goes up" from its base as it draws.

--crop and --skip take fractions of the sheet (0-1), measured from the top left of
the page as it displays. The defaults keep the area inside a standard sheet border.
Needs pdftocairo (poppler). Only straight-line (M/L) PDFs are supported, which is
what the SDS2 and ACAD exports on the site produce.
"""
import argparse, json, math, os, re, subprocess, sys, tempfile
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'public', 'images', 'drawings')

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('pdf')
ap.add_argument('name')
ap.add_argument('--crop', default='0.05,0.03,0.977,0.971', help='keep box, as fractions x0,y0,x1,y1')
ap.add_argument('--skip', action='append', default=[], help='drop box (e.g. a label), fractions x0,y0,x1,y1')
ap.add_argument('--width', type=int, default=1600, help='output viewBox width')
ap.add_argument('--bands', type=int, default=14, help='how many ground-up stages the draw-in has')
ap.add_argument('--min-length', type=float, default=1.2, help='drop segments shorter than this')
ap.add_argument('--lite', action='store_true', help='phone version: 800 wide, min length 5, no grating layer')
args = ap.parse_args()
if args.lite:
    args.width, args.min_length = 800, 5

def box(s):
    return tuple(float(v) for v in s.split(','))

with tempfile.TemporaryDirectory() as tmp:
    svg_path = os.path.join(tmp, 'sheet.svg')
    subprocess.run(['pdftocairo', '-svg', args.pdf, svg_path], check=True)
    svg = open(svg_path).read()

vb = [float(v) for v in re.search(r'viewBox="([^"]*)"', svg).group(1).split()]
PAGE_W, PAGE_H = vb[2], vb[3]
path_re = re.compile(r'<path fill="none"[^>]*? d="([^"]*)"(?: transform="matrix\(([^)]*)\)")?')
tok = re.compile(r'[A-Za-z]|-?[\d.]+(?:e-?\d+)?')

segs, unsupported = [], set()
for d, m in path_re.findall(svg):
    a, b, c, dd, e, f = (map(float, m.split(',')) if m else (1, 0, 0, 1, 0, 0))
    toks = tok.findall(d)
    i, prev, start = 0, None, None
    while i < len(toks):
        t = toks[i]
        if t in 'ML':
            x, y = float(toks[i + 1]), float(toks[i + 2]); i += 3
            p = (a * x + c * y + e, b * x + dd * y + f)
            if t == 'M':
                start = p
            elif prev is not None:
                segs.append((prev, p))
            prev = p
        elif t == 'Z':
            if prev and start:
                segs.append((prev, start))
            prev = start; i += 1
        else:
            unsupported.add(t); i += 1
if unsupported:
    print(f'warning: skipped unsupported path commands {sorted(unsupported)}', file=sys.stderr)

cx0, cy0, cx1, cy1 = box(args.crop)
skips = [box(s) for s in args.skip]
def keep(p):
    fx, fy = p[0] / PAGE_W, p[1] / PAGE_H
    if not (cx0 < fx < cx1 and cy0 < fy < cy1):
        return False
    return not any(x0 < fx < x1 and y0 < fy < y1 for x0, y0, x1, y1 in skips)

segs = [s for s in segs if keep(s[0]) and keep(s[1])]
if not segs:
    sys.exit('no line work left after cropping; check --crop')
xs = [p[0] for s in segs for p in s]; ys = [p[1] for s in segs for p in s]
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
W = args.width
scale = W / (maxx - minx)
H = math.ceil((maxy - miny) * scale)

def q(p):  # to output units, on a half-unit grid
    return (round((p[0] - minx) * scale * 2) / 2, round((p[1] - miny) * scale * 2) / 2)

lines = set()
for s in segs:
    a, b = q(s[0]), q(s[1])
    if a != b and math.dist(a, b) >= args.min_length:
        lines.add((a, b) if a <= b else (b, a))

# Grating hatch: many short parallel segments in the same small cell
def cell(s):
    (x1, y1), (x2, y2) = s
    ang = round(math.degrees(math.atan2(y2 - y1, x2 - x1)) % 180 / 10) % 18
    return (int((x1 + x2) / 16), int((y1 + y2) / 16), ang)
counts = defaultdict(int)
for s in lines:
    counts[cell(s)] += 1
hatch = {s for s in lines if math.dist(*s) < 40 and counts[cell(s)] >= 4}
lines -= hatch

def chain(segset):
    seglist = list(segset)
    adj = defaultdict(list)
    for i, (a, b) in enumerate(seglist):
        adj[a].append(i); adj[b].append(i)
    used = [False] * len(seglist)
    polys = []
    for i, (a, b) in enumerate(seglist):
        if used[i]:
            continue
        used[i] = True
        line = [a, b]
        for forward in (True, False):
            while True:
                tip = line[-1] if forward else line[0]
                nxt = next((j for j in adj[tip] if not used[j]), None)
                if nxt is None:
                    break
                used[nxt] = True
                u, v = seglist[nxt]
                other = v if u == tip else u
                line.append(other) if forward else line.insert(0, other)
        polys.append(line)
    return polys

def fmt(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')

def to_d(pts):
    out, (px, py) = ['M' + fmt(pts[0][0]) + ' ' + fmt(pts[0][1])], pts[0]
    for x, y in pts[1:]:
        dx, dy = x - px, y - py
        out.append('h' + fmt(dx) if dy == 0 else 'v' + fmt(dy) if dx == 0 else 'l' + fmt(dx) + ' ' + fmt(dy))
        px, py = x, y
    return ''.join(out)

lowest = lambda pts: max(p[1] for p in pts)
leftmost = lambda pts: min(p[0] for p in pts)

bands = [[] for _ in range(args.bands)]
for pts in chain(lines):
    bands[min(args.bands - 1, int((H - lowest(pts)) / H * args.bands))].append(pts)
band_ds = [''.join(to_d(p) for p in sorted(b, key=leftmost)) for b in bands]
band_ds = [d for d in band_ds if d]
hatch_d = ''.join(to_d(p) for p in sorted(chain(hatch), key=lambda p: (-lowest(p), leftmost(p))))

def write(name):
    # Stroke widths scale with the viewBox so both sizes render at ~1px
    sw = round(2 * W / 1600, 2)
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none" stroke="#fff" '
           f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">']
    # --i orders the ground-up draw-in; pathLength lets one dash cover each band
    for i, d in enumerate(band_ds):
        out.append(f'<path pathLength="1" style="--i:{i}" d="{d}"/>')
    if hatch_d and not args.lite:
        out.append(f'<path class="hatch" stroke-width="{round(sw * 0.75, 2)}" opacity="0.4" d="{hatch_d}"/>')
    out.append('</svg>')
    path = os.path.join(OUT_DIR, name)
    with open(path, 'w') as fh:
        fh.write('\n'.join(out) + '\n')
    return path

os.makedirs(OUT_DIR, exist_ok=True)
out_path = write(f'{args.name}-lite.svg' if args.lite else f'{args.name}.svg')
print(json.dumps({
    'raw_segments': len(segs), 'lines': len(lines), 'hatch': len(hatch),
    'viewBox': f'0 0 {W} {H}', 'file': os.path.relpath(out_path, ROOT),
    'bytes': os.path.getsize(out_path),
}, indent=2))
