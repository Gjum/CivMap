export function exportLayer(layer, featuresMap) {
  const { id, properties, featureIds } = layer
  const features = featureIds.map(id => featuresMap.get(id))
  return { id, properties, features }
}

export function importLayer(layer) {
  const { id, properties, features } = layer
  const featureIds = features.map(f => f.id)
  const featuresMap = new Map(features.map(f => [f.id, f]))
  return {
    layer: { id, properties, featureIds },
    featuresMap,
  }
}
