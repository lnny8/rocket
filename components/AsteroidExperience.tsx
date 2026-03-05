"use client"

import {useEffect, useMemo, useRef} from "react"
import {Canvas, useFrame} from "@react-three/fiber"
import {AsciiRenderer, OrbitControls, Stars} from "@react-three/drei"
import {gsap} from "gsap"
import {TextPlugin} from "gsap/TextPlugin"
import type {Group, Mesh} from "three"
import type {AsteroidCloseApproach} from "@/lib/nasa"

gsap.registerPlugin(TextPlugin)

type AsteroidExperienceProps = {
  asteroids: AsteroidCloseApproach[]
}

type AsteroidVisual = {
  id: string
  size: number
  distance: number
  speed: number
  angle: number
  phase: number
  delay: number
  hazardous: boolean
}

type FlybyVisual = {
  id: string
  size: number
  speed: number
  phase: number
  delay: number
  startX: number
  startY: number
  startZ: number
  endX: number
  endY: number
  endZ: number
  offsetX: number
  offsetY: number
  offsetZ: number
  wobbleX: number
  wobbleY: number
  wobbleZ: number
  spinX: number
  spinY: number
  hazardous: boolean
}

function hash(input: string): number {
  let value = 0

  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) >>> 0
  }

  return value
}

function Asteroid({visual}: {visual: AsteroidVisual}) {
  const meshRef = useRef<Mesh>(null)

  useFrame(({clock}) => {
    if (!meshRef.current) {
      return
    }

    const elapsed = clock.getElapsedTime()
    const localElapsed = elapsed - visual.delay

    if (localElapsed < 0) {
      meshRef.current.visible = false
      return
    }

    meshRef.current.visible = true
    meshRef.current.position.x = Math.cos(localElapsed * visual.speed + visual.angle) * visual.distance
    meshRef.current.position.z = Math.sin(localElapsed * visual.speed + visual.angle) * visual.distance
    meshRef.current.position.y = Math.sin(localElapsed * (visual.speed * 1.4) + visual.phase) * 0.32
    meshRef.current.rotation.x += 0.01
    meshRef.current.rotation.y += 0.008
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[visual.size, 1]} />
      <meshStandardMaterial color={visual.hazardous ? "#c9ffd1" : "#8fff9a"} emissive={visual.hazardous ? "#b0ffba" : "#6fd97b"} emissiveIntensity={0.18} roughness={0.92} metalness={0.05} />
    </mesh>
  )
}

function FlybyAsteroid({visual}: {visual: FlybyVisual}) {
  const meshRef = useRef<Mesh>(null)

  useFrame(({clock}) => {
    if (!meshRef.current) {
      return
    }

    const elapsed = clock.getElapsedTime()
    const localElapsed = elapsed - visual.delay

    if (localElapsed < 0) {
      meshRef.current.visible = false
      return
    }

    meshRef.current.visible = true
    const t = (localElapsed * visual.speed + visual.phase) % 1
    const invT = 1 - t
    const wobble = Math.sin(localElapsed * 2.2 + visual.phase * Math.PI * 2) * 0.16

    meshRef.current.position.x = visual.startX * invT + visual.endX * t + visual.offsetX + visual.wobbleX * wobble
    meshRef.current.position.y = visual.startY * invT + visual.endY * t + visual.offsetY + visual.wobbleY * wobble
    meshRef.current.position.z = visual.startZ * invT + visual.endZ * t + visual.offsetZ + visual.wobbleZ * wobble
    meshRef.current.rotation.x += visual.spinX
    meshRef.current.rotation.y += visual.spinY
  })

  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[visual.size, 0]} />
      <meshStandardMaterial color={visual.hazardous ? "#c8ffd0" : "#9dffab"} emissive={visual.hazardous ? "#a8ffb5" : "#68d97a"} emissiveIntensity={0.14} roughness={0.9} metalness={0.03} />
    </mesh>
  )
}

