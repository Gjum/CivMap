import React from 'react'

import TextField from 'material-ui/TextField'

export default class JsonEditor extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      parseErrorText: undefined,
    }
  }

  render() {
    const { data, onChange } = this.props
    return <div>
      {/* TODO list of key-value text fields */}
      <TextField fullWidth multiline
        rowsMax={9999}
        label="JSON"
        value={this.state.parseErrorText ? undefined : JSON.stringify(data)}
        error={!!this.state.parseErrorText}
        helperText={this.state.parseErrorText}
        onChange={e => {
          let newData
          try {
            newData = JSON.parse(e.target.value)
            this.setState({ parseErrorText: undefined })
          } catch (err) {
            this.setState({ parseErrorText: '' + err })
          }
          if (newData) onChange(newData)
        }}
      />
    </div>
  }
}
