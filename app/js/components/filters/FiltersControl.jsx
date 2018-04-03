import React from 'react'
import { connect } from 'react-redux'

import List, { ListItem, ListItemText, ListSubheader } from 'material-ui/List'
import TextField from 'material-ui/TextField'

import { openFilters, updateFilter } from '../../store'

// TODO reuse in feature edit
class JsonEditor extends React.PureComponent {
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
          try {
            const newData = JSON.parse(e.target.value)
            this.setState({ parseErrorText: undefined })
            onChange(newData)
          } catch (err) {
            this.setState({ parseErrorText: '' + err })
          }
        }}
      />
    </div>
  }
}

const FiltersControl = ({
  dispatch,
  editFilterId,
  filters,
}) => {
  const filter = filters[editFilterId]
  return <div>
    {!filter ? <div>Select a filter to edit</div> :
      <div style={{ margin: '16px' }}>
        <JsonEditor
          data={filter}
          onChange={(newFilter) => dispatch(updateFilter({ filterId: editFilterId, filter: newFilter }))}
        />
      </div>
    }
    <List disablePadding
      subheader={<ListSubheader>Filters</ListSubheader>}
    >
      {filters.map(({ name = 'unnamed filter', conditions = [], overrides = '{}' }, i) =>
        <ListItem button key={i}
          onClick={() => dispatch(openFilters(i))}
        >
          <ListItemText primary={name} />
        </ListItem>
      )}
    </List >
  </div>
}

const mapStateToProps = ({ control: { editFilterId }, filters }) => {
  return {
    editFilterId,
    filters,
  }
}

export default connect(mapStateToProps)(FiltersControl)
