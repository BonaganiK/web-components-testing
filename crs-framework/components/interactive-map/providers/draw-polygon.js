import DrawPolyBase from "./draw-poly-base.js";
class DrawPolygon extends DrawPolyBase {
  get shapeKey() {
    return "polygon";
  }
}
export {
  DrawPolygon as default
};
