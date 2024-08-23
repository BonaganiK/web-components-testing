import "/crs-framework/packages/crs-binding/crs-binding.js";
import "/crs-framework/packages/crs-binding/classes/bindable-element.js";
import "/crs-framework/packages/crs-binding/events/event-emitter.js";
import "/crs-framework/packages/crs-binding/expressions/code-factories/if.js";

import "/crs-framework/packages/crs-modules/crs-modules.js";
import "/crs-framework/packages/crs-router/crs-router.js";


import {initialize} from "./crs-framework/packages/crs-process-api/crs-process-api.js";
initialize("/crs-framework/packages/crs-process-api");
await import("/crs-framework/packages/crs-process-api/components/view-loader/view-loader.js");


export class IndexViewModel {
    #bid;

    get bid() {
        return this.#bid;
    }

    constructor() {
        this.#bid = crs.binding.data.addObject(this.constructor.name);
        crs.binding.data.addContext(this.#bid, this);
        crs.binding.parsers.parseElements(document.body.children, this);
    }
}

globalThis.indexViewModel = new IndexViewModel();