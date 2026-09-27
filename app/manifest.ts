import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mappa — Football in Cyprus",
    short_name: "Mappa",
    description: "Book pitches, find players and join games across Cyprus.",
    start_url: "/home",
    display: "standalone",
    background_color: "#f5f6f8",
    theme_color: "#0e7a4e",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  }
}
