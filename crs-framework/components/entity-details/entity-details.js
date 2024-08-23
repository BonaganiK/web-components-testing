const SORT_DIRECTION = Object.freeze({
  ASCENDING: "ascending",
  DESCENDING: "descending"
});
const SORT_ICONS = Object.freeze({
  [SORT_DIRECTION.ASCENDING]: "sort-ascending",
  [SORT_DIRECTION.DESCENDING]: "sort-descending"
});
class EntityDetails extends HTMLElement {
  #clickHandler = this.#click.bind(this);
  #dblclickHandler = this.#dblclick.bind(this);
  #sortDirection = SORT_DIRECTION.ASCENDING;
  #entityData = null;
  get entityData() {
    return this.#entityData;
  }
  /**
   * @constructor - this will create the shadow root and attach it to the component.
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  /**
   * @method connectedCallback - this is the main function that will be called when the component is attached to the DOM.
   * @returns {Promise<void>}
   */
  async connectedCallback() {
    const css = `<link rel="stylesheet" href="${import.meta.url.replace(".js", ".css")}">`;
    const html = await fetch(import.meta.url.replace(".js", ".html")).then((result) => result.text());
    this.shadowRoot.innerHTML = `${css}${html}`;
    await crs.binding.translations.add(globalThis.translations.entityDetails, "entityDetails");
    await crs.binding.translations.parseElement(this.shadowRoot.querySelector("header"));
    requestAnimationFrame(() => this.init());
  }
  /**
   * @method init - this function loads resources and sets up the component.
   * @returns {Promise<void>}
   */
  async init() {
    this.addEventListener("click", this.#clickHandler);
    this.addEventListener("dblclick", this.#dblclickHandler);
    await this.refresh();
  }
  /**
   * @method disconnectedCallback - this is the main function that will be called when the component is removed from the DOM.
   * @returns {Promise<void>}
   */
  async disconnectedCallback() {
    this.removeEventListener("click", this.#clickHandler);
    this.addEventListener("dblclick", this.#dblclickHandler);
    await crs.binding.translations.delete("entityDetails");
    this.#sortDirection = null;
    this.#clickHandler = null;
    this.#dblclickHandler = null;
    this.#entityData = null;
  }
  /**
   * @method #click - this is the click handler for the component
   * Look for data-action attributes that will affect what is being done.
   * @param event
   */
  #click(event) {
    const target = event.composedPath()[0];
    const action = target.dataset.action;
    if (this[action] != null) {
      this[action](event);
    }
  }
  /**
   * @method #dblclick - this is the double click handler for the component
   * This will check if you are dbl clicking on a entity item or it's details
   * and will dispatch an event to open the details accordingly.
   * @param event
   */
  #dblclick(event) {
    const target = event.composedPath()[0];
    const li = target.closest("li");
    if (li == null || li.dataset.id == null || li.dataset.id.length == 0)
      return;
    this.dispatchEvent(new CustomEvent("open_entity_details", { detail: {
      entityType: li.dataset.entityType,
      id: li.dataset.id
    } }));
  }
  /**
   * @method refresh - this is the main function that starts the drawing process.
   * This is used both internally and externally to refresh the component.
   * This function will request via event for the initial data to be loaded if the data parameter is not defined
   *
   * @returns {Promise<void>}
   * @param {Object} data - the data to be used to draw the component if this is empty it will request it from the server
   * using a event
   */
  async refresh() {
    const itemsContainer = this.shadowRoot.querySelector(".items");
    itemsContainer.innerHTML = "";
    this.#entityData = null;
    this.dispatchEvent(new CustomEvent("get_entities", {}));
  }
  /**
   * @method drawEntities - this will take the data and draw the entities on the screen.
   * The entity UI is by default collapsed and will expand when clicked.
   * @param data
   * @returns {Promise<void>}
   */
  async #drawEntities(data) {
    this.#entityData = data;
    const itemsContainer = this.shadowRoot.querySelector(".items");
    itemsContainer.innerHTML = "";
    const entityTemplate = this.shadowRoot.querySelector("#entity-template");
    const fragment = document.createDocumentFragment();
    for (const entity of data) {
      const clone = createEntityItem(entityTemplate, entity);
      fragment.appendChild(clone);
    }
    itemsContainer.appendChild(fragment);
    requestAnimationFrame(async () => {
      if (this.dataset.ready !== "true") {
        await crs.call("component", "notify_ready", { element: this });
      }
    });
  }
  /**
   * @method #drawEntityItems - this will take the data and draw the entity items on the screen.
   * @param target {HTMLElement} - this is the target element that will be used to draw the entity items.
   * @param data {Array} - this is the data that will be used to draw the entity items.
   * @returns {Promise<void>}
   */
  async #drawEntityItems(target, data, entityType) {
    const entityItemTemplate = this.shadowRoot.querySelector("#entity-item-template");
    const ruleItemTemplate = this.shadowRoot.querySelector("#rule-item-template");
    const fragment = document.createDocumentFragment();
    const developmentStatuses = (await import("./../../src/lookup-tables/development-statuses.js")).developmentStatuses;
    for (const entityItem of data) {
      const clone = entityItemTemplate.content.cloneNode(true);
      const li = clone.firstElementChild;
      li.dataset.entityType = entityItem.entityType;
      li.dataset.id = entityItem.id;
      setStatus(li, entityItem.status, developmentStatuses);
      li.querySelector(".value").textContent = entityItem.code;
      li.querySelector(".description").textContent = entityItem.descriptor || "";
      if (entityItem.rules == null || entityItem.rules.length == 0) {
        li.querySelector(".count").remove();
        li.querySelector("[data-action='expandItem']").remove();
        li.classList.add("no-rules");
      } else {
        li.querySelector(".count").textContent = entityItem.rules.length;
        const container = li.querySelector("ul");
        await this.#drawRules(container, entityItem.rules, ruleItemTemplate, developmentStatuses);
      }
      fragment.appendChild(clone);
    }
    target.appendChild(fragment);
  }
  /**
   * @method #drawRules - this will take the data and draw the rules on the screen.
   * @param target {HTMLElement} - this is the target element that will be used to draw the rules.
   * @param data {Array} - this is the data that will be used to draw the rules.
   * @param ruleItemTemplate
   * @returns {Promise<void>}
   */
  async #drawRules(target, data, ruleItemTemplate, developmentStatuses) {
    data = sort(data, this.#sortDirection, "code");
    const fragment = document.createDocumentFragment();
    for (const item of data) {
      fragment.appendChild(createRuleItem(ruleItemTemplate, item, developmentStatuses));
    }
    target.appendChild(fragment);
  }
  /**
   * @method #collapse - this will collapse the entity and remove the items from the screen.
   * @param target
   * @returns {Promise<void>}
   */
  async #collapse(target) {
    target.querySelector("ul").innerHTML = "";
    target.setAttribute("aria-expanded", "false");
  }
  /**
   * @method collapseAll - this will collapse all the entities on the screen.
   * This is executed from the click event based on a data-action attribute.
   * @returns {Promise<void>}
   */
  async collapseAll(event) {
    const entities = this.shadowRoot.querySelectorAll(".entity-item");
    for (const entity of entities) {
      await this.#collapse(entity);
    }
  }
  /**
   * @method sort - this will change the sort direction so that the next time the entities are drawn they will be sorted.
   * The sorting is not done locally but on the server.
   * @param event
   * @returns {Promise<void>}
   */
  async sort(event) {
    const target = event.composedPath()[0];
    this.#sortDirection = this.#sortDirection == SORT_DIRECTION.ASCENDING ? SORT_DIRECTION.DESCENDING : SORT_DIRECTION.ASCENDING;
    target.textContent = SORT_ICONS[this.#sortDirection];
    await this.refresh();
  }
  /**
   * @method expand - this will expand the entity and request the items from the server.
   * This is executed from the click event based on a data-action attribute.
   * @param event
   * @returns {Promise<void>}
   */
  async expand(event) {
    const target = event.composedPath()[0];
    const listItem = target.closest("li");
    if (listItem.getAttribute("aria-expanded") == "true") {
      return await this.#collapse(listItem);
    }
    listItem.setAttribute("aria-expanded", "true");
    listItem.setAttribute("aria-busy", "true");
    const entityType = listItem.dataset.entityType;
    const entity = this.#entityData.find((item) => item.entityType === entityType);
    const args = { componentId: this.id, entity, entityData: this.#entityData };
    this.dispatchEvent(new CustomEvent("get_entity_items", { detail: args }));
  }
  /**
   * @method expandItem - this will expand the entity item and request the rules from the server.
   * @param event
   * @returns {Promise<void>}
   */
  async expandItem(event) {
    const li = event.composedPath()[0].closest("li");
    const expanded = li.getAttribute("aria-expanded") == "true";
    li.setAttribute("aria-expanded", expanded ? "false" : "true");
  }
  /**
   * @method addEntities - this will take the data and draw the entities on the screen.
   * @param data {Array} - this is the data that will be used to draw the entities.
   * @returns {Promise<void>}
   */
  async addEntities(data) {
    const parent = this.shadowRoot.querySelector(".container");
    await crs.call("no_content", "hide", { parent });
    if (data == null || data.length === 0) {
      return await crs.call("no_content", "show", { parent });
    }
    data = sort(data, this.#sortDirection, "entityType");
    await this.#drawEntities(data);
  }
  /**
   * @method addEntityItems - this will take the data and draw the entity items on the screen.
   * @param data {Array} - this is the data that will be used to draw the entity items.
   * @param entityId {any} - this is the id of the entity that the items belong to.
   * @returns {Promise<void>}
   */
  async addEntityItems(data, entityType) {
    const li = this.shadowRoot.querySelector(`[data-entity-type="${entityType}"]`);
    li.removeAttribute("aria-busy");
    if (data == null || data.length === 0)
      return;
    data = sort(data, this.#sortDirection, "code");
    const target = li.querySelector("ul");
    await this.#drawEntityItems(target, data, entityType);
  }
  /**
   * @method onMessage - this is the main function that will be called when the component receives a message.
   * @param event
   * @returns {Promise<void>}
   */
  async onMessage(event) {
    this[event.action]?.(event.data, event.entityType);
  }
}
function createEntityItem(entityTemplate, entity) {
  const clone = entityTemplate.content.cloneNode(true);
  const entityElement = clone.querySelector("li");
  entityElement.dataset.entityType = entity.entityType;
  entityElement.querySelector(".entity-value").textContent = entity.title;
  entityElement.querySelector(".count").textContent = entity.entityIds.length;
  return clone;
}
function createRuleItem(ruleItemTemplate, item, developmentStatuses) {
  const clone = ruleItemTemplate.content.cloneNode(true);
  const li = clone.firstElementChild;
  li.dataset.entityType = item.entityType;
  li.dataset.id = item.id;
  setStatus(li, item.status, developmentStatuses);
  if (item.code) {
    li.querySelector(".value").textContent = item.code;
  } else {
    li.querySelector(".value").remove();
  }
  li.querySelector(".description").textContent = item.descriptor || "";
  return clone;
}
function sort(data, direction, field) {
  if (direction == SORT_DIRECTION.ASCENDING) {
    return data.sort((a, b) => a[field].localeCompare(b[field]));
  }
  return data.sort((a, b) => b[field].localeCompare(a[field]));
}
function setStatus(parentElement, status, developmentStatuses) {
  const icon = developmentStatuses[status].icon;
  const title = developmentStatuses[status].title;
  const color = developmentStatuses[status].color;
  const statusElement = parentElement.querySelector(".status");
  statusElement.textContent = icon;
  statusElement.setAttribute("title", title);
  statusElement.setAttribute("tooltip", title);
  statusElement.style.color = color;
}
customElements.define("entity-details", EntityDetails);
export {
  EntityDetails as default
};
