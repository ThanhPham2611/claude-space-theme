import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { buildScene } from './scene.js'

const SCENE_ID = 'space-theme-cosmos'
const SCENE = buildScene()

// Deep space, dark only: near-black blue surfaces and cool starlight text.
const { theme, problems } = makeColors({
  label: 'Cosmos',
  only: 'dark',
  roles: {
    accent: '#8ea8ff',
    danger: '#ff7a8a',
    success: '#5fe3b0',
    warning: '#ffc468',
    pro: '#c792ff',
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#070a1a',
        'surface-1': '#0d1230',
        'surface-2': '#141b3d',
        'surface-3': '#181f46',
        'text-primary': '#eef2ff',
        'text-secondary': '#c5ccee',
        'text-muted': '#98a2d0',
      },
    },
  },
  codeTheme: { dark: 'nord' },
})

// The glass frosts the app's panels over the sky so text stays easy to read.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: {
    scene: SCENE_ID,
    glass: { blur: 18, tint: '#070a1a', opacity: 0.55 },
  },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // The one line that would stop Desktop painting this look.
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.scene !== SCENE_ID || (e.surface !== 'desktop' && e.surface !== 'mobile')) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE}
        alt="Dải ngân hà với các vì sao lấp lánh, sao băng và một hệ mặt trời nhỏ"
        isInteractive
      />
    )
  })
}
