import { BaseDataManager } from "./data-manager-base.js";
import { DIRTY_TYPES } from "./data-manager-dirty-types.js";
class DataManagerMemoryProvider extends BaseDataManager {
  #records;
  /**
   * Keep track of the dirty records.
   * Very important:
   * if record is updated and dirty then the value is true
   * if record is created and dirty then the value is false
   */
  #dirtyLookup = {};
  set records(newValue) {
    this.setRecords(newValue);
  }
  /**
   * @method setRecords - This method is called to set the records in the data manager.
   * @param records
   */
  async setRecords(records) {
    this.#records = records;
    this.#dirtyLookup = {};
    await super.setRecords(records);
  }
  /**
   * @method append - This method is called to append records to the data manager.
   * @param records
   */
  async append(records, isDirty = false) {
    for (const record of records) {
      record._index = this.#records.length;
      if (isDirty === true) {
        this.#dirtyLookup[record._index] = DIRTY_TYPES.CREATED;
      }
      this.#records.push(record);
    }
    this.count = this.#records.length;
  }
  /**
   * @method getAll - This method is called to get all of the records in the data manager.
   * @returns {*}
   */
  async getAll() {
    return this.#records;
  }
  /**
   * @method getPage - This method is called to get a page of records from the data manager.
   * @param from {number} - The index of the first record to get
   * @param to {number} - The index of the last record to get
   * @returns {*}
   */
  async getPage(from, to) {
    return this.#records.slice(from, to);
  }
  /**
   * @method getByIndex - This method is called to get a record by its index.
   * @param index {number} - The index of the record to get
   * @returns {*}
   */
  async getByIndex(index) {
    return this.#records[index];
  }
  /**
   * @method getById - This method is called to get a record by its id.
   * @param id {number} - The id of the record to get
   * @returns {*}
   */
  async getById(id) {
    return this.#records.find((item) => item[this.idField] == id);
  }
  /**
   * @method getIds - This method is called to get the ids of records by their indexes.
   * @param indexes {number[]} - The indexes of the records to get
   * @returns {*[]}
   */
  async getIds(indexes) {
    const ids = [];
    for (const index of indexes) {
      ids.push(this.#records[index][this.idField]);
    }
    return ids;
  }
  /**
   * @method removeIndexes - This method is called to remove records by their indexes.
   * @param indexes {number[]} - The indexes of the records to remove
   * @returns {{indexes, ids: *[]}}
   */
  async removeIndexes(indexes) {
    indexes.sort((a, b) => a > b ? -1 : 1);
    const ids = [];
    for (const index of indexes) {
      ids.push(this.#records[index][this.idField]);
      delete this.#dirtyLookup[index];
      this.#records.splice(index, 1);
    }
    this.count = this.#records.length;
    return { indexes, ids };
  }
  /**
   * @method removeIds - This method is called to remove records by their ids.
   * @param ids {number[]} - The ids of the records to remove
   * @returns {{indexes: *[], ids}}
   */
  async removeIds(ids) {
    const indexes = [];
    for (const id of ids) {
      const index = this.#records.findIndex((item) => item[this.idField] == id);
      indexes.push(index);
      delete this.#dirtyLookup[index];
      this.#records.splice(index, 1);
    }
    indexes.sort((a, b) => a > b ? -1 : 1);
    await super.removeIds(this.#records.length);
    return { indexes, ids };
  }
  /**
   * @method updateIndex - This method is called to update a record by its index.
   * @param index {number} - The index of the record to update
   * @param changes {object} - The changes to make to the record
   * @param isDirty {boolean} - Whether the record is dirty
   * @returns {{changes, index, id: *}}
   */
  async updateIndex(index, changes, isDirty = false) {
    const record = this.#records[index];
    const id = record[this.idField];
    const keys = Object.keys(changes);
    for (const key of keys) {
      record[key] = changes[key];
    }
    if (isDirty === true) {
      this.#dirtyLookup[index] = DIRTY_TYPES.UPDATED;
    } else {
      delete this.#dirtyLookup[index];
    }
    return { id, index, changes };
  }
  /**
   * @method updateId - This method is called to update a record by its id.
   * @param id {number} - The id of the record to update
   * @param changes {object} - The changes to make to the record
   * @returns {{changes, index: *, id}}
   */
  async updateId(id, changes, isDirty = false) {
    const index = this.#records.findIndex((item) => item[this.idField] == id);
    const record = this.#records[index];
    const keys = Object.keys(changes);
    for (const key of keys) {
      record[key] = changes[key];
    }
    if (isDirty === true) {
      this.#dirtyLookup[index] = DIRTY_TYPES.UPDATED;
    } else {
      delete this.#dirtyLookup[index];
    }
    return { id, index, changes };
  }
  async setSelectedIndexes(indexes, selected) {
    for (const index of indexes) {
      this.#records[index]._selected = selected;
    }
    this.selectedCount += selected ? indexes.length : -indexes.length;
  }
  async setSelectedIds(ids, selected) {
    for (const id of ids) {
      const index = this.#records.findIndex((item) => item[this.idField] == id);
      this.#records[index]._selected = selected;
    }
    this.selectedCount += selected ? ids.length : -ids.length;
  }
  async getSelected(isSelected = true) {
    return this.#records.filter((item) => item._selected === isSelected);
  }
  async getSelectedIndexes() {
    const indexes = [];
    for (let i = 0; i < this.#records.length; i++) {
      if (this.#records[i]._selected) {
        indexes.push(i);
      }
    }
    return indexes;
  }
  async toggleSelectedIndexes(indexes) {
    for (const index of indexes) {
      const isSelected = !this.#records[index]._selected;
      this.#records[index]._selected = isSelected;
      this.selectedCount += isSelected ? 1 : -1;
    }
  }
  async toggleSelectedIds(ids) {
    for (const id of ids) {
      const index = this.#records.findIndex((item) => item[this.idField] == id);
      const isSelected = !this.#records[index]._selected;
      this.#records[index]._selected = isSelected;
      this.selectedCount += isSelected ? 1 : -1;
    }
  }
  async setSelectedAll(selected) {
    for (const record of this.#records) {
      record._selected = selected;
    }
    this.selectedCount = selected == true ? this.#records.length : 0;
  }
  async getUpdated() {
    const updated = [];
    const keys = Object.keys(this.#dirtyLookup);
    for (const index of keys) {
      if (this.#dirtyLookup[index] === DIRTY_TYPES.UPDATED) {
        updated.push(this.#records[index]);
      }
    }
    return updated;
  }
  async getCreated() {
    const created = [];
    const keys = Object.keys(this.#dirtyLookup);
    for (const index of keys) {
      if (this.#dirtyLookup[index] === DIRTY_TYPES.CREATED) {
        created.push(this.#records[index]);
      }
    }
    return created;
  }
  async clearDirty() {
    this.#dirtyLookup = {};
  }
  async clearDirtyIndexes(indexes) {
    for (const index of indexes) {
      delete this.#dirtyLookup[index];
    }
  }
}
export {
  DataManagerMemoryProvider
};
