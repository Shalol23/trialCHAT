#!/usr/bin/env python3
"""Browser smoke tests for the multipage research site.

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
ROUTES = [("Home", "/"), ("About", "/about"), ("Projects", "/projects"), ("Research", "/research"), ("Activities", "/activities"), ("Contact", "/contact")]
EXPECTED_ROWS = [
    ["Accuracy", "84.74", "2.2", "77.78", "6.72"],
    ["Anemia precision", "80.02", "5.84", "80.45", "7.64"],
    ["Sensitivity", "88.57", "9.69", "65.05", "14.31"],
    ["Anemia F1", "83.44", "2.99", "71.2", "10.24"],
    ["Normal precision", "90.83", "6.71", "77.03", "7.37"],
    ["Specificity", "81.96", "6.33", "87.52", "5.4"],
    ["Normal F1", "85.74", "1.95", "81.72", "5.03"],
]


def check_no_overflow(page):
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"), f"Page overflows horizontally: {page.url}"


def check_shell(page, label, path, desktop=True):
    expect(page).to_have_url(re.compile(rf"^{re.escape(BASE_URL + path)}(?:[?#].*)?$"))
    expect(page.get_by_role("heading", level=1)).to_have_count(1)
    expect(page.get_by_role("heading", level=1)).to_be_visible()
    expect(page.locator("main#main")).to_have_count(1)
    expect(page.locator("header")).to_have_count(1)
    footer = page.get_by_role("contentinfo")
    expect(footer).to_have_count(1)
    for link_label, href in ROUTES:
        expect(footer.get_by_role("link", name=link_label, exact=True)).to_have_attribute("href", href)
    if desktop:
        navigation = page.get_by_role("navigation", name="Main navigation", exact=True)
        expect(navigation).to_be_visible()
        expect(navigation.get_by_role("link")).to_have_count(6)
        expect(navigation.locator('[aria-current="page"]')).to_have_count(1)
        expect(navigation.get_by_role("link", name=label, exact=True)).to_have_attribute("aria-current", "page")
    check_no_overflow(page)


def check_projects(page):
    page.goto(f"{BASE_URL}/projects", wait_until="networkidle")
    workstreams = page.locator('section[aria-labelledby="workstreams-heading"]')
    filters = workstreams.get_by_role("group", name="Filter project workstreams")
    expect(workstreams.get_by_role("article")).to_have_count(4)
    for label, titles in [
        ("Models", ["Learning beyond color.", "Making color count."]),
        ("System", ["Same images. Fair comparison.", "From image to interface."]),
    ]:
        filters.get_by_role("button", name=label, exact=True).click()
        expect(filters.get_by_role("button", name=label, exact=True)).to_have_attribute("aria-pressed", "true")
        expect(workstreams.get_by_role("article")).to_have_count(2)
        for title in titles:
            expect(workstreams.get_by_role("heading", name=title, exact=True)).to_be_visible()
        expect(workstreams.get_by_role("status")).to_contain_text(f"Showing 2 workstreams in {label.lower()}")
    filters.get_by_role("button", name="All", exact=True).click()
    expect(workstreams.get_by_role("article")).to_have_count(4)
    expect(page.locator("#demo")).to_contain_text("Simulated demonstration")
    expect(page.locator("#demo")).to_contain_text("no live inference")
    page.get_by_role("link", name="Try the simulation", exact=True).click()
    expect(page).to_have_url(re.compile(r"/projects#demo$"))
    expect(page.locator("#demo").get_by_role("heading", level=2)).to_be_visible()
    check_no_overflow(page)
    print("PASS project category filters, correct workstreams, and simulated demo link")


def check_activities(page):
    page.goto(f"{BASE_URL}/activities", wait_until="networkidle")
    timeline = page.locator('section[aria-label="Research milestone timeline"]')
    filters = timeline.get_by_role("group", name="Filter research milestones")
    expect(timeline.get_by_role("article")).to_have_count(6)
    filters.get_by_role("button", name=re.compile(r"^Completed\b")).click()
    expect(filters.get_by_role("button", name=re.compile(r"^Completed\b"))).to_have_attribute("aria-pressed", "true")
    expect(timeline.get_by_role("article")).to_have_count(5)
    expect(timeline.get_by_role("status")).to_have_text("5 milestones shown")
    expect(timeline.get_by_role("heading", name="Bring the pipeline to a smaller screen.", exact=True)).to_be_visible()
    filters.get_by_role("button", name=re.compile(r"^Next steps\b")).click()
    expect(timeline.get_by_role("article")).to_have_count(1)
    expect(timeline.get_by_role("status")).to_have_text("1 milestone shown")
    planned = timeline.get_by_role("article")
    expect(planned).to_contain_text("Planned")
    expect(planned.get_by_role("heading")).to_have_text("Test beyond the original collection.")
    details = planned.locator("details")
    details.locator("summary").click()
    expect(details).to_have_attribute("open", "")
    expect(details.locator("p")).to_be_visible()
    expect(details).to_contain_text("External validation has not yet been performed")
    expect(details).to_contain_text("laboratory hemoglobin measurements")
    details.locator("summary").click()
    expect(details).not_to_have_attribute("open", "")
    filters.get_by_role("button", name=re.compile(r"^All\b")).click()
    expect(timeline.get_by_role("article")).to_have_count(6)
    expect(timeline.get_by_role("status")).to_have_text("6 milestones shown")
    check_no_overflow(page)
    print("PASS activity filters, completion states, counts, and milestone disclosures")


def check_research(page, context):
    page.goto(f"{BASE_URL}/research", wait_until="networkidle")
    methodology = page.locator("#methodology")
    tab = lambda label: methodology.get_by_role("tab", name=re.compile(label))
    panel = methodology.get_by_role("tabpanel")
    tab("Clean dataset").click()
    expect(tab("Clean dataset")).to_have_attribute("aria-selected", "true")
    expect(panel).to_contain_text("Start with images we can trust.")
    expect(panel).to_contain_text("157")
    expect(panel).to_contain_text("69 labeled anemia")
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
    print("PASS research methodology, scientific facts, keyboard tabs, and technical disclosures")

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
    pooled = results.locator("#statistical-context")
    expect(pooled).to_contain_text("61 true positives")
    expect(pooled).to_contain_text("8 false negatives")
    expect(pooled).to_contain_text("α = 0.0167")
    expect(results).to_contain_text("p = 0.0004")
    expect(results).to_contain_text("p = 0.099")
    expect(results).to_contain_text("p = 0.71")
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
    check_no_overflow(page)
    print("PASS paper metrics, chart/table state, paired statistics, and CSV export")

    pdf = context.request.get(f"{BASE_URL}/research-paper.pdf")
    assert pdf.status == 200
    assert "application/pdf" in pdf.headers.get("content-type", "")
    assert pdf.body().startswith(b"%PDF-"), "Paper download is not a PDF"
    print("PASS paper PDF response and content")


def main():
    browser_errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/usr/bin/chromium"), args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce", accept_downloads=True)

        def capture_errors(page):
            page.on("pageerror", lambda error: browser_errors.append(f"Page error ({page.url}): {error}"))
            page.on("console", lambda message: browser_errors.append(f"Console error ({page.url}): {message.text}") if message.type == "error" else None)

        page = context.new_page()
        capture_errors(page)
        response = page.goto(BASE_URL, wait_until="networkidle")
        assert response and response.status == 200
        check_shell(page, "Home", "/")
        for label, path in ROUTES[1:] + [ROUTES[0]]:
            page.get_by_role("navigation", name="Main navigation", exact=True).get_by_role("link", name=label, exact=True).click()
            check_shell(page, label, path)
        print("PASS six desktop routes, one H1 per route, shared navbar/footer, active links, and widths")

        page.goto(f"{BASE_URL}/about", wait_until="networkidle")
        for name in ["Pranav Sachdeva", "Shashank Edupuganti", "Abhinav Karthik", "Andreea Sistrunk"]:
            expect(page.get_by_role("heading", name=name, exact=True)).to_be_visible()
        expect(page.locator("main")).to_contain_text("Technical Education and Workforce Development, Virginia Tech")
        expect(page.locator("main")).to_contain_text("No paired hemoglobin measurements were available")
        print("PASS verified author names, affiliation, and clinical evidence limits")

        check_projects(page)
        check_activities(page)
        check_research(page, context)

        mobile_context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, reduced_motion="reduce")
        mobile = mobile_context.new_page()
        capture_errors(mobile)
        mobile.goto(BASE_URL, wait_until="networkidle")
        check_shell(mobile, "Home", "/", desktop=False)
        current_label = "Home"
        for label, path in ROUTES[1:] + [ROUTES[0]]:
            mobile.get_by_role("button", name="Open navigation", exact=True).click()
            expect(mobile.get_by_role("button", name="Close navigation", exact=True)).to_have_attribute("aria-expanded", "true")
            mobile_nav = mobile.get_by_role("navigation", name="Mobile navigation", exact=True)
            expect(mobile_nav).to_be_visible()
            expect(mobile_nav.get_by_role("link")).to_have_count(6)
            expect(mobile_nav.get_by_role("link", name=current_label, exact=True)).to_have_attribute("aria-current", "page")
            mobile_nav.get_by_role("link", name=label, exact=True).click()
            check_shell(mobile, label, path, desktop=False)
            expect(mobile.get_by_role("button", name="Open navigation", exact=True)).to_have_attribute("aria-expanded", "false")
            expect(mobile.get_by_role("navigation", name="Mobile navigation", exact=True)).to_have_count(0)
            current_label = label
        mobile.get_by_role("button", name="Open navigation", exact=True).click()
        mobile.get_by_role("button", name="Close navigation", exact=True).press("Escape")
        expect(mobile.get_by_role("navigation", name="Mobile navigation", exact=True)).to_have_count(0)
        expect(mobile.get_by_role("button", name="Open navigation", exact=True)).to_be_focused()
        mobile.get_by_role("button", name="Open navigation", exact=True).click()
        mobile.get_by_role("button", name="Close navigation", exact=True).click()
        expect(mobile.get_by_role("navigation", name="Mobile navigation", exact=True)).to_have_count(0)
        print("PASS mobile routes, responsive widths, menu current state, Escape/focus, and open/close")

        assert not browser_errors, "\n".join(browser_errors)
        print("PASS no browser console errors or uncaught page errors")
        browser.close()


if __name__ == "__main__":
    main()