function Scene({asteroids}: AsteroidExperienceProps) {
  const groupRef = useRef<Group>(null)
  const earthRef = useRef<Mesh>(null)

  const visuals = useMemo<AsteroidVisual[]>(() => {
    const maxDistance = Math.max(...asteroids.map((asteroid) => asteroid.missDistanceKm), 1)

    return asteroids.slice(0, 40).map((asteroid, index) => {
      const seed = hash(asteroid.id)
      const normalizedDistance = asteroid.missDistanceKm / maxDistance
      const size = Math.min(Math.max((asteroid.diameterMinM + asteroid.diameterMaxM) / 1300, 0.06), 0.36)

      return {
        id: asteroid.id,
        size,
        distance: 2 + normalizedDistance * 5.2 + index * 0.025,
        speed: 0.12 + (seed % 90) / 650,
        angle: ((seed % 360) * Math.PI) / 180,
        phase: (((seed >> 3) % 360) * Math.PI) / 180,
        delay: index * 0.08,
        hazardous: asteroid.hazardous,
      }
    })
  }, [asteroids])

  const flybyVisuals = useMemo<FlybyVisual[]>(() => {
    return Array.from({length: 10}, (_, index) => {
      const seed = hash(`flyby-${index}`)
      const pointCount = 10
      const phi = Math.acos(1 - (2 * (index + 0.5)) / pointCount)
      const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5)
      const dirX = Math.sin(phi) * Math.cos(theta)
      const dirY = Math.cos(phi)
      const dirZ = Math.sin(phi) * Math.sin(theta)
      const span = 11 + (seed % 5)

      const refX = Math.abs(dirY) > 0.9 ? 1 : 0
      const refY = Math.abs(dirY) > 0.9 ? 0 : 1
      const refZ = 0

      let sideX = dirY * refZ - dirZ * refY
      let sideY = dirZ * refX - dirX * refZ
      let sideZ = dirX * refY - dirY * refX
      const sideLen = Math.hypot(sideX, sideY, sideZ) || 1
      sideX /= sideLen
      sideY /= sideLen
      sideZ /= sideLen

      let upX = dirY * sideZ - dirZ * sideY
      let upY = dirZ * sideX - dirX * sideZ
      let upZ = dirX * sideY - dirY * sideX
      const upLen = Math.hypot(upX, upY, upZ) || 1
      upX /= upLen
      upY /= upLen
      upZ /= upLen

      const sideOffset = ((seed % 200) / 200 - 0.5) * 1.8
      const upOffset = (((seed >> 3) % 200) / 200 - 0.5) * 1.2
      const wobbleBlend = ((seed >> 5) % 200) / 200

      return {
        id: `flyby-${index}`,
        size: 0.11 + (seed % 10) * 0.022,
        speed: 0.2 + (seed % 100) / 420,
        phase: (seed % 1000) / 1000,
        delay: index * 0.45,
        startX: -dirX * span,
        startY: -dirY * span,
        startZ: -dirZ * span,
        endX: dirX * span,
        endY: dirY * span,
        endZ: dirZ * span,
        offsetX: sideX * sideOffset + upX * upOffset,
        offsetY: sideY * sideOffset + upY * upOffset,
        offsetZ: sideZ * sideOffset + upZ * upOffset,
        wobbleX: sideX * (1 - wobbleBlend) + upX * wobbleBlend,
        wobbleY: sideY * (1 - wobbleBlend) + upY * wobbleBlend,
        wobbleZ: sideZ * (1 - wobbleBlend) + upZ * wobbleBlend,
        spinX: 0.01 + ((seed >> 2) % 8) * 0.002,
        spinY: 0.009 + ((seed >> 4) % 8) * 0.002,
        hazardous: seed % 3 === 0,
      }
    })
  }, [])

  useFrame(({clock}) => {
    if (!groupRef.current) {
      return
    }

    const elapsed = clock.getElapsedTime()
    groupRef.current.rotation.y = elapsed * 0.05

    if (earthRef.current) {
      earthRef.current.rotation.y = elapsed * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshStandardMaterial color="#90ff9c" roughness={0.78} metalness={0.04} emissive="#3ea84d" emissiveIntensity={0.2} />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.28, 32, 32]} />
        <meshStandardMaterial color="#ccffd1" transparent opacity={0.13} depthWrite={false} />
      </mesh>

      {visuals.map((visual) => (
        <Asteroid key={visual.id} visual={visual} />
      ))}

      {/* {flybyVisuals.map((visual) => (
        <FlybyAsteroid key={visual.id} visual={visual} />
      ))} */}
    </group>
  )
}

