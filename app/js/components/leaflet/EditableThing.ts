import { Dispatch } from "redux"

export interface EditableProps {
    baseStyle: any
    dispatch: Dispatch
    editable: boolean
    feature: any
    highlightStyle: any
    zoomStyle: {}
}