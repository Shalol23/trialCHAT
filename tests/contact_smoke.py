#!/usr/bin/env python3
"""Verify the local-only Contact form against a running production server.

Run: python tests/contact_smoke.py
Requires Python Playwright and Chromium. Override BASE_URL / CHROMIUM_PATH if needed.
"""

import os
import time
from urllib.error import URLError
from urllib.parse import parse_qs, urlparse
from urllib.request import urlopen

from playwright.sync_api import expect, sync_playwright


BASE_URL = os.environ.get("BASE_URL", "http://127.0.0.1:3000").rstrip("/")
CHROMIUM_PATH = os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium")
AUTHORS = {
    "Pranav Sachdeva": "pranavsachdeva1109@gmail.com",
    "Shashank Edupuganti": "shashankedupuganti@gmail.com",
    "Abhinav Karthik": "reachabhi.ak@gmail.com",
    "Andreea Sistrunk": "sistrunk@vt.edu",
}
MESSAGE = "CONTACT_SMOKE_PRIVATE_MARKER: Can we discuss reproducibility and your validation protocol?"


def wait_for_contact():
    # A fresh production build may still be replacing the previous server.
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        try:
            with urlopen(f"{BASE_URL}/contact", timeout=3) as response:
                if response.status == 200:
                    return
        except (URLError, TimeoutError, ConnectionError):
            pass
        time.sleep(1)
    raise AssertionError("/contact did not respond with HTTP 200 within 60 seconds")


def no_overflow(page, label):
    dimensions = page.evaluate("({content: document.documentElement.scrollWidth, viewport: window.innerWidth})")
    assert dimensions["content"] <= dimensions["viewport"] + 1, f"{label}: horizontal overflow: {dimensions}"


def fill_valid_form(page, name="Alex Tester"):
    page.get_by_label("Your name", exact=True).fill(f"  {name}  ")
    page.get_by_label("Reply email", exact=True).fill("alex.tester@example.org")
    page.get_by_label("What's on your mind?", exact=True).select_option("collaboration")
    page.get_by_label("Write to", exact=True).select_option(AUTHORS["Andreea Sistrunk"])
    page.get_by_label("Your message", exact=True).fill(MESSAGE)


def check_draft(page, name="Alex Tester"):
    expect(page.get_by_role("heading", name="Your email draft", exact=True)).to_be_visible()
    expect(page.get_by_role("status")).to_contain_text("Your email draft is ready")
    mailto = page.get_by_role("link", name="Open email app", exact=True).get_attribute("href")
    assert mailto is not None
    parsed = urlparse(mailto)
    assert parsed.scheme == "mailto" and parsed.path == AUTHORS["Andreea Sistrunk"]
    params = parse_qs(parsed.query)
    assert params["subject"] == [f"Conjunctiva — A potential collaboration — {name}"]
    expected_body = f"Hello Andreea Sistrunk,\n\n{MESSAGE}\n\nBest,\n{name}\nReply email: alex.tester@example.org"
    assert params["body"] == [expected_body]
    expect(page.get_by_text(expected_body, exact=True)).to_be_visible()
    return f"To: {AUTHORS['Andreea Sistrunk']}\nSubject: {params['subject'][0]}\n\n{expected_body}"


def assert_local_only(requests, page, original_storage):
    assert not [request for request in requests if request.method not in ("GET", "HEAD")], "Contact actions made a network mutation request"
    assert not [request for request in requests if MESSAGE in request.url or MESSAGE in (request.post_data or "")], "The message appeared in a network request"
    assert not [request for request in requests if urlparse(request.url).netloc != urlparse(BASE_URL).netloc], "Contact actions contacted an external host"
    storage = page.evaluate("({local: {...localStorage}, session: {...sessionStorage}})")
    assert storage == original_storage, "Contact form persisted data to browser storage"


