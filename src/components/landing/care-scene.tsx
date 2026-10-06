'use client'

import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

// A drawn scene. A care room with a guardian and child at the door, clouds
// drifting, the sun breathing and a supervised bus driving past. Code-drawn from theme tokens, so it
// follows light and dark mode. A concept picture: no names, numbers or live data.

const LOOP = Number.POSITIVE_INFINITY

export function CareScene() {
  const reduce = usePrefersReducedMotion()

  return (
    <svg
      viewBox="0 0 480 380"
      role="img"
      aria-label="Illustration: a care room with a guardian and child at the door while a supervised bus drives by."
      className="h-auto w-full max-w-md"
    >
      {/* Soft backdrop */}
      <circle cx="240" cy="190" r="172" className="fill-info-soft" />

      {/* Sun */}
      <motion.circle
        cx="398"
        cy="64"
        r="26"
        className="fill-warning"
        style={{ transformOrigin: '398px 64px' }}
        animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
        transition={{ duration: 4, ease: 'easeInOut', repeat: LOOP }}
      />

      {/* Clouds */}
      <motion.g
        animate={reduce ? undefined : { x: [0, 20, 0] }}
        transition={{ duration: 10, ease: 'easeInOut', repeat: LOOP }}
      >
        <circle cx="76" cy="76" r="16" className="fill-card" />
        <circle cx="98" cy="66" r="21" className="fill-card" />
        <circle cx="122" cy="77" r="15" className="fill-card" />
        <rect x="62" y="76" width="74" height="16" rx="8" className="fill-card" />
      </motion.g>
      <motion.g
        animate={reduce ? undefined : { x: [0, -16, 0] }}
        transition={{ duration: 12, ease: 'easeInOut', repeat: LOOP }}
      >
        <circle cx="322" cy="112" r="11" className="fill-card" />
        <circle cx="338" cy="105" r="15" className="fill-card" />
        <circle cx="356" cy="113" r="10" className="fill-card" />
        <rect x="312" y="113" width="54" height="12" rx="6" className="fill-card" />
      </motion.g>

      {/* Ground and road */}
      <rect x="20" y="288" width="440" height="76" rx="26" className="fill-muted" />
      <rect x="20" y="316" width="440" height="30" rx="15" className="fill-foreground/80" />
      <line
        x1="44"
        y1="331"
        x2="436"
        y2="331"
        strokeWidth="3"
        strokeDasharray="14 12"
        strokeLinecap="round"
        className="stroke-card"
      />

      {/* Care room */}
      <rect
        x="150"
        y="150"
        width="180"
        height="140"
        rx="12"
        strokeWidth="2"
        className="fill-card stroke-border"
      />
      <path
        d="M140 160 L240 84 L340 160 Z"
        strokeWidth="10"
        strokeLinejoin="round"
        className="fill-primary stroke-primary"
      />
      <circle cx="240" cy="130" r="15" className="fill-card" />
      <path
        d="M240 140 C226 130 228 117 236 117 C240 117 240 121 240 121 C240 121 240 117 244 117 C252 117 254 130 240 140 Z"
        className="fill-brand-care"
      />
      <rect x="218" y="230" width="44" height="60" rx="8" className="fill-secondary" />
      <motion.g
        animate={reduce ? undefined : { opacity: [1, 0.55, 1] }}
        transition={{ duration: 3.4, ease: 'easeInOut', repeat: LOOP }}
      >
        <rect
          x="166"
          y="188"
          width="40"
          height="36"
          rx="6"
          strokeWidth="2"
          className="fill-info-soft stroke-border"
        />
        <rect
          x="274"
          y="188"
          width="40"
          height="36"
          rx="6"
          strokeWidth="2"
          className="fill-info-soft stroke-border"
        />
      </motion.g>

      {/* Guardian and child at the door */}
      <motion.g
        animate={reduce ? undefined : { y: [0, -2.5, 0] }}
        transition={{ duration: 2.4, ease: 'easeInOut', repeat: LOOP }}
      >
        <rect x="108" y="278" width="9" height="14" rx="4" className="fill-foreground/70" />
        <rect x="120" y="278" width="9" height="14" rx="4" className="fill-foreground/70" />
        <rect x="106" y="244" width="26" height="42" rx="11" className="fill-primary" />
        <circle cx="119" cy="233" r="10" className="fill-warning" />
        <rect x="139" y="282" width="7" height="10" rx="3" className="fill-foreground/70" />
        <rect x="149" y="282" width="7" height="10" rx="3" className="fill-foreground/70" />
        <rect x="136" y="262" width="23" height="26" rx="9" className="fill-cta" />
        <circle cx="147.5" cy="253" r="8" className="fill-warning" />
        <path
          d="M130 258 Q136 262 139 268"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-primary"
        />
      </motion.g>

      {/* Supervised bus, driving left to right */}
      <motion.g
        initial={{ x: reduce ? 330 : -130 }}
        animate={reduce ? { x: 330 } : { x: 520 }}
        transition={
          reduce ? { duration: 0 } : { duration: 13, ease: 'linear', repeat: LOOP, repeatDelay: 1 }
        }
      >
        <rect x="0" y="288" width="104" height="42" rx="12" className="fill-cta" />
        <rect x="10" y="297" width="20" height="15" rx="4" className="fill-card" />
        <rect x="36" y="297" width="20" height="15" rx="4" className="fill-card" />
        <rect x="62" y="297" width="20" height="15" rx="4" className="fill-card" />
        <rect x="88" y="297" width="11" height="22" rx="4" className="fill-card" />
        <circle cx="26" cy="331" r="10" className="fill-foreground" />
        <circle cx="26" cy="331" r="4" className="fill-card" />
        <circle cx="80" cy="331" r="10" className="fill-foreground" />
        <circle cx="80" cy="331" r="4" className="fill-card" />
      </motion.g>
    </svg>
  )
}
