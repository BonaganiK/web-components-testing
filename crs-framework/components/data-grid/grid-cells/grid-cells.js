class GridCells extends crs.classes.BindableElement {
  get shadowDom() {
    return true;
  }
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  onMessage(args) {
    console.log(args);
  }
}
customElements.define("grid-cells", GridCells);
export {
  GridCells as default
};
