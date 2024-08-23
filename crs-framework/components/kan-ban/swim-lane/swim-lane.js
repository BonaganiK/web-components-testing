class SwimLane extends HTMLElement {
  #cardDef = null;
  #ul = null;
  #recordCard = null;
  #headerDef = null;
  #headerInstance = null;
  #headerModel = null;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async connectedCallback() {
    const css = `<link rel="stylesheet" href="${import.meta.url.replace(".js", ".css")}">`;
    const html = await fetch(import.meta.url.replace(".js", ".html")).then((result) => result.text());
    this.shadowRoot.innerHTML = `${css}${html}`;
    await this.load();
  }
  load() {
    return new Promise(async (resolve) => {
      this.#cardDef = await crs.call("cards_manager", "get", { name: this.dataset.recordCard });
      if (this.#headerModel != null) {
        await this.#setHeader(this.#headerModel);
      }
      await crs.call("component", "notify_ready", { element: this });
      resolve();
    });
  }
  async disconnectedCallback() {
    await crs.call("virtualization", "disable", {
      element: this.#ul
    });
    this.#cardDef = null;
    this.#ul = null;
    this.#recordCard = null;
    this.#headerDef = null;
    this.#headerInstance = null;
  }
  async #setHeader(model) {
    if (this.#headerInstance == null) {
      this.#headerDef = await crs.call("cards_manager", "get", { name: this.dataset.headerCard });
      this.#headerInstance = this.#headerDef.template.content.cloneNode(true).firstElementChild;
      this.shadowRoot.querySelector("header").appendChild(this.#headerInstance);
    }
    await this.#headerDef.inflationFn(this.#headerInstance, model);
  }
  /**
   * @method enableVirtualization - Enables virtualization for the swim lane
   * @returns {Promise<void>}
   */
  async enableVirtualization() {
    this.#ul = this.shadowRoot.querySelector("ul");
    this.#recordCard = await crs.call("cards_manager", "get", { name: this.dataset.recordCard });
    await crs.call("virtualization", "enable", {
      element: this.#ul,
      manager: this.dataset.manager,
      itemSize: Number(this.dataset.cardSize),
      template: this.#recordCard.template,
      inflation: this.#recordCard.inflationFn
    });
  }
  /**
   * @method disableVirtualization - Disables virtualization for the swim lane
   * @returns {Promise<void>}
   */
  async disableVirtualization() {
    this.#ul = this.shadowRoot.querySelector("ul");
    await crs.call("virtualization", "disable", {
      element: this.#ul
    });
    this.#ul.innerHTML = "";
  }
  async setHeader(newValue) {
    this.#headerModel = newValue;
    if (this.dataset.ready != "true")
      return;
    if (newValue != null) {
      await this.#setHeader(newValue);
    }
  }
}
customElements.define("swim-lane", SwimLane);
export {
  SwimLane
};
