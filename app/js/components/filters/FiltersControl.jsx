import React from 'react'
import { connect } from 'react-redux'

import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import List, { ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, ListSubheader } from 'material-ui/List'
import TextField from 'material-ui/TextField'

import DeleteIcon from 'material-ui-icons/Delete'
import InvisibleIcon from 'material-ui-icons/VisibilityOff'
import MoveUpIcon from 'material-ui-icons/ArrowUpward'
import VisibleIcon from 'material-ui-icons/Visibility'

import { activateFilters, moveFilterUp, openFilters, updateFilter, removeFilter, deactivateFilter } from '../../store'

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

const FiltersControl = ({
  dispatch,
  editFilterId,
  filters,
  activeFilters,
}) => {
  const editFilter = filters[editFilterId]
  const inactiveFilters = Object.keys(filters).filter(id => !activeFilters.includes(id))
  return <div>
    {!editFilter ? <div style={{ margin: '16px' }}>Select a filter to edit</div> :
      <div style={{ margin: '16px' }}>
        <JsonEditor
          data={editFilter}
          onChange={(newFilter) => dispatch(updateFilter(newFilter, editFilterId))}
        />

        {activeFilters.includes(editFilterId) ?
          <Button variant='raised' onClick={() => {
            dispatch(deactivateFilter(editFilterId))
          }}>
            <InvisibleIcon />
            Deactivate
          </Button>
          :
          <Button variant='raised' onClick={() => {
            dispatch(activateFilters([editFilterId]))
          }}>
            <VisibleIcon />
            Activate
          </Button>
        }

        <Button variant='raised' onClick={() => {
          dispatch(openFilters(null))
          dispatch(removeFilter(editFilterId))
        }}>
          <DeleteIcon />
          Delete
        </Button>
      </div>
    }

    <List disablePadding
      subheader={<ListSubheader>Active Filters</ListSubheader>}
    >
      {activeFilters.filter(id => filters[id]).map((name, i) => {
        const { conditions = [], overrides = '{}' } = filters[name]
        return <ListItem button key={name}
          onClick={() => dispatch(openFilters(name))}
        >
          <ListItemText primary={name} />
          {(i === 0) ? null :
            <ListItemSecondaryAction>
              <IconButton
                onClick={() => {
                  dispatch(moveFilterUp(name))
                }}
              >
                <MoveUpIcon />
              </IconButton>
            </ListItemSecondaryAction>
          }
        </ListItem>
      })}
    </List>

    <List disablePadding
      subheader={<ListSubheader>Inactive Filters</ListSubheader>}
    >
      {inactiveFilters.map((name) => {
        const { conditions = [], overrides = '{}' } = filters[name]
        return <ListItem button key={name}
          onClick={() => dispatch(openFilters(name))}
        >
          <ListItemText primary={name} />
          <ListItemSecondaryAction>
            <IconButton
              onClick={() => {
                dispatch(activateFilters([name]))
              }}
            >
              <VisibleIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      })}
    </List>
  </div>
}

const mapStateToProps = ({ control: { editFilterId }, filters, activeFilters }) => {
  return {
    editFilterId,
    filters,
    activeFilters,
  }
}

export default connect(mapStateToProps)(FiltersControl)
