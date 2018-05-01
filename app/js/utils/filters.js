export function checkFilterConditions({ conditions, feature }) {
  for (let condition of conditions) {
    if (!checkFilterCondition({ condition, feature })) {
      return false
    }
  }
  return true
}

export function checkFilterCondition({ condition, feature }) {
  if (condition.type === 'key_equals') {
    return feature[condition.key] === condition.value
  }
  if (condition.type === 'has_key') {
    return feature[condition.key] !== undefined
  }
  if (condition.type === 'has_one_of_keys') {
    for (let key of condition.keys) {
      if (feature[key] !== undefined) {
        return true
      }
    }
    return false
  }
  console.warn('ignoring unknown filter condition', condition)
  return true
}

export function applyFilterOverrides({ feature, overrides }) {
  // TODO this is called quite often during map updates, make sure this performs well enough
  // XXX HACK make this usable through a gui
  const overridesReplaced = overrides
    .replace(/\$\{\.\.\.([^}]+)\}/g, (_fullMatch, path) => {
      // replace feature {foo:{a:1}} with {foo:{a:1,b:2}} for overrides == "{foo:{${...foo},b:2}}"
      let valAtPath = feature
      for (let key of path.split('\.')) {
        if (valAtPath !== undefined) valAtPath = valAtPath[key]
      }
      const d = JSON.stringify(valAtPath)
      if (/^\{.+\}$/.test(d)) return d.substring(1, d.length - 1)
      else return '"_dummy":0' // to allow comma in overrides, without creating syntax error
    })
    .replace(/\$\{([^}]+)\}/g, (_fullMatch, path) => {
      // replace any ${foo.bar} with 123 for feature {foo:{bar:123}}
      let valAtPath = feature
      for (let key of path.split('\.')) {
        if (valAtPath !== undefined) valAtPath = valAtPath[key]
      }
      return JSON.stringify(valAtPath)
    })
  try {
    const replacements = JSON.parse(overridesReplaced)
    return {
      ...feature,
      ...replacements,
    }
  } catch (e) {
    console.error(`[applyFilterOverrides] Could not replace "${overrides}" with`, feature, e)
    return feature
  }
}

export function doesFeatureHaveLabel({ feature, filter }) {
  if (!filter.showLabels) return false
  const fwo = applyFilterOverrides({ feature, overrides: filter.overrides })
  return (fwo.name !== undefined || fwo.label !== undefined)
    && fwo.x !== undefined && fwo.z !== undefined
}
