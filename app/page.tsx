import {AsteroidExperience} from "@/components/AsteroidExperience"
import {PageAnimations} from "@/components/PageAnimations"
import {getTodayCloseAsteroids} from "@/lib/nasa"

const integerFormatter = new Intl.NumberFormat("en-US", {maximumFractionDigits: 0})
const decimalFormatter = new Intl.NumberFormat("en-US", {maximumFractionDigits: 1})

function toMillionKm(distanceKm: number): string {
  return decimalFormatter.format(distanceKm / 1_000_000)
}

export default async function Home() {
  const asteroids = await getTodayCloseAsteroids(20).catch(() => [])
  const closest = asteroids[0]
  const hazardousCount = asteroids.filter((asteroid) => asteroid.hazardous).length
  const fastest = asteroids.length > 0 ? Math.max(...asteroids.map((asteroid) => asteroid.relativeVelocityKph)) : 0

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <PageAnimations />
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <header className="ascii-panel js-anim-panel js-anim-header p-4">
          <pre className="overflow-x-auto text-[10px] leading-tight text-[var(--fg-dim)] sm:text-xs">
            {String.raw`                                                                                                   
  ▄▄▄▄                                        ▄▄    ▄▄▄▄▄▄▄             ▄▄                         
▄██▀▀██▄        ██                     ▀▀     ██   ███▀▀▀▀▀             ██                         
███  ███ ▄█▀▀▀ ▀██▀▀ ▄█▀█▄ ████▄ ▄███▄ ██  ▄████   ███▄▄    ██ ██ ████▄ ██ ▄███▄ ████▄ ▄█▀█▄ ████▄ 
███▀▀███ ▀███▄  ██   ██▄█▀ ██ ▀▀ ██ ██ ██  ██ ██   ███       ███  ██ ██ ██ ██ ██ ██ ▀▀ ██▄█▀ ██ ▀▀ 
███  ███ ▄▄▄█▀  ██   ▀█▄▄▄ ██    ▀███▀ ██▄ ▀████   ▀███████ ██ ██ ████▀ ██ ▀███▀ ██    ▀█▄▄▄ ██    
                                                                  ██                               
                                                                  ▀▀                               `}
          </pre>
          <p className="js-anim-status mt-3 min-h-[1rem] text-xs tracking-[0.14em] ascii-muted">[ NASA NEO TERMINAL // LIVE FEED // UTC TODAY ]</p>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <p>
              [ TRACKED: <span className="ascii-bright">{integerFormatter.format(asteroids.length)}</span> ]
            </p>
            <p>
              [ HAZARDOUS: <span className="ascii-danger">{integerFormatter.format(hazardousCount)}</span> ]
            </p>
            <p>
              [ CLOSEST: <span className="ascii-bright">{closest ? `${toMillionKm(closest.missDistanceKm)} M km` : "N/A"}</span> ]
            </p>
            <p>
              [ FASTEST: <span className="ascii-bright">{fastest ? `${integerFormatter.format(fastest)} km/h` : "N/A"}</span> ]
            </p>
          </div>
        </header>

        <section className="ascii-panel js-anim-panel js-anim-mission p-4 text-sm leading-relaxed">
          <p className="js-anim-mission-cmd ascii-muted">root@neo-scan:~$ cat mission_brief.txt</p>
          <p>
            Monitoring near-Earth objects by miss distance. Data source: NASA NeoWs. Status: <span className="ascii-bright">ONLINE</span>.
          </p>
          <p>
            Closest object today: <span className="ascii-bright">{closest?.name ?? "NO DATA"}</span>
          </p>
          <p>
            Relative velocity: <span className="ascii-bright">{closest ? `${integerFormatter.format(closest.relativeVelocityKph)} km/h` : "N/A"}</span>
          </p>
        </section>

        <div className="js-anim-scene">
          <AsteroidExperience asteroids={asteroids} />
        </div>

        <section className="ascii-panel js-anim-panel js-anim-targets p-4">
          <p className="js-anim-targets-cmd mb-3 text-sm ascii-muted">root@neo-scan:~$ ls -la /targets</p>
          <div className="space-y-3">
            {asteroids.slice(0, 10).map((asteroid, index) => (
              <article key={asteroid.id} className="js-anim-target border border-[var(--fg-dim)]/50 bg-black/20 p-3 text-xs sm:text-sm">
                <p className="js-anim-target-title">
                  [{String(index + 1).padStart(2, "0")}] <span className="ascii-bright">{asteroid.name}</span> :: {asteroid.hazardous ? <span className="ascii-danger">HAZARDOUS</span> : <span>CLEAR</span>}
                </p>
                <p className="js-anim-target-approach ascii-muted">
                  approach={asteroid.closeApproachDate} orbit={asteroid.orbitingBody}
                </p>
                <p className="js-anim-target-metrics">
                  miss={toMillionKm(asteroid.missDistanceKm)}M_km vel={integerFormatter.format(asteroid.relativeVelocityKph)}km_h dia={decimalFormatter.format(asteroid.diameterMinM)}-{decimalFormatter.format(asteroid.diameterMaxM)}m
                </p>
                <a href={asteroid.nasaJplUrl} target="_blank" rel="noreferrer" className="js-anim-target-link inline-block pt-1 text-[var(--fg-bright)] underline decoration-dotted underline-offset-2">
                  open://nasa-jpl-record
                </a>
              </article>
            ))}

            {asteroids.length === 0 && <article className="border border-[var(--warn)]/70 bg-black/30 p-3 text-sm ascii-warn">NO ASTEROID DATA. VERIFY NASA_API_KEY IN .env.local AND RESTART SERVER.</article>}
          </div>
        </section>
      </section>
    </main>
  )
}
