#!/usr/bin/env python3
"""Browser smoke test for a running site.

Run: python tests/site_smoke.py [http://127.0.0.1:3000]
Requires the Python playwright package and /usr/bin/chromium.
"""

import csv
import os
import re
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


BASE_URL = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("BASE_URL", "http://127.0.0.1:3000")).rstrip("/")
EXPECTED_ROWS = [
    ["Accuracy", "84.74", "2.2", "77.78", "6.72"],
    ["Anemia precision", "80.02", "5.84", "80.45", "7.64"],
    ["Sensitivity", "88.57", "9.69", "65.05", "14.31"],
    ["Anemia F1", "83.44", "2.99", "71.2", "10.24"],
    ["Normal precision", "90.83", "6.71", "77.03", "7.37"],
    ["Specificity", "81.96", "6.33", "87.52", "5.4"],
    ["Normal F1", "85.74", "1.95", "81.72", "5.03"],
]


def check_anchor(page, label, anchor, navigation):
    navigation.get_by_role("link", name=label, exact=True).click()
    expect(page).to_have_url(re.compile(rf"#{anchor}$"))
    page.wait_for_function(
        "id => { const top = document.getElementById(id).getBoundingClientRect().top; return top >= 79 && top <= 250; }",
        arg=anchor,
    )


def check_no_overflow(page):
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"), "Page overflows horizontally"


