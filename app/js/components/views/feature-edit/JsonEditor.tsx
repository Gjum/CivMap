import React from 'react'

import { TextField } from '@mui/material'

interface Props {
  data: any
  onChange: any
  style?: React.CSSProperties
}

interface State {
  parseErrorText: string | undefined
}

export default class JsonEditor extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)

    this.state = {
      parseErrorText: undefined,
    }
  }

  render() {
    const { data, onChange } = this.props
    return <TextField fullWidth multiline
      maxRows={9999}
      style={this.props.style}
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
  }
}
