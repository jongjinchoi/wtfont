import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const trackSchema = z.object({
  event: z.enum(["affiliate_click", "code_copy", "share"]),
  fontName: z.string(),
  marketplace: z.string().optional(),
  framework: z.string().optional(),
  url: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = trackSchema.parse(body);

    const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    if (plausibleDomain) {
      await fetch("https://plausible.io/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.event,
          url: `https://${plausibleDomain}${new URL(data.url, "https://wtfont.wtf").pathname}`,
          domain: plausibleDomain,
          props: {
            font: data.fontName,
            marketplace: data.marketplace,
            framework: data.framework,
          },
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
