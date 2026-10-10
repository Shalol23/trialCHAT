#!/usr/bin/env python3
"""Exercise the hero's actual WebGL output, controls, and static fallback.

Run against the built site: python tests/scene_smoke.py
Requires Python Playwright, Pillow, and Chromium. BASE_URL and CHROMIUM_PATH
can override the defaults. SwiftShader enables real WebGL in a cloud browser.
"""

import io
import os
import time

from PIL import Image, ImageChops
from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000").rstrip("/")
SCENE_NAME = "Interactive 3D red blood cell illustration"
ERRORS = []


def observe_errors(page, state):
    page.on("pageerror", lambda error: ERRORS.append(f"{state}: page error: {error}"))
    page.on("console", lambda message: ERRORS.append(f"{state}: console error: {message.text}") if message.type == "error" else None)


def open_home(page):
    """Allow a short production-server restart without accepting the old site."""
    deadline = time.monotonic() + 90
    last_error = None
    while time.monotonic() < deadline:
        try:
            response = page.goto(BASE_URL, wait_until="domcontentloaded", timeout=10000)
            assert response and response.status == 200
            expect(page.get_by_role("heading", level=1)).to_contain_text("Small signals.", timeout=3000)
            return
        except Exception as error:
            last_error = error
            page.wait_for_timeout(1000)
    raise AssertionError(f"New home page did not become ready: {last_error}")


def scene_snapshot(page):
    return Image.open(io.BytesIO(page.get_by_role("group", name=SCENE_NAME).locator("canvas").screenshot())).convert("RGB")


def changed_fraction(before, after):
    assert before.size == after.size
    difference = ImageChops.difference(before, after)
    red, green, blue = difference.split()
    maximum = ImageChops.lighter(ImageChops.lighter(red, green), blue)
    return sum(maximum.histogram()[9:]) / (before.width * before.height)


def expect_rendered_scene(page):
    scene = page.get_by_role("group", name=SCENE_NAME)
    expect(scene).to_be_visible()
    expect(page.get_by_role("button", name="Reset cell view", exact=True)).to_be_enabled(timeout=20000)
    expect(scene).to_contain_text("Move or drag to rotate")
    canvas = scene.locator("canvas")
    expect(canvas).to_have_count(1)
    capabilities = canvas.evaluate("""canvas => {
      const gl = canvas.getContext('webgl2');
      return { webgl2: !!gl, lost: gl?.isContextLost(), width: gl?.drawingBufferWidth, height: gl?.drawingBufferHeight };
    }""")
    assert capabilities["webgl2"] and not capabilities["lost"], capabilities
    assert capabilities["width"] > 300 and capabilities["height"] > 300, capabilities
    page.wait_for_timeout(750)
    rendered = scene_snapshot(page)
    pixels = rendered.tobytes()
    colors = zip(pixels[0::3], pixels[1::3], pixels[2::3])
    purple_pixels = sum(1 for red, green, blue in colors if 25 < red < 190 and green < red * 0.85 and blue > red * 1.04)
    assert purple_pixels > 5000, f"Canvas is blank or missing the purple 3D cell: {purple_pixels} cell-colored pixels"
    return scene


