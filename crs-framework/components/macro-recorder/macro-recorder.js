import { inputStep, clickStep, process, dragStep } from "./steps.js";
import { getQuery } from "./query.js";
import { composedPath } from "./composed-path.js";
import { getElementStatus } from "./get-element-status.js";
import "./../../components/text-editor/text-editor.js";
import "./../../components/dialog/dialog-actions.js";
const inputElements = ["input", "textarea", "select"];
const RecorderState = Object.freeze({
  IDLE: 0,
  RECORDING: 1,
  PICKING: 2,
  GET_STATUS: 3
});
class MacroRecorder extends HTMLElement {
  #steps = [];
  #pickLayer = null;
  #clickTimer = null;
  #state = RecorderState.IDLE;
  #buttons = {};
  #cache = {};
  #startPoint;
  #currentElement;
  #suppressClick = false;
  #globalClickHandler = this.#globalClick.bind(this);
  #globalDblClickHandler = this.#globalDblClick.bind(this);
  #globalMouseDownHandler = this.#globalMouseDown.bind(this);
  #globalMouseUpHandler = this.#globalMouseUp.bind(this);
  #globalKeyDownHandler = this.#globalKeyDown.bind(this);
  #globalKeyUpHandler = this.#globalKeyUp.bind(this);
  #globalFocusInHandler = this.#globalFocusIn.bind(this);
  #globalFocusOutHandler = this.#globalFocusOut.bind(this);
  #animationLayerClickHandler = this.#animationLayerClick.bind(this);
  #animationLayerKeyUpHandler = this.#animationLayerKeyUp.bind(this);
  #clickHandler = this.#click.bind(this);
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  async connectedCallback() {
    const cssUrl = new URL("./macro-recorder.css", import.meta.url);
    const htmlUrl = new URL("./macro-recorder.html", import.meta.url);
    const html = await fetch(htmlUrl).then((result) => result.text());
    this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="${cssUrl}">
            ${html}
        `;
    await this.load();
  }
  async load() {
    requestAnimationFrame(async () => {
      this.shadowRoot.addEventListener("click", this.#clickHandler, { capture: true, passive: true });
      await crs.call("component", "notify_ready", { element: this });
      this.#buttons["macro-start"] = this.shadowRoot.querySelector('[data-action="macro-start"]');
      this.#buttons["macro-stop"] = this.shadowRoot.querySelector('[data-action="macro-stop"]');
      this.#buttons["macro-clear"] = this.shadowRoot.querySelector('[data-action="macro-clear"]');
      this.#buttons["macro-pick"] = this.shadowRoot.querySelector('[data-action="macro-pick"]');
      this.#buttons["macro-status"] = this.shadowRoot.querySelector('[data-action="macro-status"]');
      this.#buttons["macro-show"] = this.shadowRoot.querySelector('[data-action="macro-show"]');
    });
  }
  async disconnectedCallback() {
    await this.#disableGlobalEvents();
    this.shadowRoot.removeEventListener("click", this.#clickHandler);
    this.#buttons = null;
    this.#state = null;
    this.#clickTimer = null;
    this.#steps = null;
    this.#pickLayer = null;
  }
  async #setState(newState) {
    await this.#disableGlobalEvents();
    if (this.#state === RecorderState.PICKING || this.#state === RecorderState.GET_STATUS) {
      this.#pickLayer.removeEventListener("click", this.#animationLayerClickHandler, { capture: true, passive: true });
      this.#pickLayer.removeEventListener("keyup", this.#animationLayerKeyUpHandler, { capture: true, passive: true });
      this.#pickLayer = await crs.call("dom_interactive", "remove_animation_layer");
    }
    for (const element of Object.values(this.#buttons)) {
      element.style.color = "black";
      element.style.fontWeight = "normal";
    }
    this.#state = newState;
    if (this.#state === RecorderState.PICKING || this.#state === RecorderState.GET_STATUS) {
      if (this.#state === RecorderState.GET_STATUS) {
        this.#buttons["macro-status"].style.color = "red";
        this.#buttons["macro-status"].style.fontWeight = "bold";
      } else {
        this.#buttons["macro-pick"].style.color = "red";
        this.#buttons["macro-pick"].style.fontWeight = "bold";
      }
      this.#pickLayer = await crs.call("dom_interactive", "get_animation_layer");
      this.#pickLayer.addEventListener("click", this.#animationLayerClickHandler, { capture: true, passive: true });
      this.#pickLayer.addEventListener("keyup", this.#animationLayerKeyUpHandler, { capture: true, passive: true });
      this.#pickLayer.style.pointerEvents = "auto";
    }
    if (this.#state === RecorderState.RECORDING) {
      this.#buttons["macro-start"].style.color = "red";
      this.#buttons["macro-start"].style.fontWeight = "bold";
      await this.#enableGlobalEvents();
    }
  }
  async #enableGlobalEvents() {
    document.addEventListener("click", this.#globalClickHandler, { capture: true, passive: true });
    document.addEventListener("dblclick", this.#globalDblClickHandler, { capture: true, passive: true });
    document.addEventListener("keydown", this.#globalKeyDownHandler, { capture: true, passive: true });
    document.addEventListener("keyup", this.#globalKeyUpHandler, { capture: true, passive: true });
    document.addEventListener("focusin", this.#globalFocusInHandler, { capture: true, passive: true });
    document.addEventListener("mousedown", this.#globalMouseDownHandler, { capture: true, passive: true });
  }
  async #disableGlobalEvents() {
    document.removeEventListener("click", this.#globalClickHandler);
    document.removeEventListener("dblclick", this.#globalDblClickHandler);
    document.removeEventListener("keydown", this.#globalKeyDownHandler);
    document.removeEventListener("keyup", this.#globalKeyUpHandler);
    document.removeEventListener("focusin", this.#globalFocusInHandler);
    document.removeEventListener("mousedown", this.#globalMouseDownHandler);
  }
  async #click(event) {
    this[event.composedPath()[0].dataset.action]?.(event);
  }
  async "macro-start"() {
    await this.#setState(RecorderState.RECORDING);
  }
  async "macro-stop"() {
    await this.#setState(RecorderState.IDLE);
  }
  async "macro-clear"() {
    this.#steps = [];
  }
  async "macro-pick"() {
    await this.#setState(RecorderState.PICKING);
  }
  async "macro-status"() {
    await this.#setState(RecorderState.GET_STATUS);
  }
  async "macro-show"() {
    await this.#setState(RecorderState.IDLE);
    const result = await this.saveToProcess("undefined");
    const editor = document.createElement("text-editor");
    editor.setAttribute("data-language", "json");
    editor.value = JSON.stringify(result, null, 4);
    const tab = window.open("about:blank");
    tab.document.body.appendChild(editor);
  }
  async #animationLayerClick(event) {
    this.#pickLayer.style.pointerEvents = "none";
    try {
      const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY);
      const path = composedPath(elementAtPoint);
      const query = getQuery(path);
      if (this.#state === RecorderState.PICKING) {
        await crs.call("system", "copy_to_clipboard", { source: query });
        console.log(query);
      } else if (this.#state === RecorderState.GET_STATUS) {
        const result = getElementStatus(query, elementAtPoint);
        await crs.call("system", "copy_to_clipboard", { source: result });
        console.log(result);
      }
    } finally {
      this.#pickLayer.style.pointerEvents = "auto";
      await this.#setState(RecorderState.IDLE);
    }
  }
  async #animationLayerKeyUp(event) {
    if (event.key === "Escape") {
      await this.#setState(RecorderState.IDLE);
    }
  }
  async #globalClick(event) {
    if (this.#suppressClick === true) {
      this.#suppressClick = false;
      return;
    }
    const path = event.composedPath();
    if (path.includes(this))
      return;
    clearTimeout(this.#clickTimer);
    this.#clickTimer = setTimeout(async () => {
      const step = structuredClone(clickStep);
      step.args.query = getQuery(path);
      if (event.button === 2) {
        step.action = "context_click";
      }
      await this.#addToStack(step);
    }, 200);
  }
  async #globalDblClick(event) {
    clearTimeout(this.#clickTimer);
    const step = structuredClone(clickStep);
    step.args.query = getQuery(event.composedPath());
    step.action = "double_click";
    await this.#addToStack(step);
  }
  async #globalMouseDown(event) {
    this.#currentElement = event.composedPath()[0];
    document.addEventListener("mouseup", this.#globalMouseUpHandler, { capture: true, passive: true });
    this.#startPoint = { x: event.clientX, y: event.clientY };
  }
  async #globalMouseUp(event) {
    document.removeEventListener("mouseup", this.#globalMouseUpHandler, { capture: true, passive: true });
    const xOffset = Math.abs(event.clientX - this.#startPoint.x);
    const yOffset = Math.abs(event.clientY - this.#startPoint.y);
    if (xOffset > 10 || yOffset > 10) {
      this.#suppressClick = true;
      this.#currentElement.style.pointerEvents = "none";
      const target = document.elementFromPoint(event.clientX, event.clientY);
      this.#currentElement.style.pointerEvents = "auto";
      const targetRect = target.getBoundingClientRect();
      const targetX = event.clientX - targetRect.x;
      const targetY = event.clientY - targetRect.y;
      const step = structuredClone(dragStep);
      step.args.query = getQuery(this.#currentElement);
      step.args.target = getQuery(target);
      step.args.x = targetX;
      step.args.y = targetY;
      await this.#addToStack(step);
      console.log(step);
    }
    this.#currentElement = null;
  }
  async #globalKeyDown(event) {
    const path = event.composedPath();
    if (inputElements.includes(path[0].tagName.toLowerCase()) === true)
      return;
  }
  async #globalKeyUp(event) {
    const path = event.composedPath();
    if (inputElements.includes(path[0].tagName.toLowerCase()) === true)
      return;
  }
  async #globalFocusIn(event) {
    const path = event.composedPath();
    const tagName = path[0].tagName.toLowerCase();
    if (inputElements.includes(tagName) === false)
      return;
    const target = path[0];
    this.#cache[target] = target.value;
    document.addEventListener("focusout", this.#globalFocusOutHandler, { capture: true, passive: true });
  }
  async #globalFocusOut(event) {
    const target = event.composedPath()[0];
    document.removeEventListener("focusout", this.#globalFocusOutHandler, { capture: true, passive: true });
    if (this.#cache[target] != null) {
      const oldValue = this.#cache[target];
      const newValue = target.value;
      delete this.#cache[target];
      if (oldValue !== newValue) {
        const step = structuredClone(inputStep);
        step.args.query = getQuery(event.composedPath());
        step.args.value = newValue;
        await this.#addToStack(step);
      }
    }
  }
  async #addToStack(step) {
    this.#steps.push(structuredClone(step));
  }
  async saveToProcess(name) {
    const instance = structuredClone(process);
    instance.id = name;
    instance.main.steps.start.args.url = window.location.href;
    for (let i = 0; i < this.#steps.length; i++) {
      let name2 = `step_${i}`;
      const nextName = `step_${i + 1}`;
      const step = this.#steps[i];
      instance.main.steps[name2] = step;
      if (i < this.#steps.length - 1) {
        step.next_step = nextName;
      }
    }
    return instance;
  }
}
customElements.define("macro-recorder", MacroRecorder);
export {
  MacroRecorder
};
