/**
 * @typedef {{ default: any, feature_key: String, categories?: {}, range?: { min_in: Number, max_in: Number, min_out: Number, max_out: Number } }} StyleProp
 * @typedef {{any: StyleProp}} Styling
 * @typedef {{name: String, style_base: Styling, style_highlight: Styling, zoom_styles: {Number: Styling}}} Presentation
 */

/**
 * Apply the style to the feature, resolving `$props`, categories, ranges, etc.
 * @param {StyleProp} styleProp
 */
export function calculateFeatureStyleProp(feature, styleProp) {
  if ((typeof (styleProp) === 'string' || styleProp instanceof String) && styleProp.startsWith('\$')) {
    const [key, fallback] = styleProp.substr(1).split('\|')
    return feature[key] || fallback
  }
  if (!(styleProp instanceof Object)) {
    return styleProp
  }
  const { feature_key, categories, range, default: defaultVal } = styleProp
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
export function calculateFeatureStyle({ feature, baseStyle, zoomStyle }) {
  const style = {}
  const combinedStyle = { ...baseStyle, ...zoomStyle }
  for (let k in combinedStyle) {
    style[k] = calculateFeatureStyleProp(feature, combinedStyle[k])
  }
  if (style.hue) style.color = `hsl(${style.hue}, 100%, 50%)`
  return style
}

/**
 * Find the zoom style that applies to the given zoom level.
 */
export function getZoomStyle({ zoom_styles }, zoom) {
  if (!zoom_styles) return {}
  let zoomStyle = {}
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
export function lookupStyle(styleKey, { feature, baseStyle, zoomStyle }, defaultVal) {
  if (zoomStyle && zoomStyle[styleKey] !== undefined) {
    return calculateFeatureStyleProp(feature, zoomStyle[styleKey])
  }
  if (baseStyle && baseStyle[styleKey] !== undefined) {
    return calculateFeatureStyleProp(feature, baseStyle[styleKey])
  }
  return defaultVal
}

/**
 * Convert from CivMap-API style to Leaflet style.
 */
export function convertStyle(styleIn) {
  let { color, dash_array, fill_opacity, opacity, stroke_color, stroke_width } = styleIn
  const styleOut = {
    color: stroke_color || color,
    dashArray: dash_array,
    fillColor: color,
    fillOpacity: fill_opacity !== undefined ? fill_opacity : opacity * .3,
    opacity: opacity,
    weight: stroke_width !== undefined ? stroke_width : 3,
  }
  return styleOut
}

export const defaultPresentation = {
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
    "-6": {},
  },
}
