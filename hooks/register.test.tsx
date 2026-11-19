import type { ThemeSetArgs } from 'claude-code'
import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'space-theme',
  component: 'Backdrop',
  props: {
    scene: 'space-theme-cosmos',
    plugin: 'space-theme',
    glass: { blur: 18, opacity: 0.55 },
  },
} as const

test('the backdrop draws the sky, on desktop and mobile', async $ => {
  for (const surface of ['desktop', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BACKDROP, surface })
    const source = String((await ui.find({ type: 'Svg' }))?.props.source)

    expect(source).toContain('viewBox="0 0 1600 1000"')
    expect(source.length < 131072).toBe(true)
    await ui.unmount()
  }
})

test('session start sets a dark-only look with the scene', async ($, on) => {
  const seen: { args?: ThemeSetArgs } = {}
  on('theme.set', (_, args) => {
    seen.args = args

    return { value: { isDrawn: true, requestId: 'backdrop' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  expect(JSON.stringify(seen.args?.backdrop)).toContain('space-theme-cosmos')
  expect(seen.args?.colors?.inputs.dark !== undefined).toBe(true)
  expect(seen.args?.colors?.inputs.light === undefined).toBe(true)
})

test("another mod's scene is left to the engine", async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)

    return <Text>engine</Text>
  })

  const ui = await $.ui.mount({
    ...BACKDROP,
    props: { ...BACKDROP.props, scene: 'other' },
    surface: 'desktop',
  })

  expect(await ui.find({ type: 'Svg' })).toBe(undefined)
  expect((await ui.find({ type: 'Text', text: /engine/ }))?.text).toBe('engine')
  await ui.unmount()
})
