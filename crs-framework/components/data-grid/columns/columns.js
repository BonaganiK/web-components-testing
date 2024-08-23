import { assertRequired } from "../../../src/utils/assertRequired.js";
import { DataType } from "./enums/data-type.js";
import { ConversionType } from "./enums/conversion-type.js";
import { Column } from "./column.js";
import { DEFAULT_WIDTH, DEFAULT_SORTABLE, DEFAULT_ALIGN, DEFAULT_SORT_DIRECTION } from "./defaults.js";
class Columns {
  #collection = [];
  dispose() {
    this.#collection = null;
  }
  /**
   * @description Get an immutable copy of the collection.
   * We return it as read only to prevent the caller from modifying the collection.
   * @returns {Readonly<*[]>}
   */
  get() {
    return Object.freeze(this.#collection);
  }
  /**
   * @description Set the collection.
   * @param collection
   */
  set(collection) {
    if (!Array.isArray(collection)) {
      throw new Error("Collection must be an array");
    }
    for (let column of collection) {
      if (column.title == null || column.field == null) {
        throw new Error("Column title and field are required");
      }
      column.title ||= assertRequired(column.title, "data-grid2.columns.set", "Column title is required", false, "string");
      column.field ||= assertRequired(column.field, "data-grid2.columns.set", "Column field is required", false, "string");
      column.dataType ||= DataType.STRING;
      column.isReadOnly = column.isReadOnly ?? true;
      column.width ||= DEFAULT_WIDTH;
      column.align ||= DEFAULT_ALIGN;
      column.sortable ||= DEFAULT_SORTABLE;
      column.sortDirection ||= DEFAULT_SORT_DIRECTION;
      column.groupId ||= null;
    }
    this.#collection = collection;
    return this;
  }
  /**
   * Add column to collection
   * @param title - column title - default is empty string
   * @param field - column field name - default is empty string
   * @param dataType - column data type - default is string
   * @param isReadOnly - is column read only - default is true
   * @param width - column width in pixels - default is 100px
   * @param align - column text alignment - default is left
   * @param sortable - is column sortable - default is true
   * @param sortDirection - column sort direction - default is none
   */
  add(title, field, dataType = DataType.STRING, isReadOnly = true, width = DEFAULT_WIDTH, align = DEFAULT_ALIGN, sortable = DEFAULT_SORTABLE, sortDirection = DEFAULT_SORT_DIRECTION) {
    this.#collection.push(Column.create(title, field, dataType, isReadOnly, width, align, sortable, sortDirection));
  }
  /**
   * Create css grid column template string
   * @returns {string}
   */
  to(type) {
    switch (type) {
      case ConversionType.CSS: {
        return toCSS(this.#collection);
      }
      case ConversionType.JSON: {
        return toJSON(this.#collection);
      }
      case ConversionType.HTML: {
        return toHTML(this.#collection);
      }
      default:
        throw new Error(`Invalid conversion type [Columns.to] - ${type}`);
    }
  }
  /**
   * @description Generate a new instance of Columns from a source
   * @param type - conversion type - JSON, HTML
   * @param source - source data to convert from - JSON object or parent HTML element to query
   * @returns {Columns|null}
   */
  static from(type, source) {
    const result = new Columns();
    switch (type) {
      case ConversionType.JSON: {
        return result.set(fromJSON(source));
      }
      case ConversionType.HTML: {
        return result.set(fromHTML(source));
      }
      default:
        return null;
    }
  }
}
function toCSS(collection) {
  let stack = [];
  let currentItem = {
    width: 0,
    count: 0
  };
  for (let column of collection) {
    if (column.width === currentItem.width) {
      currentItem.count++;
      if (collection.indexOf(column) === collection.length - 1) {
        stack.push(`repeat(${currentItem.count}, ${currentItem.width}px)`);
      }
    } else {
      if (currentItem.count > 0) {
        stack.push(`repeat(${currentItem.count}, ${currentItem.width}px)`);
        currentItem.width = 0;
        currentItem.count = 0;
      } else {
        currentItem.width = column.width;
        currentItem.count = 1;
      }
    }
  }
  return stack.join(" ");
}
function toJSON(collection) {
  return JSON.stringify(collection);
}
function fromJSON(json) {
  return JSON.parse(json);
}
function toHTML(collection) {
  let stack = [];
  for (let column of collection) {
    stack.push(`<div>${column.title}</div>`);
  }
  return stack.join("");
}
function fromHTML(parentElement) {
  const columnElements = parentElement.querySelectorAll("column");
  const columns = [];
  for (let columnElement of columnElements) {
    const column = Column.from(ConversionType.HTML, columnElement);
    columns.push(column);
  }
  return columns;
}
export {
  Columns
};
