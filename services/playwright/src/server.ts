import Fastify from "fastify";
import { z } from "zod";
import { acquirePage, releasePage, getPoolStats, shutdown } from "./browser-pool.js";
import { extractFonts } from "./extract-fonts.js";

const PORT = parseInt(process.env.PORT || "3200", 10);
const SECRET = process.env.SERVICE_SECRET || "";

const app = Fastify({ logger: true });
const startTime = Date.now();

const ExtractRequest = z.object({
  url: z.string().url(),
  timeout: z.number().min(5000).max(30000).default(15000),
});

// Auth middleware
app.addHook("onRequest", async (request, reply) => {
  if (request.url === "/health") return;

  if (SECRET) {
    const auth = request.headers.authorization;
    if (auth !== `Bearer ${SECRET}`) {
      reply.code(401).send({ error: "Unauthorized" });
    }
  }
});

// POST /extract
app.post("/extract", async (request, reply) => {
  const parsed = ExtractRequest.safeParse(request.body);
  if (!parsed.success) {
    return reply.code(400).send({
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(", "),
    });
  }

  const { url, timeout } = parsed.data;
  let page;

  try {
    page = await acquirePage();

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout,
    });

    // Wait a bit for late JS-loaded fonts
    await page.waitForTimeout(1500);

    // Wait for fonts to finish loading
    await page.evaluate(() =>
      document.fonts.ready.then(() => {})
    );

    const fonts = await extractFonts(page, timeout);

    return { success: true, fonts, url };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    request.log.error({ err, url }, "Font extraction failed");

    return reply.code(500).send({
      success: false,
      error: message,
      url,
    });
  } finally {
    if (page) {
      await releasePage(page);
    }
  }
});

// GET /health
app.get("/health", async () => {
  const stats = getPoolStats();
  return {
    status: "ok",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    ...stats,
  };
});

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  app.log.info(`Received ${signal}, shutting down...`);
  await app.close();
  await shutdown();
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start
app.listen({ port: PORT, host: "0.0.0.0" }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
