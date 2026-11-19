// Space backdrop: a Milky Way band, twinkling stars, shooting stars and a small
// solar system. A pure string builder. Stars come from a seeded PRNG, so the sky
// is the same on every draw. Only opacity and transform ever animate, all by CSS,
// and prefers-reduced-motion freezes the lot.

const W = 1600
const H = 1000
const SEED = 20261119

// The solar system sits upper right, clear of the band and of the text column.
const SUN = { x: 1290, y: 290, tilt: -14 }
const SQUASH = 0.4 // orbits are circles squashed to ellipses: a tilted view

const PLANETS = [
  { r: 36, p: 2, c: '#b8b2a8', d: 18, a: 40 },
  { r: 54, p: 3, c: '#e8c98a', d: 26, a: 200 },
  { r: 76, p: 3.4, c: '#5aa8ff', d: 36, a: 310 },
  { r: 98, p: 2.6, c: '#e0714a', d: 48, a: 120 },
  { r: 150, p: 7, c: '#d9b48a', d: 80, a: 250 },
  { r: 182, p: 5, c: '#e6d3a0', d: 110, a: 20, ring: true },
  { r: 208, p: 4, c: '#8fe3ee', d: 150, a: 160 },
  { r: 230, p: 4, c: '#5b7cff', d: 190, a: 280 },
]

const TINTS = ['#ffffff', '#dbe6ff', '#bcd0ff', '#ffe9cf', '#ffd2b0']
const TWINKLE = ['a', 'b', 'c', 'd']

const stop = (at, color, opacity) => `<stop offset="${at}" stop-color="${color}" stop-opacity="${opacity}"/>`
const radial = (id, stops, extra = '') => `<radialGradient id="${id}"${extra}>${stops.map(s => stop(...s)).join('')}</radialGradient>`

