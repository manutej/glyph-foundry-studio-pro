"""Headless Chromium bridge using local Playwright + Google Chrome."""
import json, pathlib, subprocess, tempfile

NODE_BIN = "~/.local/bin/node"
if not pathlib.Path(NODE_BIN).exists():
    NODE_BIN = "node"

PW_PATH = "~/ESMERALDA/node_modules/playwright"
CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def run_in_chromium(url, viewport_w=1280, viewport_h=720, scale=1, js_eval=None, screenshot_path=None, check_fonts=None):
    """Run a single headless Chrome session via Playwright to evaluate JS and/or screenshot."""
    script = f"""
const {{ chromium }} = require({json.dumps(PW_PATH)});
(async () => {{
  const browser = await chromium.launch({{ executablePath: {json.dumps(CHROME_PATH)}, args: ['--disable-gpu'] }});
  const context = await browser.newContext({{
    viewport: {{ width: {int(viewport_w)}, height: {int(viewport_h)} }},
    deviceScaleFactor: {float(scale)}
  }});
  const page = await context.newPage();
  await page.goto({json.dumps(url)});
  await page.evaluate(() => document.fonts ? document.fonts.ready : Promise.resolve());
  await page.waitForTimeout(160);
  const out = {{}};
  const fams = {json.dumps(check_fonts or [])};
  if (fams.length) {{
    out.missing = [];
    for (const [fam, wt] of fams) {{
      const ok = await page.evaluate(([f, w]) => document.fonts.check(`${{w}} 16px "${{f}}"`), [fam, wt]);
      if (!ok) out.missing.push([fam, wt]);
    }}
  }}
  if ({json.dumps(bool(js_eval))}) {{
    const fn = {js_eval or 'null'};
    out.result = await page.evaluate(fn);
  }}
  if ({json.dumps(bool(screenshot_path))}) {{
    await page.screenshot({{ path: {json.dumps(str(screenshot_path) if screenshot_path else "")} }});
  }}
  await browser.close();
  process.stdout.write("__PW_JSON__" + JSON.stringify(out));
}})().catch(err => {{
  console.error(err);
  process.exit(1);
}});
"""
    proc = subprocess.run([NODE_BIN, "-e", script], capture_output=True, text=True, check=True)
    marker = "__PW_JSON__"
    idx = proc.stdout.find(marker)
    if idx == -1:
        raise RuntimeError(f"Chromium bridge failed: {proc.stderr}")
    return json.loads(proc.stdout[idx + len(marker):])
