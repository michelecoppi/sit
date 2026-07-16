from pathlib import Path
import base64

source = Path('28578059-7834-4985-9e90-de6d9fb231b6.png')
out = Path('public/sit-icon.svg')

if not source.exists():
    raise FileNotFoundError(source)

payload = base64.b64encode(source.read_bytes()).decode('ascii')
svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
    f'<image href="data:image/png;base64,{payload}" width="512" height="512" preserveAspectRatio="xMidYMid meet"/>'
    '</svg>'
)
out.write_text(svg, encoding='utf-8')
print(f'Wrote {out}')
