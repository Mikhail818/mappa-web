import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1fa36a, #0b6b45)",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 24 24">
          <path
            d="M12 2.2c-4.2 0-7.6 3.3-7.6 7.5 0 5.4 6.5 11.3 7 11.8.3.3.9.3 1.2 0 .5-.5 7-6.4 7-11.8 0-4.2-3.4-7.5-7.6-7.5Z"
            fill="#fff"
          />
          <circle cx="12" cy="9.7" r="3.6" fill="#0e7a4e" />
          <path d="m12 7.9 1.7 1.25-.65 2h-2.1l-.65-2L12 7.9Z" fill="#fff" />
        </svg>
      </div>
    ),
    size,
  )
}
