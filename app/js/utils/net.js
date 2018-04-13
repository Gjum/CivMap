export function getJSON(url, onData, onErr) {
  var request = new XMLHttpRequest()
  request.open('GET', url, true)
  request.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status >= 200 && this.status < 400) {
        try {
          var json = JSON.parse(this.responseText)
        } catch (e) {
          if (onErr) onErr(e)
          else console.error('Error converting json from', url, this.responseText, e)
          return
        }
        onData(json)
      } else {
        if (onErr) onErr(this)
        else console.error('Error getting json from', url, this)
      }
    }
  }
  request.send()
  request = null
}

export function postJSON(url, payload, onData, onErr) {
  try {
    payload = JSON.stringify(payload)
  } catch (e) {
    if (onErr) onErr(e)
    else console.error('Error converting payload to json', payload, e)
    return
  }
  var request = new XMLHttpRequest()
  request.open('POST', url, true)
  request.setRequestHeader("Content-type", "application/json")
  request.setRequestHeader("Content-length", payload.length)
  request.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status >= 200 && this.status < 400) {
        try {
          var json = JSON.parse(this.responseText)
        } catch (e) {
          if (onErr) onErr(e)
          else console.error('Error converting json from', url, this.responseText, e)
          return
        }
        onData(json)
      } else {
        if (onErr) onErr(this)
        else console.error('Error posting json to', url, this)
      }
    }
  }
  request.send(payload)
  request = null
}
