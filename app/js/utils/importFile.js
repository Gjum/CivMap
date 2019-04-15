import { loadCollectionJson } from './importExport'
import { importCollection } from '../store'

export function getFileProcessor(fileName) {
  if (fileName === 'Snitches.csv') {
    return { process: processSnitchMasterFile, description: 'SnitchMaster snitches' }
  } else if (fileName.endsWith('.json')) {
    return { process: processCollectionFile, description: 'CivMap Collection' }
  } else if (fileName.endsWith('.points')) {
    return { process: processVoxelWaypointsFile, description: 'VoxelMap waypoints' }
  }
}

export function processCollectionFile(file, dispatch) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = resolve
    reader.onerror = reject
    reader.readAsText(file)
  }).then((eventRead) => {
    const text = eventRead.target.result
    const json = JSON.parse(text)
    return loadCollectionJson(json, dispatch, `civmap:collection/file/${file.name}`)
  })
}

export function processVoxelWaypointsFile(file, dispatch) {
  const reader = new FileReader()
  reader.onload = (eventRead) => { processVoxelWaypointsText(eventRead.target.result, dispatch, file.name) }
  reader.readAsText(file)
}

export function processVoxelWaypointsText(text, dispatch, source) {
  // name, x, z, y, enabled, red, green, blue, suffix, world, dimensions
  const features = text.split('\n')
    .filter(line => line.includes(',z:'))
    .map(line => {
      const p = {}
      line.split(',').map(entry => {
        const [key, val] = entry.split(':')
        p[key] = val
      })
      p.x = parseInt(p.x)
      p.y = parseInt(p.y)
      p.z = parseInt(p.z)
      p.red = parseFloat(p.red)
      p.green = parseFloat(p.green)
      p.blue = parseFloat(p.blue)
      p.enabled = p.enabled == 'true'

      const [r, g, b] = [p.red, p.green, p.blue].map(c => Math.round(255 * c))

      const fid = `civmap:waypoint/voxelmap/${p.x},${p.y},${p.z},${p.name}`
      const color = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)

      return {
        ...p,
        id: fid,
        color,
      }
    })

  // TODO instead, add to existing collection
  dispatch(importCollection({
    features,
    // XXX allow importing+viewing multiple waypoint files in parallel
    name: 'My VoxelMap Waypoints',
    id: 'civmap:collection/waypoint/voxelmap',
    source,
    enabled_presentation: 'Waypoints',
    presentations: [{
      "name": "Waypoints",
      "style_base": {
        "color": "$color|#ffdd77",
        "icon": "waypoint",
        "icon_size": 10,
        "opacity": 0
      },
      "zoom_styles": {
        "-4": { "opacity": 1 }
      }
    }],
  }))
  console.log('Loaded', features.length, 'waypoints from', source)

  // TODO create+enable preconfigured waypoints filter
}

export function processSnitchMasterFile(file, dispatch) {
  const reader = new FileReader()
  reader.onload = (eventRead) => {
    const text = eventRead.target.result

    const features = text.split('\n')
      .filter(line => line) // skip empty
      .map(line => {
        let [x, y, z, world, source, group, name, cull] = line.split(',')
        x = parseInt(x)
        y = parseInt(y)
        z = parseInt(z)
        cull = parseFloat(cull)

        name = name || `Snitch at ${x},${y},${z} on [${group}]`

        const fid = `civmap:snitchmaster/${x},${y},${z},${group}`

        // TODO colorize groups

        return {
          id: fid,
          polygon: [[[x - 11, z - 11], [x + 12, z - 11], [x + 12, z + 12], [x - 11, z + 12]]],
          name, x, y, z, world, source, group, cull,
          from_snitchmaster: true,
        }
      })

    // TODO instead, add to existing collection
    dispatch(importCollection({
      features,
      // XXX allow importing+viewing multiple snitch files in parallel
      name: 'My Snitches',
      id: 'civmap:collection/snitches',
      source: file.name,
      enabled_presentation: 'Snitches',
      presentations: [
        {
          "name": "Snitches",
          "style_base": { "icon": "snitch" },
        },
        // TODO add presentations for soon-culled etc.
      ],
    }))
    console.log('Loaded', features.length, 'snitches from', file.name)

    // TODO create+enable preconfigured snitchmaster filter
  }
  reader.readAsText(file)
}
