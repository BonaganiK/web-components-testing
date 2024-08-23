import {
  createOverflowItems,
  showOverflow,
  closeOverflow,
  createOverflowFromCount,
  setPinned,
  unPin,
  toggleSelection,
  moveHighlight
} from "./overflow-utils.js";
class OverflowBar extends crs.classes.BindableElement {
  #background = null;
  #clickHandler = this.#click.bind(this);
  #dialogOpen = false;
  #keyupHandler = this.#keyup.bind(this);
  #highlighted = null;
  get background() {
    return this.#background;
  }
  set background(value) {
    this.#background = value;
  }
  get dialogOpen() {
    return this.#dialogOpen;
  }
  set dialogOpen(value) {
    this.#dialogOpen = value;
  }
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  get shadowDom() {
    return true;
  }
  constructor() {
    super();
    this.style.visibility = "hidden";
  }
  async load() {
    requestAnimationFrame(async () => {
      this.registerEvent(this, "click", this.#clickHandler);
      await this.refresh();
      this.style.visibility = "visible";
      this.registerEvent(this, "keydown", this.#keyupHandler);
    });
  }
  /**
   * @method click - this function handles the click event on the overflow bar
   * When you press enter or space while the dropdown button is focused will also call this.
   * this.#highlighted is set during the up and down arrow keys
   * @param event
   * @returns {Promise<void>}
   */
  async #click(event) {
    this.overflowCell.removeAttribute("aria-selected");
    const target = this.#highlighted || event.composedPath()[0];
    this.#highlighted = null;
    const action = target.dataset.action;
    const id = target.dataset.id;
    if ((id != null || action != null) && target !== this.btnOverflow) {
      this.notify("execute", { action, id });
      if (target.matches(".pinned-content")) {
        this.overflowCell.setAttribute("aria-selected", "true");
      }
    }
    if (target.nodeName === "LI") {
      await setPinned(this, action, id, target.textContent, target.dataset.icon, target.dataset.invalid);
      await toggleSelection(target, this);
      await this.refresh(true);
      this.overflowCell.setAttribute("aria-selected", "true");
      return await closeOverflow(this, this.overflow);
    }
    if (this.#dialogOpen) {
      return await closeOverflow(this, this.overflow);
    }
    if (target === this.btnOverflow) {
      this.#highlighted = null;
      return await showOverflow(this, this.btnOverflow, this.overflow);
    }
  }
  async #keyup(event) {
    if (this.dialogOpen == true) {
      if (event.code === "Escape") {
        return await closeOverflow(this, this.overflow);
      }
      if (event.code === "ArrowDown") {
        return this.#highlighted = await moveHighlight(this.overflow, 1);
      }
      if (event.code === "ArrowUp") {
        return this.#highlighted = await moveHighlight(this.overflow, -1);
      }
    }
  }
  /**
   * @method refresh - this function refreshes the overflow menu, redrawing everything to be visible or in overflow
   * @returns {Promise<void>}
   */
  async refresh(pinned = false) {
    this.background = this.background?.remove();
    const useIcons = this.dataset.display === "icons";
    let hasOverflow;
    if (this.dataset.count == null) {
      hasOverflow = await createOverflowItems(this, this.btnOverflow, this.overflow, useIcons);
    } else {
      hasOverflow = await createOverflowFromCount(this, this.btnOverflow, this.overflow, Number(this.dataset.count), useIcons, pinned);
    }
    this.overflowCell.style.display = hasOverflow ? "flex" : "none";
  }
  async addCSS(url) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    this.shadowRoot.appendChild(link);
  }
  async onMessage(args) {
    const id = args.id;
    const action = args.key;
    const value = args.value;
    const item = this.querySelector(`[data-id="${id}"]`);
    if (action === "ignore") {
      item.dataset.ignore = value;
      if (value === false) {
        delete item.dataset.ignore;
      }
      if (this.pinnedContent.dataset.id == id) {
        await unPin(this);
      }
    }
    await this.refresh();
  }
}
customElements.define("overflow-bar", OverflowBar);
export {
  OverflowBar
};
