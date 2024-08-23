import {createMockChildren} from "./child-mock-factory.js";
import {ElementMock, mockElement} from "./element-mock.js";

export class TemplateMock {
    constructor(innerHTML) {
        this.content = new ElementMock("template")
        this.content.innerHTML = innerHTML;
        createMockChildren(this.content);
    }
}