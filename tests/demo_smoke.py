"""Exercise the simulated demo in a running app; no inference service is needed.

Run with: python tests/demo_smoke.py
Requires Playwright and Chromium; override BASE_URL / CHROMIUM_PATH as needed.
"""

import base64
import json
import os
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:3000")
CHROMIUM_PATH = os.getenv("CHROMIUM_PATH", "/usr/bin/chromium")
ARTIFACTS = Path("/tmp/trialchat-demo-smoke")
ARTIFACTS.mkdir(exist_ok=True)

# A valid, original one-pixel PNG for local file-picker and drag/drop checks.
PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII="
)


def model_class(demo, model, expected):
    card = demo.get_by_text(model, exact=True).locator("xpath=../../..")
    expect(card.get_by_text(expected, exact=True)).to_be_visible()


def run_scenario(demo, scenario, yolo, rgb_hsv):
    demo.get_by_role("button", name=scenario, exact=True).click()
    demo.get_by_role("button", name="Run simulated analysis", exact=True).click()
    expect(demo.get_by_text("Example ready", exact=True)).to_be_visible(timeout=6000)
    expect(demo.get_by_text("Prewritten example class", exact=True)).to_have_count(2)
    model_class(demo, "YOLOv8", yolo)
    model_class(demo, "RGB / HSV", rgb_hsv)


def image_input(demo):
    return demo.locator('input[type="file"]')


def check_preview(demo):
    img = demo.get_by_alt_text("Your uploaded image, shown only as a local preview")
    expect(img).to_be_visible()
    expect(img).to_have_js_property("naturalWidth", 1)


checks = []
errors = []
requests = []

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=CHROMIUM_PATH, args=["--no-sandbox"]
    )
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(BASE_URL, wait_until="networkidle")
    page.on(
        "request",
        lambda request: requests.append(request.url)
        if request.resource_type in ("fetch", "xhr")
        else None,
    )
    demo = page.locator("#demo")
    demo.scroll_into_view_if_needed()

    for scenario, yolo, rgb_hsv in (
        ("Anemia", "Anemia", "Anemia"),
        ("Normal", "Normal", "Normal"),
        ("Disagreement", "Anemia", "Normal"),
    ):
        run_scenario(demo, scenario, yolo, rgb_hsv)
        checks.append(f"desktop scenario: {scenario}")
    expect(demo.get_by_text("The example approaches disagree", exact=True)).to_be_visible()
    demo.screenshot(path=str(ARTIFACTS / "desktop-disagreement.png"))

    demo.get_by_role("button", name="Run simulated analysis", exact=True).click()
    expect(demo.get_by_text("Playing the workflow", exact=True)).to_be_visible()
    demo.get_by_role("button", name="Reset simulated demonstration").click()
    page.wait_for_timeout(1700)
    expect(demo.get_by_text("Example ready", exact=True)).to_have_count(0)
    expect(demo.get_by_text("A small preview of the possibilities.", exact=True)).to_be_visible()
    expect(demo.get_by_role("button", name="Anemia", exact=True)).to_have_attribute("aria-pressed", "true")
    checks.append("reset during loading cancels delayed result")

    demo.get_by_role("button", name="Upload an image", exact=True).click()
    browse = demo.get_by_role("button", name="Browse files")
    browse.focus()
    with page.expect_file_chooser() as chooser:
        page.keyboard.press("Enter")
    chooser.value.set_files({"name": "local-preview.png", "mimeType": "image/png", "buffer": PNG})
    check_preview(demo)
    run_scenario(demo, "Normal", "Normal", "Normal")
    expect(demo.get_by_text("These outputs are prewritten", exact=False)).to_contain_text("unrelated to your uploaded image")
    checks.append("keyboard file picker, valid preview, scenario-based upload outputs")
    demo.get_by_role("button", name="Remove uploaded image").click()
    expect(demo.get_by_role("button", name="Run simulated analysis", exact=True)).to_be_disabled()
    checks.append("remove upload disables simulation until another image is supplied")

    image_input(demo).set_input_files({"name": "invalid.txt", "mimeType": "text/plain", "buffer": b"not an image"})
    expect(demo.get_by_role("alert")).to_contain_text("Other file types are not supported")
    image_input(demo).set_input_files({"name": "too-large.png", "mimeType": "image/png", "buffer": b"x" * (10 * 1024 * 1024 + 1)})
    expect(demo.get_by_role("alert")).to_contain_text("too large")
    image_input(demo).set_input_files({"name": "corrupt.png", "mimeType": "image/png", "buffer": b"invalid PNG bytes"})
    expect(demo.get_by_role("alert")).to_contain_text("could not be displayed as an image")
    expect(demo.get_by_role("button", name="Run simulated analysis", exact=True)).to_be_disabled()
    checks.append("invalid MIME, >10 MB, and corrupt-image errors")

    transfer = page.evaluate_handle(
        """(data) => {
            const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
            const transfer = new DataTransfer();
            transfer.items.add(new File([bytes], 'dragged-image.png', { type: 'image/png' }));
            return transfer;
        }""",
        base64.b64encode(PNG).decode(),
    )
    dropzone = demo.locator("div.border-dashed")
    dropzone.dispatch_event("dragenter", {"dataTransfer": transfer})
    dropzone.dispatch_event("drop", {"dataTransfer": transfer})
    check_preview(demo)
    expect(demo.get_by_role("alert")).to_have_count(0)
    checks.append("drag/drop accepts valid image and clears errors")

    # There must be no model/API request on any upload or simulation action.
    assert not requests, f"Unexpected requests from demo interactions: {requests}"
    assert not errors, f"Browser runtime errors: {errors}"
    checks.append("no fetch/XHR requests or browser runtime errors")

    mobile = browser.new_context(
        viewport={"width": 390, "height": 844},
        is_mobile=True,
        has_touch=True,
        reduced_motion="reduce",
    )
    mobile_page = mobile.new_page()
    mobile_page.on("pageerror", lambda error: errors.append(str(error)))
    mobile_page.goto(BASE_URL, wait_until="networkidle")
    mobile_demo = mobile_page.locator("#demo")
    mobile_demo.scroll_into_view_if_needed()
    mobile_demo.get_by_role("button", name="Upload an image", exact=True).click()
    image_input(mobile_demo).set_input_files({"name": "mobile-image.png", "mimeType": "image/png", "buffer": PNG})
    check_preview(mobile_demo)
    run_scenario(mobile_demo, "Disagreement", "Anemia", "Normal")
    assert mobile_demo.evaluate(
        """el => [...el.querySelectorAll('*')].every(node => {
            const box = node.getBoundingClientRect();
            return box.width < 1 || (box.left >= -1 && box.right <= innerWidth + 1);
        })"""
    ), "Demo has content outside the mobile viewport"
    mobile_demo.screenshot(path=str(ARTIFACTS / "mobile-upload-disagreement.png"))
    mobile_demo.get_by_role("button", name="Reset simulated demonstration").click()
    expect(mobile_demo.get_by_text("Example ready", exact=True)).to_have_count(0)
    expect(mobile_demo.get_by_role("button", name="Try an illustration", exact=True)).to_have_attribute("aria-pressed", "true")
    assert not errors, f"Browser runtime errors: {errors}"
    checks.append("mobile upload, reduced motion, disagreement, reset, and no horizontal overflow")
    browser.close()

print(json.dumps({"passed": checks, "artifacts": str(ARTIFACTS)}, indent=2))