export function buildScene() {
  let seed = SEED
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const between = (a, b) => a + (b - a) * rand()
  const pick = list => list[Math.floor(rand() * list.length)]
  const bell = () => rand() + rand() + rand() - 1.5 // centred, about ±1.5
  const n1 = v => Math.round(v * 10) / 10

  const dot = (x, y, r, o, isTwinkling) =>
    `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="${pick(TINTS)}" opacity="${o.toFixed(2)}"` +
    `${isTwinkling ? ` class="t ${pick(TWINKLE)}"` : ''}/>`

  const field = (count, rMin, rMax, oMin, oMax, share) =>
    Array.from({ length: count }, () =>
      dot(between(-30, W + 30), between(-30, H + 30), between(rMin, rMax), between(oMin, oMax), rand() < share),
    ).join('')

  // Stars of the band: thick at its spine, in the band's own tilted frame.
  const bandDust = Array.from({ length: 420 }, () =>
    dot(between(-350, W + 350), 500 + bell() * 110, between(0.4, 1), between(0.2, 0.65), false),
  ).join('')

  const bright = [
    [180, 120], [420, 300], [90, 520], [260, 830], [640, 690],
    [760, 120], [980, 880], [1480, 640], [1530, 520],
  ]
    .map(([x, y], i) => {
      const r = n1(between(1.6, 2.3))
      const halo = n1(between(9, 14))
      const arm = n1(between(13, 22))
      const sparkle = i % 2 === 0
        ? `<path d="M${x - arm} ${y}H${x + arm}M${x} ${y - arm}V${y + arm}" stroke="#fff" stroke-width=".8" stroke-linecap="round" opacity=".7"/>`
        : ''

      return (
        `<g class="t ${pick(TWINKLE)}"><circle cx="${x}" cy="${y}" r="${halo}" fill="url(#halo)"/>` +
        `${sparkle}<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/></g>`
      )
    })
    .join('')

  // Each streak waits most of its cycle, then crosses 420 px down and left in a blink.
  const shooting = [
    [1180, 60, 17, 3], [700, 40, 23, 11], [1500, 430, 29, 19],
  ]
    .map(
      ([x, y, d, s]) =>
        `<g transform="translate(${x} ${y})"><g class="sh" style="--d:${d}s;--s:${s}s">` +
        `<line x2="-130" y2="78" stroke="url(#trail)" stroke-width="1.6" stroke-linecap="round"/></g></g>`,
    )
    .join('')

  // A planet rides its orbit by a rotating group; a second group turns the other
  // way so the body stays upright and the squash keeps it round.
  const planet = ({ r, p, c, d, a, ring }) =>
    `<g transform="rotate(${a})"><g class="spin" style="--d:${d}s"><g transform="translate(${r} 0)">` +
    `<g transform="rotate(${-a})"><g class="unspin" style="--d:${d}s">` +
    `<ellipse rx="${p}" ry="${n1(p / SQUASH)}" fill="${c}"/>` +
    (ring
      ? `<ellipse rx="${p * 2}" ry="${n1((p * 2 * 0.3) / SQUASH)}" fill="none" stroke="${c}" stroke-opacity=".75" stroke-width="1.4" vector-effect="non-scaling-stroke"/>`
      : '') +
    `</g></g></g></g></g>`

  const orbit = ({ r }) =>
    `<circle r="${r}" fill="none" stroke="#9db0ff" stroke-opacity=".22" vector-effect="non-scaling-stroke"/>`

  const sky = [
    `<rect width="${W}" height="${H}" fill="url(#bg)"/>`,
    // Colour that sits off the band.
    `<ellipse cx="260" cy="190" rx="260" ry="150" fill="url(#violet)" opacity=".5"/>`,
    `<ellipse cx="1380" cy="860" rx="300" ry="160" fill="url(#blue)" opacity=".5"/>`,
    // The Milky Way: a band tilted 24°, a warm bulge, nebulae, then dust lanes over it.
    `<g transform="rotate(24 800 500)">`,
    `<ellipse cx="800" cy="500" rx="980" ry="190" fill="url(#band)"/>`,
    `<ellipse cx="520" cy="500" rx="320" ry="100" fill="url(#bulge)"/>`,
    `<ellipse cx="1120" cy="480" rx="320" ry="100" fill="url(#violet)"/>`,
    `<ellipse cx="300" cy="525" rx="300" ry="90" fill="url(#cyan)"/>`,
    bandDust,
    `<ellipse cx="800" cy="502" rx="780" ry="16" fill="url(#dust)"/>`,
    `<ellipse cx="480" cy="516" rx="360" ry="11" fill="url(#dust)"/>`,
    `</g>`,
    `<g class="far">${field(150, 0.5, 0.9, 0.35, 0.7, 0.25)}</g>`,
    `<g class="near">${field(70, 0.9, 1.7, 0.5, 0.9, 0.6)}</g>`,
    bright,
    shooting,
    // The solar system.
    `<g transform="rotate(${SUN.tilt} ${SUN.x} ${SUN.y})">`,
    `<g transform="translate(${SUN.x} ${SUN.y}) scale(1 ${SQUASH})">`,
    PLANETS.map(orbit).join(''),
    `<circle class="spin" style="--d:420s" r="124" fill="none" stroke="#aab8ff" stroke-opacity=".28" stroke-width="4" stroke-dasharray="0.8 5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`,
    PLANETS.map(planet).join(''),
    `</g></g>`,
    `<circle class="glow" cx="${SUN.x}" cy="${SUN.y}" r="46" fill="url(#sunhalo)"/>`,
    `<circle cx="${SUN.x}" cy="${SUN.y}" r="11" fill="url(#sun)"/>`,
  ].join('')

  const defs =
    radial('bg', [[0, '#0b1030', 1], [0.6, '#060818', 1], [1, '#02030a', 1]], ' cx="50%" cy="45%" r="75%"') +
    radial('band', [[0, '#b0a8ff', 0.34], [0.35, '#7882ff', 0.16], [1, '#3c46c8', 0]]) +
    radial('bulge', [[0, '#ffd9b0', 0.34], [0.5, '#ffb98a', 0.12], [1, '#ff9a70', 0]]) +
    radial('violet', [[0, '#b05cff', 0.18], [1, '#b05cff', 0]]) +
    radial('cyan', [[0, '#3cd0ff', 0.13], [1, '#3cd0ff', 0]]) +
    radial('blue', [[0, '#2b8cff', 0.18], [1, '#2b8cff', 0]]) +
    radial('dust', [[0, '#04050f', 0.55], [1, '#04050f', 0]]) +
    radial('halo', [[0, '#cfe0ff', 0.5], [1, '#cfe0ff', 0]]) +
    radial('sunhalo', [[0, '#ffd27a', 0.55], [1, '#ffd27a', 0]]) +
    radial('sun', [[0, '#fff3c4', 1], [1, '#ffb347', 1]]) +
    `<linearGradient id="trail" x1="1" y1="0" x2="0" y2="1">${stop(0, '#fff', 1)}${stop(1, '#fff', 0)}</linearGradient>`

  const css =
    `.t{animation:tw 4s ease-in-out infinite}` +
    `.a{animation-duration:3.1s}.b{animation-duration:4.3s;animation-delay:-1.2s}` +
    `.c{animation-duration:5.7s;animation-delay:-3.1s}.d{animation-duration:7.3s;animation-delay:-2s}` +
    `@keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}` +
    `.far{animation:dr 220s ease-in-out infinite alternate}` +
    `.near{animation:dr 150s ease-in-out infinite alternate-reverse}` +
    `@keyframes dr{to{transform:translate(-16px,-9px)}}` +
    `.sh{opacity:0;animation:shoot var(--d) linear var(--s) infinite}` +
    `@keyframes shoot{0%{opacity:0;transform:translate(0,0)}1.5%{opacity:1}6%,100%{opacity:0;transform:translate(-420px,252px)}}` +
    `.spin,.unspin{transform-origin:0 0}` +
    `.spin{animation:spin var(--d) linear infinite}.unspin{animation:unspin var(--d) linear infinite}` +
    `@keyframes spin{to{transform:rotate(360deg)}}@keyframes unspin{to{transform:rotate(-360deg)}}` +
    `.glow{animation:pulse 7s ease-in-out infinite alternate}` +
    `@keyframes pulse{from{opacity:.55}to{opacity:1}}` +
    `@media (prefers-reduced-motion:reduce){*{animation:none!important}}`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">` +
    `<style>${css}</style><defs>${defs}</defs>${sky}</svg>`
  )
}
