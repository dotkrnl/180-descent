import icon192 from "../../assets/images/brand/icon-192.png?url";
import icon512 from "../../assets/images/brand/icon-512.png?url";
import { SITE_THEME_COLORS } from "@app/theme-colors";

export function GET() {
  return new Response(JSON.stringify({
    name: "The 180-Day Descent",
    short_name: "180 Descent",
    description: "A 180-day map of knowledge from foundations to the research frontier.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: SITE_THEME_COLORS.light,
    theme_color: SITE_THEME_COLORS.light,
    color_scheme_dark: {
      background_color: SITE_THEME_COLORS.dark,
      theme_color: SITE_THEME_COLORS.dark
    },
    icons: [
      {
        src: icon192,
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: icon512,
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
