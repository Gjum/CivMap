let mockGetJson = {};
export function __setMockGetJson(newMockGetJson) {
  mockGetJson = { ...newMockGetJson }
}

export function getJSON(url, onData, onErr) {
  onData(mockGetJson)
}

export function postJSON(url, payload, onData, onErr) {
}
