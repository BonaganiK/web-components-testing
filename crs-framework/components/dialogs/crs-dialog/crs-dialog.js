class CRSDialog extends crs.classes.BindableElement {
  #canCloseCallback;
  #pinned;
  #canPin = true;
  #translateBackup = null;
  get pinned() {
    return this.#pinned;
  }
  set pinned(value) {
    this.#pinned = value;
  }
  get canPin() {
    return this.#canPin;
  }
  get html() {
    return import.meta.url.replace(".js", ".html");
  }
  get shadowDom() {
    return true;
  }
  async disconnectedCallback() {
    crs.binding.utils.unmarkElement(this, true);
    this.#canCloseCallback = null;
    this.#translateBackup = null;
    this.#canPin = null;
    this.#pinned = null;
    if (this.__modal != null) {
      this.__modal.remove();
      this.__modal = null;
    }
    super.disconnectedCallback();
  }
  async #canMove(canMove) {
    const method = canMove ? "enable_move" : "disable_move";
    await crs.call("dom_interactive", method, {
      element: this,
      move_query: '[slot="header"]'
    });
  }
  /**
   * @method initialize
   * @param content {object} - The header, main and footer of the dialog
   * @param options {object} - The options for the dialog
   * @param context {object} - The binding context
   * @returns {Promise<void>}
   */
  initialize(content, options, context) {
    return new Promise((resolve) => {
      this.dataset.autoclose = options?.auto_close ?? "false";
      if (options?.modal !== false) {
        this.classList.add("modal");
      }
      if (content.header != null) {
        content.header.setAttribute("slot", "header");
        this.appendChild(content.header);
      }
      if (content.body != null) {
        content.body.setAttribute("slot", "body");
        this.appendChild(content.body);
      }
      if (content.footer != null) {
        content.footer.setAttribute("slot", "footer");
        this.appendChild(content.footer);
      }
      if (options?.headless === true) {
        this.classList.add("headless");
      }
      requestAnimationFrame(async () => {
        await this.#canMove(true);
        if (context != null) {
          await crs.binding.parsers.parseElements(this.children, context);
          await crs.binding.data.updateUI(context.bid, null);
        }
        this.style.top = "50%";
        this.style.left = "50%";
        this.style.translate = "-50% -50%";
        if (options?.maximized === true) {
          this.classList.toggle("fullscreen");
          if (options?.transform != null) {
            this.style.translate = `${options.transform.x}px ${options.transform.y}px`;
            this.style.width = `${options.transform.width}px`;
            this.style.height = `${options.transform.height}px`;
          }
          this.style.translate = "0px";
          this.style.top = 0;
          this.style.left = 0;
        }
        if (options?.transform != null) {
          const x = options.transform.x;
          const y = options.transform.y;
          const width = options.transform.width;
          const height = options.transform.height;
          this.style.top = 0;
          this.style.left = 0;
          this.style.translate = `${x}px ${y}px`;
          this.style.width = `${width}px`;
          this.style.height = `${height}px`;
        } else if (options?.relative_to != null) {
          await crs.call("fixed_layout", "set", {
            target: options.relative_to,
            element: this,
            at: options.position.toLowerCase(),
            anchor: options.anchor.toLowerCase(),
            margin: options.margin
          });
        }
        this.style.opacity = "1";
        resolve();
      });
    });
  }
  /**
   * @method canClose - check if the dialog can be closed
   * For example if you have changes that are not saved you should not be able to close it.
   * @returns {Promise<boolean>}
   */
  async canClose() {
    return true;
  }
  async close() {
    await crs.call("dialogs", "close", { id: this.dataset.id });
  }
  async toggleFullscreen(event) {
    this.classList.toggle("fullscreen");
    const isFullScreen = this.classList.contains("fullscreen");
    this.dataset.fullscreen = isFullScreen;
    const canMove = isFullScreen ? false : true;
    await this.#canMove(canMove);
    if (canMove == false) {
      this.#translateBackup = this.style.translate;
      this.style.translate = null;
    } else {
      if (this.#translateBackup == "-50% -50%") {
        this.style.left = "50%";
        this.style.top = "50%";
      }
      this.style.translate = this.#translateBackup;
      this.#translateBackup = null;
    }
    const icon = this.classList.contains("fullscreen") ? "close-fullscreen" : "open-fullscreen";
    const btnResize = this.shadowRoot.querySelector("#btnResize");
    btnResize.textContent = icon;
  }
}
customElements.define("crs-dialog", CRSDialog);
