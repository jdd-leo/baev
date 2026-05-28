import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          color: "#ededed",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, opacity: 0.6 }}>baev.app</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 32, opacity: 0.75, maxWidth: 900 }}>{SITE_DESCRIPTION}</div>
        </div>
      </div>
    ),
    size,
  );
}
