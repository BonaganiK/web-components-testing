import { assertRequired } from "../../../src/utils/assertRequired.js";
import { Alignment } from "./enums/alignment.js";
import { SortDirection } from "./enums/sort-direction.js";
import { DataType } from "./enums/data-type.js";
import { DEFAULT_WIDTH, DEFAULT_ALIGN, DEFAULT_SORTABLE, DEFAULT_SORT_DIRECTION } from "./defaults.js";
import { ConversionType } from "./enums/conversion-type.js";
class Column {
  /**
   * Factory method to create a column object
   * @param title {string} - column title
   * @param field {string} - column field name
   * @param dataType {DataType} - column data type - default is DataType.STRING
   * @param isReadOnly {boolean} - is column read only - default is true
   * @param width {number} - column width in pixels - default is 100px
   * @param align {Alignment} - column text alignment - default is left
   * @param sortable {boolean} - is column sortable - default is true
   * @param sortDirection {SortDirection} - column sort direction - default is none
   * @param groupId {string} - column group id - default is null
   * @returns {{sortDirection: string, isReadOnly: boolean, field, dataType: string, width: number, sortable: boolean, title, align: string, groupId: null}}
   */
  static create(title, field, dataType = DataType.STRING, isReadOnly = true, width = DEFAULT_WIDTH, align = DEFAULT_ALIGN, sortable = DEFAULT_SORTABLE, sortDirection = DEFAULT_SORT_DIRECTION, groupId = null) {
    return {
      title: assertRequired(title, "Column.create", "Column title is required"),
      field: assertRequired(field, "Column.create", "Column field is required"),
      dataType,
      isReadOnly,
      width,
      align,
      sortable,
      sortDirection,
      groupId
    };
  }
  /**
   * Generate a new instance of Column from an element as source
   * <column data-title="title" data-field="field" ...>
   * @param conversionType
   * @param source
   * @returns {{sortDirection: (*|string), isReadOnly: (*|boolean), field, dataType: string, groupId: (string|string|string|string[]|ConstrainDOMStringParameters|boolean|*|null), width: (number|number), sortable: boolean, title, align: string}}
   */
  static from(conversionType, source) {
    if (conversionType === ConversionType.HTML) {
      return fromHTML(source);
    }
  }
}
function fromHTML(source) {
  return {
    title: assertRequired(source.dataset.title, "Column.from", "Column title is required"),
    field: assertRequired(source.dataset.field, "Column.from", "Column field is required"),
    dataType: source.dataset.dataType ?? DataType.STRING,
    isReadOnly: (source.dataset.isReadOnly ?? "").toLowerCase() === "true",
    width: parseInt(source.dataset.width) ?? DEFAULT_WIDTH,
    align: source.dataset.align ?? DEFAULT_ALIGN,
    sortable: source.dataset.sortable === "true",
    sortDirection: source.dataset.sortDirection ?? DEFAULT_SORT_DIRECTION,
    groupId: source.dataset.groupId ?? null
  };
}
export {
  Column
};
