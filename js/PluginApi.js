export class PluginApi {
  constructor(component) {
    this._component = component;
    this.setState = component.setState.bind(component);
    this.setSubStates = component.setSubStates.bind(component);
    this.map = null; // set later when map element is instantiated
  }
}
