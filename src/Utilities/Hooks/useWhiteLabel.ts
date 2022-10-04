import { Label, Host, host, longTitle } from 'Utilities/config'
import { useSearchParam } from 'react-use'
import useStargate from './useStargate'

// NOTE try not to use as causes a /stargate call, though we do that everywhere ANYWAY
// but we should attempt not to
// FIXME this also means that there will be a period where this is still loading and will report MyHealthily as the label perhaps incorrectly
export function useWhiteLabel(): { label: Label, title: string } {
  const rawLabel = useWhiteLabelFromSearchParams()
  const stargateLabel = useStargate().value?.label

  let label: Label
  if (rawLabel && stargateLabel === 'app.myhealthily.com' && rawLabel.url !== Label.myhealthily) {
    label = rawLabel.url
  } else {
    label = stargateLabel || rawLabel?.url || Label.myhealthily
  }

  return { label, title: titleForWhiteLabel(label) }
}

export function useWhiteLabelFromSearchParams(): { url: Label, title: string, shortcode: string } | null {
  const param = useSearchParam('label')
  if (!param) {
    try {
      const shortcode = labelShortCode(localStorage.label || '')
      const url = Label[shortcode]
      return {
        url: url,
        title: titleForWhiteLabel(url),
        shortcode
      }
    } catch {
      return null
    }
  }
  const url = Label[param as keyof typeof Label] || null
  if (!url) return null
  return {
    url,
    shortcode: param,
    title: titleForWhiteLabel(url)
  }
}

export function titleForWhiteLabel(key: Label): string {
  const host_ = host()

  switch (host_) {
  case Host.localhost:
    return `Ra·${shortTitle(key)}`
  case Host.staging:
    return `Staging·${shortTitle(key)}`
  case Host.cd:
    return `CD·${shortTitle(key)}`
  case Host.develop:
    return `Develop·${shortTitle(key)}`
  case Host.production:
    return longTitle(key)
  }
}

function shortTitle(key: Label) {
  return labelShortCode(key)
}

export function labelShortCode(input: string): keyof typeof Label {
  for (const key in Label) {
    const shortcode = key as keyof typeof Label
    // allow use of short codes
    if (key === input) { return shortcode }
    // or fully qualified
    if (Label[shortcode] === input) { return shortcode }
  }
  // Real short-term hack
  if (input.match(/\.myhealthily\.com$/)) {
    return labelShortCode(input.replace(/\.myhealthily\.com$/, '.candor.insurance'))
  }
  throw new Error(`Cannot determine white-label from input: ${input}`)
}

export function logo(input: Label) {
  // TODO: fix this mess
  return `https://${input.replace(/candor\.insurance$/, 'myhealthily.com')}/logo.svg`
}