def main():
    wait_for_contact()
    errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=CHROMIUM_PATH, args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
        context.grant_permissions(["clipboard-read", "clipboard-write"], origin=BASE_URL)
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        response = page.goto(f"{BASE_URL}/contact", wait_until="networkidle")
        assert response and response.status == 200
        no_overflow(page, "desktop initial")

        for name, email in AUTHORS.items():
            card = page.get_by_role("link", name=f"Email {name} at {email}", exact=True)
            expect(card).to_have_attribute("href", f"mailto:{email}")
            expect(card).to_contain_text(name)
            expect(card).to_contain_text(email)
        assert page.locator('select[name="recipient"] option').count() == 4
        print("PASS desktop layout and all four verified author email links")

        requests = []
        page.on("request", lambda request: requests.append(request))
        storage_before = page.evaluate("({local: {...localStorage}, session: {...sessionStorage}})")
        create = page.get_by_role("button", name="Create email draft", exact=True)
        create.click()
        expect(page.get_by_label("Your name", exact=True)).to_be_focused()
        expect(page.locator("form").get_by_role("alert")).to_have_count(3)
        for field in ("Your name", "Reply email", "Your message"):
            control = page.get_by_label(field, exact=True)
            expect(control).to_have_attribute("aria-invalid", "true")
            described_by = control.get_attribute("aria-describedby") or ""
            assert "error" in described_by
        expect(page.get_by_role("heading", name="Your email draft", exact=True)).to_have_count(0)

        page.get_by_label("Your name", exact=True).fill("Alex Tester")
        page.get_by_label("Reply email", exact=True).fill("invalid-email")
        page.get_by_label("Your message", exact=True).fill("too short")
        create.click()
        expect(page.get_by_label("Reply email", exact=True)).to_be_focused()
        expect(page.locator("form").get_by_role("alert")).to_have_count(2)
        expect(page.get_by_text("Please enter a valid reply email address.", exact=True)).to_be_visible()
        print("PASS required/invalid input errors, accessible descriptions, and first-error focus")

        fill_valid_form(page)
        create.click()
        expected_clipboard = check_draft(page)
        no_overflow(page, "desktop draft")
        assert_local_only(requests, page, storage_before)
        print("PASS validated draft, selected recipient, encoded subject/body, and local-only preparation")

        page.get_by_role("button", name="Copy draft", exact=True).click()
        expect(page.get_by_role("status")).to_have_text("Email draft copied to your clipboard.")
        assert page.evaluate("navigator.clipboard.readText()") == expected_clipboard
        expect(page.get_by_role("button", name="Copied", exact=True)).to_be_visible()
        print("PASS actual clipboard copy")

        # Deliberately deny the modern clipboard API to exercise the real fallback.
        page.evaluate("""() => {
            window.__contactOriginalWrite = navigator.clipboard.writeText;
            navigator.clipboard.writeText = async () => { throw new Error('clipboard intentionally unavailable'); };
        }""")
        page.get_by_role("button", name="Copied", exact=True).click()
        expect(page.get_by_role("status")).to_have_text("Email draft copied to your clipboard.")
        assert page.evaluate("navigator.clipboard.readText()") == expected_clipboard
        print("PASS clipboard API-denial fallback with real copied content")

        page.evaluate("""() => {
            window.__contactOriginalExec = document.execCommand;
            document.execCommand = () => false;
        }""")
        page.get_by_role("button", name="Copied", exact=True).click()
        expect(page.get_by_role("status")).to_have_text("Copy was unavailable. You can select and copy the draft text below.")
        expect(page.get_by_role("heading", name="Your email draft", exact=True)).to_be_visible()
        print("PASS truthful clipboard-failure message and recoverable draft preview")

        page.get_by_label("Your message", exact=True).fill(MESSAGE + " Updated question.")
        expect(page.get_by_role("heading", name="Your email draft", exact=True)).to_have_count(0)
        expect(page.get_by_role("link", name="Open email app", exact=True)).to_have_count(0)
        create.click()
        expect(page.get_by_role("heading", name="Your email draft", exact=True)).to_be_visible()
        page.get_by_role("button", name="Clear", exact=True).click()
        expect(page.get_by_label("Your name", exact=True)).to_be_focused()
        expect(page.get_by_label("Your name", exact=True)).to_have_value("")
        expect(page.get_by_label("Reply email", exact=True)).to_have_value("")
        expect(page.get_by_label("Your message", exact=True)).to_have_value("")
        expect(page.get_by_label("What's on your mind?", exact=True)).to_have_value("research")
        expect(page.get_by_label("Write to", exact=True)).to_have_value(AUTHORS["Pranav Sachdeva"])
        expect(page.get_by_role("heading", name="Your email draft", exact=True)).to_have_count(0)
        expect(page.locator("form").get_by_role("alert")).to_have_count(0)
        expect(page.get_by_role("status")).to_have_text("Form cleared.")
        assert_local_only(requests, page, storage_before)
        print("PASS editing invalidates stale draft, reset restores defaults, no email sent or browser data stored")

        mobile_context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, reduced_motion="reduce")
        mobile = mobile_context.new_page()
        mobile.on("pageerror", lambda error: errors.append(str(error)))
        response = mobile.goto(f"{BASE_URL}/contact", wait_until="networkidle")
        assert response and response.status == 200
        no_overflow(mobile, "mobile initial")
        mobile.get_by_role("button", name="Create email draft", exact=True).click()
        expect(mobile.get_by_label("Your name", exact=True)).to_be_focused()
        no_overflow(mobile, "mobile validation")
        mobile_requests = []
        mobile.on("request", lambda request: mobile_requests.append(request))
        mobile_storage = mobile.evaluate("({local: {...localStorage}, session: {...sessionStorage}})")
        fill_valid_form(mobile, "Mobile Tester")
        mobile.get_by_role("button", name="Create email draft", exact=True).click()
        check_draft(mobile, "Mobile Tester")
        no_overflow(mobile, "mobile draft")
        mobile.get_by_role("button", name="Clear", exact=True).click()
        expect(mobile.get_by_label("Your name", exact=True)).to_have_value("")
        expect(mobile.get_by_role("heading", name="Your email draft", exact=True)).to_have_count(0)
        no_overflow(mobile, "mobile reset")
        assert_local_only(mobile_requests, mobile, mobile_storage)
        print("PASS mobile validation, draft creation/reset, and no horizontal overflow")

        assert not errors, f"Browser runtime errors: {errors}"
        browser.close()
    print("PASS all Contact browser checks")


if __name__ == "__main__":
    main()
