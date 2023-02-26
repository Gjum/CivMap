import { boundsFromPositions, circleBoundsFromFeature, intCoords, rectBoundsFromFeature, rectToEnclosingCircle } from './math'

describe("rectToEnclosingCircle", () => {
  it("works", () => {
    expect(rectToEnclosingCircle([[12212, -223], [12412, -23]])).toEqual({ x: 12312, z: -123, radius: 100 })
  })
})

describe("rectBoundsFromFeature", () => {
  it("works", () => {
    expect(rectBoundsFromFeature({ x: 12312, z: -123 })).toEqual([[12212, -223], [12412, -23]])
  })
})

describe("circleBoundsFromFeature", () => {
  it("works", () => {
    expect(circleBoundsFromFeature({ x: 12312, z: -123 })).toEqual({ x: 12312, z: -123, radius: 100 })
  })
})

describe("intCoords", () => {
  it("rounds positive coords", () => {
    expect(intCoords([12.1, 34.9])).toEqual([12, 34])
  })
  it("rounds negative coords", () => {
    expect(intCoords([-12.1, -34.9])).toEqual([-13, -35])
  })
})

describe("boundsFromPositions", () => {
  it("converts from point", () => {
    expect(boundsFromPositions([1, -2])).toEqual([[1, -2], [1, -2]])
  })
  it("converts from single-depth", () => {
    expect(boundsFromPositions([[1, 2], [-3, -4]])).toEqual([[-3, -4], [1, 2]])
  })
  it("converts from double-depth", () => {
    expect(boundsFromPositions(
      [[[1, 6], [7, -4]], [[-5, 2], [-3, -8]]]
    )).toEqual([[-5, -8], [7, 6]])
  })
  it("converts from triple-depth", () => {
    expect(boundsFromPositions(
      [[[[1, 6], [7, -4]]], [[[-5, 2], [-3, -8]]]]
    )).toEqual([[-5, -8], [7, 6]])
  })
})
