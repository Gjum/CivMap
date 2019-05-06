import { selectRenderedFeatures } from './LeafOverlay'

const featureBase = { id: 'test_id', x: 123, z: -123 }

const collectionBase = {
  id: "test_collection_id",
  name: "Linked to me",
  mode: "temporary",
  enabled_presentation: null,
  features: { [featureBase.id]: featureBase },
  presentations: {},
}

// // TODO update test for selectRenderedLayers
// describe("LeafOverlay.selectRenderedFeatures", () => {
//   it("does not show features in disabled collections", () => {
//     const collection = {
//       ...collectionBase,
//       enabled_presentation: null,
//     }

//     const rendered = selectRenderedFeatures({
//       activeFeatureCollection: null, activeFeatureId: null, appMode: 'BROWSE', zoom: 0,
//       collections: { [collection.id]: collection },
//     })

//     expect(rendered).toEqual({})
//   })

//   it("uses default presentation", () => {
//     const collection = {
//       ...collectionBase,
//       enabled_presentation: true,
//     }

//     const rendered = selectRenderedFeatures({
//       activeFeatureCollection: null, activeFeatureId: null, appMode: 'BROWSE', zoom: 0,
//       collections: { [collection.id]: collection },
//     })

//     expect(rendered).toHaveProperty(featureBase.id)
//     expect(rendered[featureBase.id]).toHaveProperty('baseStyle')
//     expect(rendered[featureBase.id]).toHaveProperty('zoomStyle')
//     expect(rendered[featureBase.id]).toHaveProperty('feature')
//     expect(rendered[featureBase.id].feature).toEqual(featureBase)
//   })

//   it("always shows active feature", () => {
//     const collection = {
//       ...collectionBase,
//       enabled_presentation: null,
//     }

//     const rendered = selectRenderedFeatures({
//       activeFeatureCollection: collection.id, activeFeatureId: featureBase.id,
//       appMode: 'FEATURE', zoom: 0,
//       collections: { [collection.id]: collection },
//     })

//     expect(rendered).toHaveProperty(featureBase.id)
//     expect(rendered[featureBase.id].feature).toEqual(featureBase)
//   })
// })
