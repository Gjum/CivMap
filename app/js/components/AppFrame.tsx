import React from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'

import * as Layers from './views/main-tabs/layers'
import * as Markings from './views/main-tabs/markings'
import * as Search from './views/main-tabs/search'

import CollectionEdit from './views/collection-edit'
import FeatureEdit from './views/feature-edit'
import FeatureInformation from './views/feature-information'

import AppBar from './AppBar'
import DragDrop from './DragDrop'
import LeafMap from './leaflet/LeafMap'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, Toolbar, AppBar as MAppBar, Typography, IconButton, BottomNavigation, BottomNavigationAction } from '@mui/material'
import { RootState } from '../store'
import { CloseRounded, EditLocationAltRounded, LayersRounded, SearchRounded } from '@mui/icons-material'
import { changeMainTab, MainTabs, openTabs, ViewingKey } from '../controlstate'

export default function (props) {
  const modes = {
    [MainTabs.Layers]: Layers,
    [MainTabs.Markings]: Markings,
    [MainTabs.Search]: Search,
  }

  const dispatch = useDispatch()
  const { tab, viewing } = useSelector((state: RootState) => state.control)
  const { SideContent } = modes[tab]

  const containerModeClass = SideContent ? "split" : "full-map"
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      neutral: {
        main: '#404040',
        contrastText: '#ffffff',
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          color: "neutral",
          variant: "contained"
        }
      }
    }
  } as any)

  const title = (() => {
    switch (viewing.type) {
    case ViewingKey.MainTabs:
      return ""
    case ViewingKey.FeatureInfo:
      return "Viewing Marking"
    case ViewingKey.FeatureEdit:
      return "Editing Marking"
    case ViewingKey.CollectionEdit:
      return "Editing Collection"
    }
  })()

  return <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <div className='full'>
      <div className={"container " + containerModeClass}>
        <LeafMap />
        {SideContent &&
          <div className="mainlist">
            {viewing.type != ViewingKey.MainTabs &&
              <MAppBar position="static">
                <Toolbar variant="dense">
                  <Typography variant="h6" color="inherit" component="div" sx={{ flexGrow: 1 }}>
                    {title}
                  </Typography>
                  <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => dispatch(openTabs())}>
                    <CloseRounded />
                  </IconButton>
                </Toolbar>
              </MAppBar>
            }
            <div className="content">
              {viewing.type == ViewingKey.MainTabs &&
                <SideContent />
              }
              {viewing.type == ViewingKey.FeatureInfo &&
                <FeatureInformation featureID={viewing.featureID} featureCollection={viewing.featureCollection} />
              }
              {viewing.type == ViewingKey.FeatureEdit &&
                <FeatureEdit featureID={viewing.featureID} featureCollection={viewing.featureCollection} />
              }
              {viewing.type == ViewingKey.CollectionEdit &&
                <CollectionEdit collectionID={viewing.collectionID} />
              }
            </div>
            {viewing.type == ViewingKey.MainTabs &&
              <BottomNavigation
                showLabels
                value={tab}
                onChange={(event, newValue) => {
                  console.warn(newValue)
                  switch (newValue) {
                    case 0:
                      dispatch(changeMainTab(MainTabs.Layers))
                      break
                    case 1:
                      dispatch(changeMainTab(MainTabs.Markings))
                      break
                    case 2:
                      dispatch(changeMainTab(MainTabs.Search))
                      break
                  }
                }}
              >
                <BottomNavigationAction label="Layers" icon={<LayersRounded />} />
                <BottomNavigationAction label="Markings" icon={<EditLocationAltRounded />} />
                <BottomNavigationAction label="Search" icon={<SearchRounded />} />
              </BottomNavigation>
            }
          </div>
        }
      </div>
    </div>
  </ThemeProvider>
}
