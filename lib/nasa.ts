import "server-only"

export type AsteroidCloseApproach = {
  id: string
  name: string
  hazardous: boolean
  diameterMinM: number
  diameterMaxM: number
  relativeVelocityKph: number
  missDistanceKm: number
  closeApproachDate: string
  orbitingBody: string
  nasaJplUrl: string
}

type NasaCloseApproach = {
  close_approach_date: string
  orbiting_body: string
  relative_velocity: {kilometers_per_hour: string}
  miss_distance: {kilometers: string}
}

type NasaAsteroid = {
  id: string
  name: string
  is_potentially_hazardous_asteroid: boolean
  nasa_jpl_url: string
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number
      estimated_diameter_max: number
    }
  }
  close_approach_data: NasaCloseApproach[]
}

type NasaFeedResponse = {
  near_earth_objects: Record<string, NasaAsteroid[]>
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function toNumber(value: string): number {
  const numeric = Number.parseFloat(value)
  return Number.isFinite(numeric) ? numeric : 0
}

export async function getTodayCloseAsteroids(limit = 24): Promise<AsteroidCloseApproach[]> {
  const today = toIsoDate(new Date())
  const apiKey = process.env.NASA_API_KEY || "DEMO_KEY"

  const url = new URL("https://api.nasa.gov/neo/rest/v1/feed")
  url.searchParams.set("start_date", today)
  url.searchParams.set("end_date", today)
  url.searchParams.set("api_key", apiKey)

  const response = await fetch(url, {
    next: {revalidate: 60 * 30},
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`NASA NeoWs request failed (${response.status}): ${details}`)
  }

  const data = (await response.json()) as NasaFeedResponse
  const asteroids = data.near_earth_objects[today] ?? []

  return asteroids
    .map((asteroid) => {
      const approach = asteroid.close_approach_data[0]

      return {
        id: asteroid.id,
        name: asteroid.name,
        hazardous: asteroid.is_potentially_hazardous_asteroid,
        diameterMinM: asteroid.estimated_diameter.meters.estimated_diameter_min,
        diameterMaxM: asteroid.estimated_diameter.meters.estimated_diameter_max,
        relativeVelocityKph: toNumber(approach?.relative_velocity.kilometers_per_hour ?? "0"),
        missDistanceKm: toNumber(approach?.miss_distance.kilometers ?? "0"),
        closeApproachDate: approach?.close_approach_date ?? today,
        orbitingBody: approach?.orbiting_body ?? "Earth",
        nasaJplUrl: asteroid.nasa_jpl_url,
      }
    })
    .sort((a, b) => a.missDistanceKm - b.missDistanceKm)
    .slice(0, limit)
}
