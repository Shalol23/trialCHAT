"""Check WCAG A/AA rules in the site's principal interactive states.

Requires npm dependencies, Python Playwright, Chromium, and a running site.
BASE_URL and CHROMIUM_PATH can override cloud defaults.
"""

import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000")
failures = []
checks = []


def audit(page, name, selector="body"):
    if not page.evaluate("Boolean(window.axe)"):
        page.add_script_tag(path=str(ROOT / "node_modules/axe-core/axe.min.js"))
    result = page.evaluate("""async selector => {
      const result = await axe.run(document.querySelector(selector), {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] }
      });
      return result.violations.map(v => ({
        id: v.id, impact: v.impact,
        nodes: v.nodes.map(n => ({target:n.target, summary:n.failureSummary}))
      }));
    }""", selector)
    checks.append(name)
    if result:
        failures.append({"state": name, "violations": result})
    else:
        print("PASS", name)


with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium"),
        args=["--no-sandbox"],
    )
    page = browser.new_page(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    for route in ["/", "/about", "/projects", "/research", "/activities", "/contact"]:
        page.goto(BASE_URL.rstrip("/") + route, wait_until="networkidle")
        audit(page, f"desktop route: {route}")
    page.get_by_role("button", name="Create email draft", exact=False).click()
    audit(page, "contact validation errors")
    page.get_by_label("Your name", exact=True).fill("Alex Researcher")
    page.get_by_label("Reply email", exact=True).fill("alex@example.com")
    page.get_by_label("Your message", exact=True).fill("I would like to learn more about your matched evaluation protocol.")
    page.get_by_role("button", name="Create email draft", exact=False).click()
    expect(page.get_by_role("heading", name="Your email draft")).to_be_visible()
    audit(page, "contact draft preview")
    page.goto(BASE_URL.rstrip("/") + "/activities", wait_until="networkidle")
    page.get_by_role("button", name="Next steps", exact=False).click()
    page.locator("summary").click()
    audit(page, "activities filtered + expanded details")
    page.goto(BASE_URL.rstrip("/") + "/research", wait_until="networkidle")
    for label in ["Clean dataset", "Extract & learn", "Cross-validate", "Compare outcomes"]:
        section = page.locator("#methodology")
        section.get_by_role("tab", name=label, exact=False).click()
        expect(section.get_by_role("tabpanel")).to_be_visible()
        section.locator("summary").click()
        audit(page, f"methodology: {label} + technical details", "#methodology")
    results = page.locator("#results")
    results.get_by_role("button", name="Table", exact=True).click()
    results.get_by_role("button", name="View statistical context", exact=False).click()
    audit(page, "results table + statistical context", "#results")
    page.goto(BASE_URL.rstrip("/") + "/projects", wait_until="networkidle")
    demo = page.locator("#demo")
    for label in ["Anemia", "Normal", "Disagreement"]:
        demo.get_by_role("button", name=label, exact=True).click()
        demo.get_by_role("button", name="Run simulated analysis", exact=True).click()
        expect(demo.get_by_text({"Anemia": "Anemia pattern", "Normal": "Normal pattern", "Disagreement": "Model disagreement"}[label], exact=True)).to_be_visible()
        expect(demo.get_by_text("Example ready", exact=True)).to_be_visible()
        audit(page, f"demo: {label} output", "#demo")
    page.set_viewport_size({"width": 390, "height": 844})
    for route in ["/", "/about", "/projects", "/research", "/activities", "/contact"]:
        page.goto(BASE_URL.rstrip("/") + route, wait_until="networkidle")
        audit(page, f"mobile route: {route}")
    page.get_by_role("button", name="Open navigation", exact=True).click()
    audit(page, "mobile page + expanded navigation")
    browser.close()

if failures:
    print(json.dumps(failures, indent=2))
    raise SystemExit(f"Accessibility violations in {len(failures)} of {len(checks)} states")
print(f"PASS {len(checks)} accessibility states; no WCAG A/AA violations detected")
