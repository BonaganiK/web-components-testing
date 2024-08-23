class CardsManager {
  #cards = {};
  get cards() {
    return this.#cards;
  }
  async register(name, template, inflationFn) {
    this.#cards[name] = { template, inflationFn };
  }
  async unregister(name) {
    const card = this.#cards[name];
    card.template = null;
    card.inflationFn = null;
    delete this.#cards[name];
  }
  async get(name) {
    return this.#cards[name];
  }
}
export {
  CardsManager
};
