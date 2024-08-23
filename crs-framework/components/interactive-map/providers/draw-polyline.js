import DrawPolyBase from "./draw-poly-base.js";
class DrawPolyline extends DrawPolyBase {
  get shapeKey() {
    return "polyline";
  }
  get minPoints() {
    return 2;
  }
  get closeShape() {
    return false;
  }
}
export {
  DrawPolyline as default
};
