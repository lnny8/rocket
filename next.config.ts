import type {NextConfig} from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "mars.jpl.nasa.gov",
      },
      {
        protocol: "https",
        hostname: "mars.jpl.nasa.gov",
      },
      {
        protocol: "https",
        hostname: "*.nasa.gov",
      },
      {
        protocol: "https",
        hostname: "*.jpl.nasa.gov",
      },
    ],
  },
}

export default nextConfig
