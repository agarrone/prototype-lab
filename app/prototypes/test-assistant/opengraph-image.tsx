import { ImageResponse } from "next/og";

export const alt = "Assistant d’exploration — Prototype data.gouv.fr";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#ffffff",
          color: "#161616",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 80px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            color: "#000091",
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          data.gouv.fr
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div
            style={{
              color: "#666666",
              display: "flex",
              fontSize: 25,
              fontWeight: 600,
              marginBottom: 22,
            }}
          >
            PROTOTYPE
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              letterSpacing: "-2px",
              lineHeight: 1.08,
            }}
          >
            Assistant d’exploration
          </div>
          <div
            style={{
              color: "#3a3a3a",
              display: "flex",
              fontSize: 32,
              lineHeight: 1.35,
              marginTop: 24,
            }}
          >
            Posez vos questions directement aux données.
          </div>
        </div>

        <div
          style={{
            background: "#000091",
            display: "flex",
            height: 12,
            width: 150,
          }}
        />
      </div>
    ),
    size,
  );
}
