import { ImageResponse } from "next/og";
import { getArgumentBySlug } from "@/server/db/queries/arguments";
import { SITE_NAME } from "@/lib/seo";

// Node runtime: getArgumentBySlug usa PrismaClient.
export const runtime = "nodejs";
export const alt = "Argumento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ArgumentOG({
  params,
}: {
  params: Promise<{ topic: string; slug: string }>;
}) {
  const { slug } = await params;
  const arg = await getArgumentBySlug(slug);
  if (!arg) {
    return new ImageResponse(
      <div style={fallbackStyle}>Argumento não encontrado</div>,
      size,
    );
  }

  const title = truncate(arg.title, 110);
  const excerpt = truncate(stripMd(arg.content), 220);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          color: "#ededed",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, opacity: 0.7 }}>
          <div style={{ display: "flex" }}>{SITE_NAME}</div>
          <div style={{ display: "flex" }}>/arg/{arg.topic.slug}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: "auto" }}>
          <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 28, lineHeight: 1.35, opacity: 0.8 }}>{excerpt}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #ffffff20",
            fontSize: 24,
          }}
        >
          <div style={{ display: "flex" }}>@{arg.author.username}</div>
          <div style={{ display: "flex", gap: 18, opacity: 0.85 }}>
            <span>▲ {arg.upvotes}</span>
            <span>▼ {arg.downvotes}</span>
            <span>{arg._count.replies} respostas</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

const fallbackStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0a0a0a",
  color: "#ededed",
  fontFamily: "system-ui",
  fontSize: 48,
} as const;

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}

function stripMd(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_~>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
