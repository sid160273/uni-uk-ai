import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "Trending Now";
  const category = searchParams.get("category") || "News";

  // Truncate long titles — keep at most 90 chars
  const displayTitle =
    title.length > 90 ? title.slice(0, 87) + "..." : title;

  // Pick a font size based on title length so long titles don't overflow
  const titleFontSize =
    displayTitle.length > 70
      ? 40
      : displayTitle.length > 50
        ? 48
        : 56;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid texture */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            display: "flex",
          }}
        />

        {/* Red accent line at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: "#dc2626",
            display: "flex",
          }}
        />

        {/* Top row: TRENDING NOW label + branding */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#dc2626",
                display: "flex",
              }}
            />
            <span
              style={{
                color: "#dc2626",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
              }}
            >
              Trending Now
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontSize: "22px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            <span>uni-uk</span>
            <span style={{ color: "#dc2626" }}>.ai</span>
          </div>
        </div>

        {/* Middle: Title + Category */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: "24px",
          }}
        >
          {/* Category badge */}
          <div style={{ display: "flex" }}>
            <div
              style={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                padding: "6px 16px",
                display: "flex",
              }}
            >
              {category}
            </div>
          </div>

          {/* Title */}
          <h1
            style={{
              color: "#ffffff",
              fontSize: `${titleFontSize}px`,
              fontWeight: 900,
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: "-0.02em",
              maxWidth: "950px",
            }}
          >
            {displayTitle}
          </h1>
        </div>

        {/* Bottom row: divider + domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "20px",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "14px",
              letterSpacing: "0.08em",
            }}
          >
            uni-uk.ai/blog
          </span>

          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "14px",
            }}
          >
            AI-powered trending analysis
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
