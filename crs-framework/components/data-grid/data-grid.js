import "./grid-cells/grid-cells.js";
import { assertClassType } from "../../src/utils/assertClassType.js";
import { UpdateOptions } from "./core/update-options.js";
const DATA_GRID_CELLS_QUERY = "data-grid-cells";
class DataGrid extends crs.classes.BindableElement {
  #columns;
  #dataManager;
  get shadowDom() {
    return true;
  }
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  get columns() {
    return Object.freeze(this.#columns);
  }
  set columns(newValue) {
    this.#columns = assertClassType(newValue, "Columns");
  }
  get dataManager() {
    return this.#dataManager;
  }
  set dataManager(newValue) {
    this.#dataManager = assertClassType(newValue, "string");
  }
  /**
   * update child components of changes happening using the messaging system.
   * @param updateOptions - bitwise flag to indicate what has changed.
   */
  #notifyColumnsChanged(updateOptions) {
    if (updateOptions | UpdateOptions.COLUMNS) {
      this.querySelector(DATA_GRID_CELLS_QUERY)?.onMessage({ columns: this.columns });
    }
  }
}
customElements.define("data-grid", DataGrid);
export {
  DataGrid as default
};