def main():
    browser_errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium"), args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce", accept_downloads=True)

        def capture_errors(page):
            page.on("pageerror", lambda error: browser_errors.append(f"Page error: {error}"))
            page.on("console", lambda message: browser_errors.append(f"Console error: {message.text}") if message.type == "error" else None)

        page = context.new_page()
        capture_errors(page)
        response = page.goto(BASE_URL, wait_until="networkidle")
        assert response and response.status == 200
        expect(page.get_by_role("heading", level=1)).to_be_visible()
        check_no_overflow(page)

        navigation = page.get_by_role("navigation", name="Main navigation", exact=True)
        for label, anchor in [("Overview", "research"), ("Methodology", "methodology"), ("Results", "results"), ("About", "about")]:
            check_anchor(page, label, anchor, navigation)
        print("PASS desktop navigation and anchor positioning")

        methodology = page.locator("#methodology")
        tab = lambda label: methodology.get_by_role("tab", name=re.compile(label))
        panel = methodology.get_by_role("tabpanel")
        tab("Clean dataset").click()
        expect(tab("Clean dataset")).to_have_attribute("aria-selected", "true")
        expect(panel).to_contain_text("Start with images we can trust.")
        tab("Clean dataset").press("ArrowRight")
        expect(tab("Extract & learn")).to_be_focused()
        expect(tab("Extract & learn")).to_have_attribute("aria-selected", "true")
        expect(panel).to_contain_text("12 RGB / HSV features")
        tab("Extract & learn").press("End")
        expect(tab("Compare outcomes")).to_be_focused()
        expect(panel).to_contain_text("Adjusted significance threshold: α = 0.0167")
        tab("Compare outcomes").press("Home")
        expect(tab("Clean dataset")).to_be_focused()
        tab("Clean dataset").press("ArrowLeft")
        expect(tab("Compare outcomes")).to_be_focused()
        tab("Compare outcomes").press("ArrowRight")
        expect(tab("Clean dataset")).to_be_focused()
        diagrams = set()
        for index, label in enumerate(["Clean dataset", "Extract & learn", "Cross-validate", "Compare outcomes"]):
            tab(label).click()
            expect(tab(label)).to_have_attribute("aria-selected", "true")
            expect(panel).to_have_attribute("aria-labelledby", f"methodology-tab-{index}")
            diagrams.add(panel.locator("[aria-label^='Illustration:']").inner_text())
            details = panel.locator("details")
            details.locator("summary").click()
            expect(details).to_have_attribute("open", "")
            expect(details.locator("ul")).to_be_visible()
            assert details.locator("li").count() == 3
            details.locator("summary").click()
            expect(details).not_to_have_attribute("open", "")
        assert len(diagrams) == 4, "Each methodology step must show a distinct diagram"
        print("PASS methodology tabs, arrow/home/end keys, and technical details")

        results = page.locator("#results")
        for label, value, baseline in [("Sensitivity", "88.57", "65.05"), ("Accuracy", "84.74", "77.78"), ("Specificity", "81.96", "87.52"), ("Anemia F1", "83.44", "71.2")]:
            button = results.get_by_role("button", name=label, exact=True)
            button.click()
            expect(button).to_have_attribute("aria-pressed", "true")
            chart = results.get_by_role("img", name=re.compile(rf"^{label}:"))
            expect(chart).to_be_visible()
            expect(chart).to_have_attribute("aria-label", re.compile(rf"YOLOv8 {value}%.*RGB HSV {baseline}%"))
        results.get_by_role("button", name="Table", exact=True).click()
        expect(results.get_by_role("button", name="Table", exact=True)).to_have_attribute("aria-pressed", "true")
        table = results.get_by_role("table")
        expect(table).to_be_visible()
        assert table.locator("tbody tr").count() == 7
        expect(table.get_by_role("row", name=re.compile(r"^Sensitivity"))).to_contain_text("88.57")
        expect(table.get_by_role("row", name=re.compile(r"^Sensitivity"))).to_contain_text("65.05")
        results.get_by_role("button", name="Chart", exact=True).click()
        expect(results.get_by_role("button", name="Anemia F1", exact=True)).to_have_attribute("aria-pressed", "true")
        expect(results.get_by_role("img", name=re.compile(r"^Anemia F1:"))).to_be_visible()
        context_button = results.get_by_role("button", name="View statistical context & pooled results")
        context_button.click()
        expect(context_button).to_have_attribute("aria-expanded", "true")
        expect(results.locator("#statistical-context")).to_contain_text("61 true positives")
        context_button.click()
        expect(context_button).to_have_attribute("aria-expanded", "false")

        with page.expect_download() as download_info:
            results.get_by_role("button", name="Export data", exact=True).click()
        download = download_info.value
        assert download.suggested_filename == "conjunctiva-study-results.csv"
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / download.suggested_filename
            download.save_as(path)
            text = path.read_text()
            rows = list(csv.reader(text.splitlines()))
            assert rows[0] == ["Metric", "YOLOv8 mean (%)", "YOLOv8 SD (%)", "RGB/HSV mean (%)", "RGB/HSV SD (%)"]
            assert rows[1:8] == EXPECTED_ROWS, "CSV must match the supplied paper's Table I"
            assert "not clinical diagnostic accuracy" in text
        print("PASS result metrics, chart/table state, statistical details, and CSV export")

        pdf = context.request.get(f"{BASE_URL}/research-paper.pdf")
        assert pdf.status == 200
        assert "application/pdf" in pdf.headers.get("content-type", "")
        assert pdf.body().startswith(b"%PDF-"), "Paper download is not a PDF"
        print("PASS paper PDF response and content")

        mobile_context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, reduced_motion="reduce")
        mobile = mobile_context.new_page()
        capture_errors(mobile)
        mobile.goto(BASE_URL, wait_until="networkidle")
        check_no_overflow(mobile)
        for label, anchor in [("Overview", "research"), ("Methodology", "methodology"), ("Results", "results"), ("About", "about")]:
            mobile.get_by_role("button", name="Open navigation", exact=True).click()
            expect(mobile.get_by_role("button", name="Close navigation", exact=True)).to_have_attribute("aria-expanded", "true")
            mobile_nav = mobile.get_by_role("navigation", name="Mobile navigation", exact=True)
            expect(mobile_nav).to_be_visible()
            check_anchor(mobile, label, anchor, mobile_nav)
            expect(mobile.get_by_role("button", name="Open navigation", exact=True)).to_have_attribute("aria-expanded", "false")
            expect(mobile.get_by_role("navigation", name="Mobile navigation", exact=True)).to_have_count(0)
        mobile.get_by_role("button", name="Open navigation", exact=True).click()
        mobile.get_by_role("button", name="Close navigation", exact=True).click()
        expect(mobile.get_by_role("navigation", name="Mobile navigation", exact=True)).to_have_count(0)
        check_no_overflow(mobile)
        print("PASS mobile navigation open/close, anchors, and page width")

        assert not browser_errors, "\n".join(browser_errors)
        print("PASS no browser console errors or uncaught page errors")
        browser.close()


if __name__ == "__main__":
    main()