export function AsteroidExperience({asteroids}: AsteroidExperienceProps) {
  const commandRef = useRef<HTMLParagraphElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const pulseRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!commandRef.current || !statusRef.current || !pulseRef.current) {
      return
    }

    const timeline = gsap.timeline({repeat: -1, defaults: {ease: "none"}})

    timeline
      .to(commandRef.current, {
        duration: 1.4,
        text: "root@neo-scan:~$ ./neo_view --render=three --post=ascii --mode=live",
      })
      .to(commandRef.current, {
        duration: 0.8,
        text: "root@neo-scan:~$ ./neo_view --render=three --post=ascii --mode=live --lock=earth",
      })
      .to(commandRef.current, {
        duration: 1.1,
        text: "root@neo-scan:~$ ./neo_view --render=three --post=ascii",
      })

    const statusTween = gsap.to(statusRef.current, {
      duration: 2.1,
      repeat: -1,
      yoyo: true,
      text: "[ LINK: NASA NEO FEED :: SYNC OK :: ASCII PIPE ACTIVE ]",
      ease: "sine.inOut",
    })

    const pulseTween = gsap.to(pulseRef.current, {
      duration: 0.45,
      repeat: -1,
      yoyo: true,
      opacity: 0.2,
      ease: "power1.inOut",
    })

    return () => {
      timeline.kill()
      statusTween.kill()
      pulseTween.kill()
    }
  }, [])

  return (
    <section className="ascii-panel p-4">
      <p ref={commandRef} className="mb-1 min-h-[1.25rem] text-sm ascii-muted">
        root@neo-scan:~$ ./neo_view --render=three --post=ascii
      </p>
      <p ref={statusRef} className="mb-2 min-h-[1.25rem] text-xs tracking-[0.08em] ascii-bright">
        [ LINK: NASA NEO FEED :: ASCII PIPE ACTIVE ]
      </p>
      <div className="relative h-[55vh] min-h-[360px] w-full overflow-hidden">
        <Canvas style={{backgroundColor: "transparent"}} camera={{position: [0, 0.5, 9], fov: 45}}>
          <color attach="background" args={["#020402"]} />
          <fog attach="fog" args={["#020402", 8, 25]} />

          <ambientLight intensity={0.18} />
          <directionalLight position={[8, 5, 4]} intensity={0.7} color="#b5ffbe" />

          <Stars radius={120} depth={55} count={2400} factor={2.5} saturation={0} fade speed={0.24} />

          <Scene asteroids={asteroids} />

          <OrbitControls enablePan={false} minDistance={5.8} maxDistance={12} autoRotate autoRotateSpeed={0.16} />

          <AsciiRenderer fgColor="#b7ffbf" characters="@MBHENR#KWXDFPQASUZbdehx*8Gm&04LOV Ykpq5Tagns69owz$CIu23Jcfry% 1v7l+it[] {}?j|()=~!-/<>\^_';,:`.            " resolution={0.18} invert={false} />
        </Canvas>

        <p ref={pulseRef} className="absolute pointer-events-none right-3 top-3 text-[10px] tracking-[0.2em] ascii-muted">
          [ SCAN ]
        </p>
      </div>
    </section>
  )
}