def test_interaction(browser):
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="no-preference")
    page = context.new_page()
    observe_errors(page, "WebGL")
    open_home(page)
    scene = expect_rendered_scene(page)
    pause = page.get_by_role("button", name="Pause cell rotation", exact=True)
    pause.click()
    expect(page.get_by_role("button", name="Resume cell rotation", exact=True)).to_be_visible()
    page.wait_for_timeout(700)
    still = scene_snapshot(page)
    page.wait_for_timeout(700)
    assert changed_fraction(still, scene_snapshot(page)) < 0.002, "Pause did not stop automatic scene motion"
    print("PASS real WebGL2 context, nonblank rendered cells, and paused pixel stability")

    scene.focus()
    page.wait_for_timeout(250)
    before_keys = scene_snapshot(page)
    for _ in range(3):
        scene.press("ArrowRight")
    scene.press("ArrowDown")
    page.wait_for_timeout(1100)
    keyboard_change = changed_fraction(before_keys, scene_snapshot(page))
    assert keyboard_change > 0.01, f"Arrow keys did not visibly rotate the actual 3D scene: {keyboard_change:.4%}"
    expect(scene).to_contain_text("Exploring")
    print(f"PASS keyboard changes actual rendered pixels ({keyboard_change:.1%})")

    before_mouse = scene_snapshot(page)
    box = scene.bounding_box()
    assert box
    page.mouse.move(box["x"] + box["width"] * 0.16, box["y"] + box["height"] * 0.2)
    page.wait_for_timeout(1100)
    mouse_change = changed_fraction(before_mouse, scene_snapshot(page))
    assert mouse_change > 0.01, f"Mouse movement did not affect the actual scene: {mouse_change:.4%}"
    print(f"PASS mouse changes actual rendered pixels ({mouse_change:.1%})")

    before_drag = scene_snapshot(page)
    page.mouse.down()
    page.mouse.move(box["x"] + box["width"] * 0.7, box["y"] + box["height"] * 0.6, steps=8)
    page.mouse.up()
    page.wait_for_timeout(1100)
    drag_change = changed_fraction(before_drag, scene_snapshot(page))
    assert drag_change > 0.01, f"Dragging did not affect the actual scene: {drag_change:.4%}"
    print(f"PASS dragging changes actual rendered pixels ({drag_change:.1%})")

    reset = page.get_by_role("button", name="Reset cell view", exact=True)
    reset.click()
    page.wait_for_timeout(1100)
    reset_reference = scene_snapshot(page)
    scene.focus()
    for _ in range(3):
        scene.press("ArrowLeft")
    page.wait_for_timeout(900)
    assert changed_fraction(reset_reference, scene_snapshot(page)) > 0.01
    reset.click()
    page.wait_for_timeout(1100)
    reset_difference = changed_fraction(reset_reference, scene_snapshot(page))
    assert reset_difference < 0.002, f"Reset did not restore the same paused orientation: {reset_difference:.4%}"
    print("PASS Reset restores the actual 3D orientation")

    page.get_by_role("button", name="Resume cell rotation", exact=True).click()
    expect(page.get_by_role("button", name="Pause cell rotation", exact=True)).to_be_visible()
    resume_start = scene_snapshot(page)
    page.wait_for_timeout(1300)
    assert changed_fraction(resume_start, scene_snapshot(page)) > 0.005, "Resume did not restart automatic motion"
    print("PASS Resume restarts automatic 3D motion")

    scene.locator("canvas").evaluate("canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()")
    expect(scene.locator("canvas")).to_have_count(0)
    expect(scene).to_contain_text("Static illustration")
    expect(scene.locator("svg").first).to_be_visible()
    expect(reset).to_be_disabled()
    print("PASS WebGL context loss restores the static illustration")
    context.close()


def test_reduced_motion(browser):
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    page = context.new_page()
    observe_errors(page, "reduced motion")
    open_home(page)
    scene = expect_rendered_scene(page)
    expect(page.get_by_role("button", name="Automatic motion disabled by your reduced-motion setting", exact=True)).to_be_disabled()
    expect(scene).to_contain_text("Still")
    initial = scene_snapshot(page)
    page.wait_for_timeout(850)
    assert changed_fraction(initial, scene_snapshot(page)) < 0.002, "Reduced-motion preference did not disable automatic rotation"
    scene.focus()
    scene.press("ArrowRight")
    scene.press("ArrowDown")
    page.wait_for_timeout(250)
    assert changed_fraction(initial, scene_snapshot(page)) > 0.01, "Reduced-motion preference prevented intentional keyboard interaction"
    print("PASS reduced motion disables automatic movement and preserves manual 3D controls")
    context.close()


def test_unavailable(browser):
    context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
    context.add_init_script("Object.defineProperty(window, 'WebGL2RenderingContext', { value: undefined, configurable: true });")
    page = context.new_page()
    observe_errors(page, "forced unavailable")
    open_home(page)
    scene = page.get_by_role("group", name=SCENE_NAME)
    expect(scene).to_contain_text("Static illustration", timeout=10000)
    expect(scene.locator("canvas")).to_have_count(0)
    expect(scene.locator("svg").first).to_be_visible()
    expect(page.get_by_role("button", name="Reset cell view", exact=True)).to_be_disabled()
    expect(page.get_by_role("button", name="Automatic motion disabled by your reduced-motion setting", exact=True)).to_be_disabled()
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"), "Mobile fallback causes horizontal overflow"
    print("PASS forced WebGL-unavailable fallback, disabled controls, and mobile width")
    context.close()


def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium"),
            args=["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
        )
        test_interaction(browser)
        test_reduced_motion(browser)
        test_unavailable(browser)
        browser.close()
    assert not ERRORS, "\n".join(ERRORS)
    print("PASS no browser console errors or uncaught page errors in all 3 scene states")


if __name__ == "__main__":
    main()
