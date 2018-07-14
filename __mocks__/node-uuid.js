let nextId = 1;

export function __mockUuidV4(id) {
  nextId = id
}

export function v4() {
  return nextId
}

export default { v4 }
