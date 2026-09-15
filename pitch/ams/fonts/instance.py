# Static instances of the variable Google Fonts in var/, one file per weight the document uses.
# Chromium's PDF writer emits variable fonts as Type3 outlines; static TrueType subsets embed as real fonts.
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
import os
WANT = {
  'Sora': ([700, 800, 900], {}),
  'Archivo': ([500, 600], {'wdth': 100}),
  'JetBrainsMono': ([500, 700], {}),
  'NunitoSans': ([400, 700], {'wdth': 100, 'opsz': 12, 'YTLC': 500}),
}
for name, (weights, extra) in WANT.items():
    for w in weights:
        f = TTFont(os.path.join('var', name + '.ttf'))
        axes = {'wght': w}
        have = {a.axisTag for a in f['fvar'].axes}
        for k, v in extra.items():
            if k in have: axes[k] = v
        inst = instancer.instantiateVariableFont(f, axes, inplace=False)
        out = f'{name}-{w}.ttf'
        inst.save(out)
        print(out, os.path.getsize(out), 'bytes')
