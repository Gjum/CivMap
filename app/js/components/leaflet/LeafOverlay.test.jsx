import { selectRenderedFeatures } from './LeafOverlay'

const featureBase = { id: 'test_id', x: 123, z: -123 }

const collectionBase = {
  id: "civmap:url_import",
  name: "Linked to me",
  mode: "temporary",
  enabled_presentation: null,
  features: { [featureBase.id]: featureBase },
  presentations: {},
}

describe("LeafOverlay.selectRenderedFeatures", () => {
  it("does not show features in disabled collections", () => {
    const collection = {
      ...collectionBase,
      enabled_presentation: null,
    }

    const rendered = selectRenderedFeatures({
      activeFeatureCollection: null, activeFeatureId: null, appMode: 'BROWSE', zoom: 0,
      collections: { [collection.id]: collection },
    })

    expect(rendered).toEqual({})
  })

  it("uses default presentation", () => {
    const collection = {
      ...collectionBase,
      enabled_presentation: true,
    }

    const rendered = selectRenderedFeatures({
      activeFeatureCollection: null, activeFeatureId: null, appMode: 'BROWSE', zoom: 0,
      collections: { [collection.id]: collection },
    })

    expect(rendered).toHaveProperty('test_id')
    expect(rendered.test_id).toHaveProperty('baseStyle')
    expect(rendered.test_id).toHaveProperty('zoomStyle')
    expect(rendered.test_id).toHaveProperty('feature')
    expect(rendered.test_id.feature).toEqual(featureBase)
  })
})
