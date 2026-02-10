import { cache } from "react";
import { Redis } from "@upstash/redis";
import type { AnalysisResult } from "@/types/font";
import { extractDomainAndPath } from "./url-utils";

const hasRedis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const CACHE_TTL = 60 * 60 * 24 * 14; // 14 days
const CACHE_PREFIX = "wtfont:result:";
const SLUG_PREFIX = "wtfont:slug:";

function getCacheKey(url: string): string {
  const { domain, path } = extractDomainAndPath(url);
  return `${CACHE_PREFIX}${domain}${path}`;
}

export async function getCachedResult(
  url: string
): Promise<AnalysisResult | null> {
  if (!redis) return null;
  try {
    const key = getCacheKey(url);
    return await redis.get<AnalysisResult>(key);
  } catch (error) {
    console.warn("Cache read failed:", error);
    return null;
  }
}

export async function setCachedResult(
  url: string,
  result: AnalysisResult
): Promise<void> {
  if (!redis) return;
  try {
    const key = getCacheKey(url);
    await Promise.all([
      redis.set(key, result, { ex: CACHE_TTL }),
      redis.set(`${SLUG_PREFIX}${result.slug}`, key, { ex: CACHE_TTL }),
    ]);
  } catch (error) {
    console.warn("Cache write failed:", error);
  }
}

export const getCachedResultBySlug = cache(
  async (slug: string): Promise<AnalysisResult | null> => {
    if (!redis) return null;
    try {
      const cacheKey = await redis.get<string>(`${SLUG_PREFIX}${slug}`);
      if (!cacheKey) return null;
      return await redis.get<AnalysisResult>(cacheKey);
    } catch {
      return null;
    }
  }
);

export async function getAllCachedSlugs(): Promise<string[]> {
  if (!redis) return [];
  try {
    const slugs: string[] = [];
    let cursor = 0;
    do {
      const result = await redis.scan(cursor, {
        match: `${SLUG_PREFIX}*`,
        count: 100,
      });
      cursor = Number(result[0]);
      for (const key of result[1]) {
        slugs.push(key.replace(SLUG_PREFIX, ""));
      }
    } while (cursor !== 0);
    return slugs;
  } catch {
    return [];
  }
}
