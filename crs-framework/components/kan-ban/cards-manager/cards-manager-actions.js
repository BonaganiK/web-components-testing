import { CardsManager } from "./cards-manager.js";
class CardsManagerActions {
  static async perform(step, context, process, item) {
    await this[step.action]?.(step, context, process, item);
  }
  static async register(step, context, process, item) {
    const name = await crs.process.getValue(step.args.name, context, process, item);
    const template = await crs.process.getValue(step.args.template, context, process, item);
    const inflationFn = await crs.process.getValue(step.args.inflationFn, context, process, item);
    await crs.cardsManager.register(name, template, inflationFn);
  }
  static async unregister(step, context, process, item) {
    const name = await crs.process.getValue(step.args.name, context, process, item);
    await crs.cardsManager.unregister(name);
  }
  static async get(step, context, process, item) {
    const name = await crs.process.getValue(step.args.name, context, process, item);
    return await crs.cardsManager.get(name);
  }
}
crs.cardsManager = new CardsManager();
crs.intent.cards_manager = CardsManagerActions;
export {
  CardsManagerActions
};
