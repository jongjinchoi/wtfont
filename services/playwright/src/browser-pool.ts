import { chromium, type Browser, type Page } from "playwright-core";

const MAX_PAGES = 3;

let browser: Browser | null = null;
let launching = false;
let launchQueue: Array<{
  resolve: (b: Browser) => void;
  reject: (e: Error) => void;
}> = [];
let activePages = 0;

async function launchBrowser(): Promise<Browser> {
  if (browser?.isConnected()) return browser;

  if (launching) {
    return new Promise((resolve, reject) => {
      launchQueue.push({ resolve, reject });
    });
  }

  launching = true;
  try {
    browser = await chromium.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-extensions",
      ],
    });

    browser.on("disconnected", () => {
      browser = null;
    });

    for (const waiter of launchQueue) {
      waiter.resolve(browser);
    }
    launchQueue = [];

    return browser;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    for (const waiter of launchQueue) {
      waiter.reject(error);
    }
    launchQueue = [];
    throw error;
  } finally {
    launching = false;
  }
}

export async function acquirePage(): Promise<Page> {
  if (activePages >= MAX_PAGES) {
    throw new Error("Max concurrent pages reached");
  }

  const b = await launchBrowser();
  const context = await b.newContext({
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();
  activePages++;

  return page;
}

export async function releasePage(page: Page): Promise<void> {
  try {
    const context = page.context();
    await page.close();
    await context.close();
  } catch {
    // page already closed
  } finally {
    activePages = Math.max(0, activePages - 1);
  }
}

export function getPoolStats() {
  return {
    browserConnected: browser?.isConnected() ?? false,
    activePages,
    maxPages: MAX_PAGES,
  };
}

export async function shutdown(): Promise<void> {
  if (browser) {
    try {
      await browser.close();
    } catch {
      // already closed
    }
    browser = null;
  }
  activePages = 0;
  launchQueue = [];
}
