import { BaseDataManager } from "./data-manager-base.js";
const DB_NAME = "data-manager";
class DataManagerIDBProvider extends BaseDataManager {
  #storeName;
  #sessionKey;
  get storeName() {
    return this.#storeName;
  }
  set records(newValue) {
    this.setRecords(newValue).catch((errors) => console.error(errors));
  }
  dispose() {
    crs.call("idb", "release_stores", {
      "name": DB_NAME,
      "stores": [this.#storeName]
    }).catch((error) => console.error(error));
    super.dispose();
  }
  async setRecords(records) {
    await super.setRecords(records);
    const result = await crs.call("idb", "set", {
      "name": DB_NAME,
      "store": this.#storeName,
      "records": records,
      "clear": true
    });
    this.#storeName = result.data;
    this.#sessionKey = `${DB_NAME}_${this.#storeName}`;
  }
  async append(...record) {
    await crs.call("idb", "set", {
      "name": DB_NAME,
      "store": this.#storeName,
      "records": record,
      "clear": false
    });
  }
  async getAll() {
    return await crs.call("idb", "get_all", {
      "name": DB_NAME,
      "store": this.#storeName
    });
  }
  async getPage(from, to) {
    return await crs.call("idb", "get_batch", {
      "name": DB_NAME,
      "store": this.#storeName,
      "startIndex": from,
      "endIndex": to
    });
  }
  async getByIndex(index) {
    return await crs.call("idb", "get", {
      "name": DB_NAME,
      "store": this.#storeName,
      "indexes": [index]
    });
  }
  async getById(id) {
    return await crs.call("idb", "get_by_id", {
      "name": DB_NAME,
      "store": this.#storeName,
      "id": id
    });
  }
  async getIds(indexes) {
    const records = await crs.call("idb", "get", {
      "name": DB_NAME,
      "store": this.#storeName,
      "indexes": indexes
    });
    const ids = [];
    for (const record of records) {
      ids.push(record[this.idField]);
    }
  }
  async removeIndexes(indexes) {
    await crs.call("idb", "delete_by_index", {
      "name": DB_NAME,
      "store": this.#storeName,
      "index": indexes
    });
  }
  async removeIds(ids) {
    await crs.call("idb", "delete_by_id", {
      "name": DB_NAME,
      "store": this.#storeName,
      "ids": ids
    });
  }
  async updateIndex(index, changes) {
    await crs.call("idb", "change_by_index", {
      "name": DB_NAME,
      "store": this.#storeName,
      index,
      changes
    });
  }
  async updateId(id, changes) {
    await crs.call("idb", "change_by_id", {
      "name": DB_NAME,
      "store": this.#storeName,
      id,
      changes
    });
  }
  async setSelectedIndexes(indexes, selected) {
    const result = indexes.map((index) => {
      return {
        type: "index",
        values: { index, selected }
      };
    });
    sessionStorage.setItem(this.#sessionKey, JSON.stringify(result));
  }
  async setSelectedIds(ids, selected) {
    const indexes = await crs.call("idb", "get_by_id", {
      "name": DB_NAME,
      "store": this.#storeName,
      "ids": ids
    });
    return await this.setSelectedIndexes(indexes, selected);
  }
  async getSelected(isSelected = true) {
    const indexes = sessionStorage.getItem(this.#sessionKey);
  }
  async toggleSelectedIndexes(indexes) {
  }
  async toggleSelectedIds(ids) {
  }
  async setSelectedAll(selected) {
    sessionStorage.setItem(this.#sessionKey, JSON.stringify({
      type: "all"
    }));
  }
}
export {
  DataManagerIDBProvider
};
