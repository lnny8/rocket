"use client"

import {useEffect} from "react"
import {gsap} from "gsap"

export function PageAnimations() {
  useEffect(() => {
    const context = gsap.context(() => {
      const allTweens: gsap.core.Tween[] = []

      const statusTween = gsap.to(".js-anim-status", {
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        color: "var(--fg-bright)",
        textShadow: "0 0 10px rgba(170, 255, 170, 0.45)",
      })
      allTweens.push(statusTween)

      const missionCmdTween = gsap.to(".js-anim-mission-cmd", {
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        color: "var(--fg-bright)",
        textShadow: "0 0 8px rgba(170, 255, 170, 0.32)",
      })
      allTweens.push(missionCmdTween)

      const targetsCmdTween = gsap.to(".js-anim-targets-cmd", {
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        color: "var(--fg-bright)",
        textShadow: "0 0 8px rgba(170, 255, 170, 0.32)",
      })
      allTweens.push(targetsCmdTween)

      gsap.utils.toArray<HTMLElement>(".js-anim-target-title").forEach((element, index) => {
        allTweens.push(
          gsap.to(element, {
            duration: 0.7,
            repeat: -1,
            yoyo: true,
            repeatDelay: 1 + index * 0.08,
            ease: "sine.inOut",
            textShadow: "0 0 7px rgba(170, 255, 170, 0.4)",
          }),
        )
      })

      gsap.utils.toArray<HTMLElement>(".js-anim-target-approach").forEach((element, index) => {
        allTweens.push(
          gsap.to(element, {
            delay: 0.15 + index * 0.05,
            duration: 0.9,
            repeat: -1,
            yoyo: true,
            repeatDelay: 1,
            ease: "sine.inOut",
            color: "var(--fg-bright)",
          }),
        )
      })

      gsap.utils.toArray<HTMLElement>(".js-anim-target-metrics").forEach((element, index) => {
        allTweens.push(
          gsap.to(element, {
            delay: 0.25 + index * 0.05,
            duration: 0.9,
            repeat: -1,
            yoyo: true,
            repeatDelay: 1,
            ease: "sine.inOut",
            color: "var(--fg-bright)",
          }),
        )
      })

      gsap.utils.toArray<HTMLElement>(".js-anim-target-link").forEach((element, index) => {
        allTweens.push(
          gsap.to(element, {
            delay: 0.15 + index * 0.03,
            duration: 0.9,
            repeat: -1,
            yoyo: true,
            repeatDelay: 0.6,
            ease: "sine.inOut",
            textShadow: "0 0 7px rgba(170, 255, 170, 0.45)",
          }),
        )
      })

      return () => {
        allTweens.forEach((tween) => tween.kill())
      }
    })

    return () => context.revert()
  }, [])

  return null
}
