import { ImageResponse } from "next/og";
import { getCachedResultBySlug } from "@/lib/cache";

export const runtime = "edge";
export const alt = "WTFont.wtf — Font analysis results";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getCachedResultBySlug(slug);

  const domain = result?.domain ?? slug.replace(/-/g, ".");
  const fonts = result?.matchedFonts ?? [];
  const fontNames = fonts
    .map((f) => f.originalName)
    .slice(0, 4)
    .join(", ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#09090b",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div style={{ display: "flex", fontSize: "48px", fontWeight: 700 }}>
            <span style={{ color: "#f97316" }}>WTFont</span>
            <span style={{ color: "#71717a" }}>.wtf</span>
          </div>

          <div
            style={{
              fontSize: "32px",
              color: "#e4e4e7",
              textAlign: "center",
            }}
          >
            Fonts on {domain}
          </div>

          {fontNames && (
            <div
              style={{
                fontSize: "20px",
                color: "#71717a",
                textAlign: "center",
                maxWidth: "800px",
              }}
            >
              {fonts.length} font{fonts.length !== 1 ? "s" : ""} detected:{" "}
              {fontNames}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {fonts.slice(0, 4).map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "12px",
                  border: "1px solid #27272a",
                  backgroundColor: "#18181b",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: f.isFree ? "#10b981" : "#f59e0b",
                  }}
                />
                <span style={{ fontSize: "16px", color: "#a1a1aa" }}>
                  {f.originalName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
