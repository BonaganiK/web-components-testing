class LayoutContainer extends HTMLElement {
  async connectedCallback() {
    await this.#renderGrid();
  }
  /**
   * @method #renderGrid - renders the grid based on the data-columns and data-rows attributes
   * @return {Promise<void>}
   */
  async #renderGrid() {
    const columns = this.dataset.columns;
    const rows = this.dataset.rows;
    if (columns == null && rows == null)
      return;
    await crs.call("cssgrid", "init", {
      element: this
    });
    await this.#drawGrid(columns, rows);
  }
  /**
   * @method #setColumnState - sets the column state based on the state and value passed in
   * @param parameters {Object} - {state: "default" || "custom", value: "0 2fr 1fr"}  is the value of the columns
   * @return {Promise<void>}
   */
  async #setState(parameters = {}) {
    const state = parameters.state || "default";
    const columns = parameters.columns || this.dataset.columns;
    const rows = parameters.rows || this.dataset.rows;
    if (columns == null || rows == null)
      return;
    await this.#drawGrid(columns, rows);
    this.dispatchEvent(new CustomEvent("change", { detail: state }));
  }
  /**
   * @method #drawGrid - draws the grid based on the columns and rows passed in
   * @param columns {String} - it is the value of the columns
   * @param rows {String} - it is the value of the rows
   * @return {Promise<void>}
   */
  async #drawGrid(columns, rows) {
    if (columns == null && rows == null)
      return;
    await crs.call("cssgrid", "set_columns", {
      element: this,
      columns
    });
    await crs.call("cssgrid", "set_rows", {
      element: this,
      rows
    });
  }
  /**
   * @method onMessage - listens for the setColumnState message and calls the #setColumnState method
   * @param args {Object} - it is the object that is passed in from the postMessage
   * @return {Promise<void>}
   */
  async onMessage(args) {
    if (args.key === "setState") {
      await this.#setState(args.parameters);
    }
  }
}
customElements.define("layout-container", LayoutContainer);
export {
  LayoutContainer as default
};
