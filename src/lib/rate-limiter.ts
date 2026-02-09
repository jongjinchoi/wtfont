import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

const hasRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const ratelimit = hasRedis
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.fixedWindow(10, "1 d"),
      prefix: "wtfont:ratelimit:",
      analytics: true,
    })
  : null;

export async function checkRateLimit(): Promise<{
  allowed: boolean;
  remaining: number;
  reset: number;
}> {
  if (!ratelimit) {
    return { allowed: true, remaining: 999, reset: Date.now() + 86400000 };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "anonymous";

  const { success, remaining, reset } = await ratelimit.limit(ip);

  return { allowed: success, remaining, reset };
}
