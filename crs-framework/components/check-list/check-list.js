import { loadHTML } from "./../../src/load-resources.js";
import "./../../src/actions/selection-actions.js";
class Checklist extends HTMLElement {
  #clickHandler = this.#clicked.bind(this);
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  /**
   * @constructor
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  /**
   * @method connectedCallback - called when the element is added to the DOM
   * @returns {Promise<void>}
   */
  async connectedCallback() {
    this.shadowRoot.innerHTML = await loadHTML(import.meta.url);
    await this.load();
  }
  /**
   * @method load - called when the element is added to the DOM to initialize the component
   * @returns {Promise<void>}
   */
  async load() {
    requestAnimationFrame(async () => {
      this.setAttribute("role", "listbox");
      await crs.binding.translations.parseElement(this);
      this.shadowRoot.addEventListener("click", this.#clickHandler);
      const masterCheckbox = this.querySelector("check-box[data-master]");
      if (masterCheckbox != null) {
        await crs.call("selection", "enable", {
          element: this,
          master_query: "check-box[data-master]",
          master_attribute: "aria-checked",
          item_query: "li",
          item_attribute: "aria-selected"
        });
      }
    });
  }
  /**
   * @method disconnectedCallback - called when the element is removed from the DOM
   * @returns {Promise<void>}
   */
  async disconnectedCallback() {
    if (this.__selectionManager != null) {
      await crs.call("selection", "disable", {
        element: this
      });
    }
    await this.shadowRoot.removeEventListener("click", this.#clickHandler);
    this.#clickHandler = null;
  }
  /**
   * @method #clicked - called when a list item is clicked
   * @param event
   * @returns {Promise<void>}
   */
  async #clicked(event) {
    const target = event.composedPath()[0];
    await crs.call("dom_collection", "toggle_selection", { target, multiple: true });
    this.dispatchEvent(new CustomEvent("checkedChange", { detail: { target, value: target.dataset.value, checked: target.getAttribute("aria-selected") == "true" } }));
  }
}
customElements.define("check-list", Checklist);
export {
  Checklist
};
