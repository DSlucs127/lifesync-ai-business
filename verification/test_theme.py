from playwright.sync_api import sync_playwright

def test_dark_mode_initialization():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create a context with dark mode preference
        context = browser.new_context(color_scheme='dark')
        page = context.new_page()

        # Navigate to the static server
        page.goto("http://localhost:8000/index.html")

        # Wait a bit for scripts to run
        page.wait_for_timeout(2000)

        # Check if 'dark' class is present on html
        html_class = page.eval_on_selector("html", "el => el.className")
        print(f"HTML Class: {html_class}")

        if "dark" in html_class:
            print("SUCCESS: 'dark' class found on html tag.")
        else:
            print("FAILURE: 'dark' class NOT found on html tag.")

        # Check body background color
        # dark:bg-slate-900 is #0f172a -> rgb(15, 23, 42)
        bg_color = page.eval_on_selector("body", "el => window.getComputedStyle(el).backgroundColor")
        print(f"Body Background Color: {bg_color}")

        page.screenshot(path="verification/dark_mode.png")
        browser.close()

if __name__ == "__main__":
    test_dark_mode_initialization()
