import "./../overflow-bar/overflow-bar.js";
class TabSheet extends crs.classes.BindableElement {
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  get shadowDom() {
    return true;
  }
  async load() {
    crs.binding.queryable.add(this);
    await this.#createTabs();
    await this.#setDefaultTab();
    await this.#addCssToHeader();
  }
  async disconnectedCallback() {
    crs.binding.queryable.remove(this);
    super.disconnectedCallback();
  }
  /**
   * @method #createTabs - creates the tabs based on the page elements.
   * @returns {Promise<void>}
   */
  async #createTabs() {
    const pages = this.querySelectorAll("page");
    const fragment = document.createDocumentFragment();
    for (const page of pages) {
      const wasHidden = page.matches("[aria-hidden='true']");
      page.setAttribute("aria-hidden", "true");
      const button = await crs.call("dom", "create_element", {
        tag_name: "tab",
        text_content: page.dataset.title,
        dataset: { id: page.dataset.id },
        attributes: { tabindex: 0 }
      });
      if (page.dataset.invalid != null) {
        button.dataset.invalid = page.dataset.invalid;
      }
      if (page.dataset.ignore === "true" || wasHidden) {
        button.dataset.ignore = "true";
      }
      fragment.appendChild(button);
    }
    this.header.appendChild(fragment);
  }
  /**
   * @method #setDefaultTab - sets the default tab based on the default attribute.
   * If the default attribute is not set the first tab will be set as the default.
   * @returns {Promise<void>}
   */
  async #setDefaultTab() {
    const defaultId = this.dataset.default || this.shadowRoot.querySelector("tab:not([data-ignore])").dataset.id;
    await this.makeActive(defaultId);
  }
  /**
   * @method #removeOldTabMarkers - removes the old tab markers.
   * This will remove it from the tab and also the page
   * @returns {Promise<boolean>}
   */
  async #removeOldTabMarkers() {
    const currentActiveTab = this.shadowRoot.querySelector("tab[aria-selected='true']");
    if (currentActiveTab != null) {
      const options = { canNavigateAway: true };
      this.notify("before_leave", options);
      if (options.canNavigateAway === false)
        return false;
      currentActiveTab.removeAttribute("aria-selected");
      const oldId = currentActiveTab.dataset.id;
      this.querySelector(`page[data-id="${oldId}"]`).setAttribute("aria-hidden", "true");
    }
  }
  /**
   * @method #setNewTabMarkers - sets the new tab to active.
   * @param tabId - the id of the tab to set active
   * @returns {Promise<void>}
   */
  async #setNewTabMarkers(tabId) {
    const tab = this.shadowRoot.querySelector(`tab[data-id="${tabId}"]`);
    tab.setAttribute("aria-selected", "true");
    tab.dataset.highlight = true;
    this.querySelector(`page[data-id="${tabId}"]`).removeAttribute("aria-hidden");
    this.notify("after_enter");
  }
  #clearHighlight() {
    const highlightedTab = this.header.querySelector("tab[data-highlight='true']");
    if (highlightedTab != null) {
      delete highlightedTab.dataset.highlight;
    }
    return highlightedTab;
  }
  #addCssToHeader() {
    const url = new URL("./tab-sheet-overflow.css", import.meta.url);
    this.header.addCSS(url);
  }
  /**
   * @method setInvalid - sets the tab to invalid or invalid state.
   * If the tab has a error mark this as invalid.
   * @param tabId - the id of the tab to set invalid
   * @param value - true or false
   * @returns {Promise<void>}
   */
  async setInvalid(tabId, value) {
    const tab = this.shadowRoot.querySelector(`tab[data-id="${tabId}"]`);
    tab.dataset.invalid = value;
  }
  /**
   * @method makeActive - makes the tab with the given id active.
   * @param tabId - the id of the tab to make active based on the data-id attribute.
   * @returns {Promise<void>}
   */
  async makeActive(tabId) {
    this.#clearHighlight();
    const canMoveAway = await this.#removeOldTabMarkers();
    if (canMoveAway === false)
      return;
    await this.#setNewTabMarkers(tabId);
  }
  async execute(event) {
    await this.makeActive(event.detail.id);
  }
  async onMessage(args) {
    const id = args.id;
    const action = args.key;
    const value = args.value;
    const page = this.querySelector(`[data-id="${id}"]`);
    const tab = this.shadowRoot.querySelector(`tab[data-id="${id}"]`);
    const isSelected = tab.matches("[aria-selected]");
    if (page == null)
      return;
    if (action === "ignore") {
      page.dataset.ignore = value;
      page.setAttribute("aria-hidden", "true");
      if (value === "false") {
        page.removeAttribute("aria-hidden");
        delete page.dataset.ignore;
        await this.makeActive(page.dataset.id);
      }
    }
    await this.header.onMessage(args);
    if (isSelected && action === "ignore") {
      tab.removeAttribute("aria-selected");
      const newTab = this.shadowRoot.querySelector("tab:not([aria-hidden])");
      if (newTab != null) {
        await this.makeActive(newTab.dataset.id);
      }
    }
  }
}
customElements.define("tab-sheet", TabSheet);
export {
  TabSheet
};
