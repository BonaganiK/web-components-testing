class ExpandingInput extends HTMLElement {
  #clickHandler = this.#click.bind(this);
  #keyUpHandler = this.#keyUp.bind(this);
  #input;
  #actions = {
    expand: this.#expand.bind(this),
    submit: this.#submit.bind(this),
    clear: this.#clear.bind(this)
  };
  get value() {
    return this.#input.value;
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async connectedCallback() {
    const css = `<link rel="stylesheet" href="${import.meta.url.replace(".js", ".css")}">`;
    const html = await fetch(import.meta.url.replace(".js", ".html")).then((result) => result.text());
    this.shadowRoot.innerHTML = `${css}${html}`;
    requestAnimationFrame(() => this.init());
  }
  async init() {
    this.addEventListener("click", this.#clickHandler);
    this.addEventListener("keyup", this.#keyUpHandler);
    this.#input = this.shadowRoot.querySelector("input");
    if (this.dataset.icon) {
      const buttons = this.shadowRoot.querySelectorAll("button");
      buttons[0].innerHTML = this.dataset.icon;
      buttons[2].innerHTML = this.dataset.submitIcon ?? this.dataset.icon;
    }
    this.#input.placeholder = this.dataset.placeholder ?? "";
  }
  async disconnectedCallback() {
    this.removeEventListener("click", this.#clickHandler);
    this.removeEventListener("keyup", this.#keyUpHandler);
    this.#clickHandler = null;
    this.#keyUpHandler = null;
    this.#input = null;
    this.#actions = null;
  }
  #click(event) {
    const target = event.composedPath()[0];
    if (target.dataset.action) {
      this.#actions[target.dataset.action]();
    }
  }
  #expand() {
    this.dataset.expanded = "true";
    this.#input.focus();
  }
  async #submit() {
    this.dispatchEvent(new CustomEvent("submit", { detail: this.value }));
  }
  async #keyUp(event) {
    if (event.key === "Enter" && this.#input.value !== "") {
      await this.#submit();
    }
  }
  async #clear() {
    this.#input.value = "";
    this.dataset.expanded = "false";
    await this.#submit();
  }
}
customElements.define("expanding-input", ExpandingInput);
export {
  ExpandingInput as default
};
