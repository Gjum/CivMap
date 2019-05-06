/**
 * @typedef {{ default: any, feature_key: String, categories?: {}, range?: { min_in: Number, max_in: Number, min_out: Number, max_out: Number } }} StyleProp
 * @typedef {{any: StyleProp}} Styling
 * @typedef {{name: String, style_base: Styling, style_highlight: Styling, zoom_styles: {Number: Styling}}} Presentation
 */

export function getCurrentPresentation(collection) {
  const { enabled_presentation, presentations = {} } = collection
  if (!enabled_presentation) return null
  const presentation = presentations[enabled_presentation]
  if (presentation) return presentation
  if (enabled_presentation === true) {
    const fallbackPresentation = Object.values(presentations)[0] || defaultPresentation
    return fallbackPresentation
  }
  return null // unknown presentation name
}

/**
 * Apply the style to the feature, resolving `$props`, categories, ranges, etc.
 * @param {StyleProp} styleProp
 */
export function calculateFeatureStyleProp(feature, styleProp) {
  // TODO contains($) -> replace ${x} with feature.x
  if ((typeof (styleProp) === 'string' || styleProp instanceof String) && styleProp.startsWith('\$')) {
    const [key, fallback] = styleProp.substr(1).split('\|')
    return feature[key] || fallback
  }
  if (!(styleProp instanceof Object)) {
    return styleProp
  }
  if (Array.isArray(styleProp)) {
    return styleProp
  }
  const { feature_key, categories, range, default: defaultVal } = styleProp
  // TODO defaultVal should allow $keys
  if (categories && feature_key) {
    const featureVal = feature[feature_key]
    if (featureVal === undefined) return defaultVal

    const categoryVal = categories[featureVal]
    if (categoryVal === undefined) return defaultVal

    return calculateFeatureStyleProp(feature, categoryVal)
  }
  if (range && feature_key) {
    const featureVal = feature[feature_key]
    if (featureVal === undefined) return defaultVal

    const { min_in, max_in, min_out, max_out } = range
    const part = (featureVal - min_in) / (max_in - min_in)
    return min_out + part * (max_out - min_out)
  }
  console.error('Malformed feature style ' + JSON.stringify(styleProp))
}

/**
 * Apply the styles to the feature, resolving `$props`, categories, ranges, etc.
 */
export function calculateFeatureStyle({ feature, baseStyle, highlightStyle, zoomStyle }) {
  const combinedStyle = { ...baseStyle, ...zoomStyle, ...highlightStyle }
  const style = {}
  for (let k in combinedStyle) {
    style[k] = calculateFeatureStyleProp(feature, combinedStyle[k])
  }
  if (style.hue) style.color = `hsl(${style.hue}, 100%, 50%)`
  return style
}

/**
 * Find the zoom style that applies to the given zoom level.
 */
export function getZoomStyle(zoom_styles, zoom) {
  if (!zoom_styles) return defaultZoomStyle
  let zoomStyle = defaultZoomStyle
  for (let z = zoom; z >= -6; z--) {
    if (zoom_styles[z]) {
      zoomStyle = zoom_styles[z]
      break
    }
  }
  return zoomStyle
}

/**
 * Get styleKey after applying the styles to the feature,
 * or return the defaultVal if the value at styleKey is undefined.
 */
export function lookupStyle(styleKey, { feature, baseStyle, highlightStyle, zoomStyle }, defaultVal) {
  for (const style of [highlightStyle, zoomStyle, baseStyle]) {
    if (style && style[styleKey] !== undefined) {
      return calculateFeatureStyleProp(feature, style[styleKey])
    }
  }
  return defaultVal
}

/**
 * Convert from CivMap-API style to Leaflet style.
 */
export function convertStyle(styleIn) {
  let { color, dash_array, fill_opacity, opacity, stroke_color, stroke_width } = styleIn
  const styleOut = {
    color: stroke_color || color || '#ff8800',
    dashArray: dash_array,
    fillColor: color,
    fillOpacity: fill_opacity !== undefined ? fill_opacity : opacity * .3,
    opacity: opacity,
    weight: stroke_width !== undefined ? stroke_width : 3,
  }
  return styleOut
}

const defaultZoomStyle = {}

export const defaultPresentation = {
  name: "(default)",
  style_base: {
    color: '$color|#ff8800',
    icon_size: 16,
    label: '$name',
    opacity: 1,
  },
  style_highlight: {
    color: "#ff0000",
    opacity: 1,
    stroke_width: 2,
  },
  zoom_styles: {
    "-6": defaultZoomStyle,
  },
}
