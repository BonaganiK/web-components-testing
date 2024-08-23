class EventStore {
  #store = {};
  #eventHandler = this.#onEvent.bind(this);
  #callEventHandler = this.callEvent.bind(this);
  get store() {
    return this.#store;
  }
  async #onEvent(event2) {
    const targets = getTargets(event2);
    if (targets.length === 0)
      return;
    for (const target of targets) {
      const uuid = target["__uuid"];
      const data = this.#store[event2.type];
      const intent = data[uuid];
      if (intent != null) {
        const bid = target["__bid"];
        if (Array.isArray(intent)) {
          for (const i of intent) {
            await this.#onEventExecute(i, bid, target);
          }
          continue;
        }
        await this.#onEventExecute(intent, bid, target);
      }
    }
  }
  async #onEventExecute(intent, bid, target) {
    let provider = intent.provider;
    provider = provider.replaceAll("\\", "");
    const providerInstance = crs.binding.providers.attrProviders[provider];
    await providerInstance.onEvent?.(event, bid, intent, target);
  }
  async callEvent(event2) {
    const target = event2.composedPath()[0];
    if (target instanceof HTMLInputElement == false)
      return;
    const uuid = target["__uuid"];
    const data = this.#store[event2.type];
    const element = crs.binding.elements[uuid];
    let intent = data[uuid];
    if (intent == null)
      return;
    if (!Array.isArray(intent))
      intent = [intent];
    for (const i of intent) {
      await this.#onEventExecute(i, element.__bid, element);
    }
  }
  getIntent(event2, uuid) {
    return this.#store[event2]?.[uuid];
  }
  getBindingField(event2, intent, componentProperty) {
    const intentValue = intent.value;
    for (const key of Object.keys(intentValue)) {
      const value = intentValue[key];
      if (value === componentProperty)
        return key;
    }
  }
  register(event2, uuid, intent) {
    const element = crs.binding.elements[uuid];
    const root = element.getRootNode();
    if (event2 === "change" && element instanceof HTMLInputElement && root instanceof ShadowRoot && root.host.registerEvent != null) {
      root.host.registerEvent(root, event2, this.#callEventHandler);
    }
    if (this.#store[event2] == null) {
      document.addEventListener(event2, this.#eventHandler, {
        capture: true,
        passive: true
      });
      this.#store[event2] = {};
    }
    this.#store[event2][uuid] ||= [];
    this.#store[event2][uuid].push(intent);
  }
  clear(uuid) {
    const element = crs.binding.elements[uuid];
    if (element?.__events == null)
      return;
    const events = element.__events;
    for (const event2 of events) {
      delete this.#store[event2][uuid];
    }
  }
}
function getTargets(event2) {
  return event2.composedPath().filter((element) => element["__uuid"] != null);
}
export {
  EventStore
};
