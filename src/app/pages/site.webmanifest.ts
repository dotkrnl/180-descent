import icon192 from "../../assets/images/brand/icon-192.png";
import icon512 from "../../assets/images/brand/icon-512.png";

export function GET() {
  return new Response(JSON.stringify({
    name: "The 180-Day Descent",
    short_name: "180 Descent",
    description: "A 180-day map of knowledge from foundations to the research frontier.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f3ea",
    theme_color: "#f7f3ea",
    icons: [
      {
        src: assetPath(icon192),
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: assetPath(icon512),
        sizes: "512x512",
        type: "image/png"
      }
    ]
  }), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8"
    }
  });
}

function assetPath(asset: string | { src: string }): string {
  return typeof asset === "string" ? asset : asset.src;
}
