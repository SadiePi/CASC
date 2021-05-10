/**
 * CASC.ts, by Sadie Dotzler (https://github.com/SadiePi)
 *
 * A small library on top of p5.js for creating compass and straightedge constructions
 */

import p5 from "p5";
import P5 from "p5";
import * as Collections from "typescript-collections";

export abstract class Point {
  private _vector: P5.Vector = null;
  constructor(public p5: P5, public visible: boolean, public color: p5.Color) {}

  draw() {
    const p = this.getVector();
    if (p == null) return;

    this.p5.stroke(this.color);
    this.p5.fill(this.color);
    this.p5.circle(p.x, p.y, 5);
  }

  reset() {
    this._vector = null;
  }

  getVector(): P5.Vector {
    if (this._vector == null) this._vector = this.calcVector();
    return this._vector;
  }

  protected abstract calcVector(): P5.Vector;
}

class FreePoint extends Point {
  constructor(
    public p5: P5,
    public vector: P5.Vector | ((time: number) => P5.Vector),
    public visible: boolean,
    public color: p5.Color
  ) {
    super(p5, visible, color);
  }

  calcVector() {
    if (typeof this.vector === "function") return this.vector(this.p5.millis());
    return this.vector;
  }
}

export class Line {
  constructor(
    public p5: P5,
    public point1: Point,
    public point2: Point,
    public segment: boolean,
    public visible: boolean,
    public color: p5.Color
  ) {}
  draw() {
    const p1 = this.point1.getVector();
    const p2 = this.point2.getVector();
    if (p1 == null || p2 == null) return;

    this.p5.stroke(this.color);
    this.p5.fill(this.color);
    if (this.segment) {
      this.p5.line(p1.x, p1.y, p2.x, p2.y);
    } else {
      const dia_len = this.p5.createVector(this.p5.width, this.p5.height).mag();
      const dir_v = P5.Vector.sub(p2, p1).setMag(dia_len);
      const lp1 = P5.Vector.add(p1, dir_v);
      const lp2 = P5.Vector.sub(p1, dir_v);

      this.p5.line(lp1.x, lp1.y, lp2.x, lp2.y);
    }
  }
}

class LinesIntersectionPoint extends Point {
  constructor(
    public p5: P5,
    public line1: Line,
    public line2: Line,
    public visible: boolean,
    public color: p5.Color
  ) {
    super(p5, visible, color);
  }
  calcVector() {
    const p1 = this.line1.point1.getVector();
    const p2 = this.line1.point2.getVector();
    const p3 = this.line2.point1.getVector();
    const p4 = this.line2.point2.getVector();
    if (p1 == null || p2 == null || p3 == null || p4 == null) return null;

    const den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (den === 0) return null;
    const num1 = p1.x * p2.y - p1.y * p2.x;
    const num2 = p3.x * p4.y - p3.y * p4.x;
    const x = (num1 * (p3.x - p4.x) - (p1.x - p2.x) * num2) / den;
    const y = (num1 * (p3.y - p4.y) - (p1.y - p2.y) * num2) / den;
    return this.p5.createVector(x, y);
  }
}

// TODO make this not suck
/*class Arc {
  constructor(
    public p5: P5,
    public center: Point,
    public edge1: Point,
    public edge2: Point,
    public visible: boolean,
    public color: p5.Color
  ) {}

  getAngle1(e1: P5.Vector, e2: P5.Vector, c: P5.Vector): number {
    return P5.Vector.sub(e1, c).angleBetween(P5.Vector.sub(e2, c));
  }

  draw() {
    if (!this.visible) return;
    let e1 = this.edge1.getVector();
    let e2 = this.edge2.getVector();
    let c = this.center.getVector();
    if (e1 == null || e2 == null || c == null) return;
    let r = P5.Vector.dist(e1, c);
    if (r !== P5.Vector.dist(e2, c)) return;
    let theta1 = P5.Vector.sub(e1, c).angleBetween(P5.Vector.sub(e2, c));
    let theta2 = P5.Vector.sub(e1, c).angleBetween(P5.Vector.sub(e2, c));

    this.p5.stroke(this.color);
    this.p5.fill(this.color);
    this.p5.arc(c.x, c.y, 2 * r, 2 * r, theta1, theta2);
  }
}*/

export class Circle {
  constructor(
    public p5: P5,
    public center: Point,
    public edge: Point,
    public visible: boolean,
    public color: p5.Color
  ) {}
  draw() {
    const center = this.center.getVector();
    const edge = this.edge.getVector();
    if (center == null || edge == null) return;

    this.p5.noFill();
    this.p5.stroke(this.color);
    this.p5.circle(center.x, center.y, 2 * P5.Vector.dist(edge, center));
  }
}

class LineCircleIntersectionPoint extends Point {
  constructor(
    public p5: P5,
    public line: Line,
    public circle: Circle,
    public toggle: boolean,
    public visible: boolean,
    public color: p5.Color
  ) {
    super(p5, visible, color);
  }
  calcVector() {
    const c = this.circle.center.getVector();
    const e = this.circle.edge.getVector();
    if (c == null || e == null) return null;
    const r = P5.Vector.dist(e, c);

    const p1 = P5.Vector.sub(this.line.point1.getVector(), c);
    const p2 = P5.Vector.sub(this.line.point2.getVector(), c);
    const d = P5.Vector.sub(p2, p1);
    const drSq = d.magSq();
    const det = p1.x * p2.y - p2.x * p1.y;

    const discriminant = r * r * drSq - det * det;
    if (discriminant < 0) return null;
    // We don't need to check for discriminant==0 because
    //  even if it is, the following will handle it just fine anyway
    const discSqrt = this.p5.sqrt(discriminant);
    const sgn = d.y < 0 ? -1 : 1;
    const toggle = this.toggle ? -1 : 1;
    return P5.Vector.add(
      this.p5.createVector(
        (det * d.y + toggle * sgn * d.x * discSqrt) / drSq,
        (-det * d.x + toggle * this.p5.abs(d.y) * discSqrt) / drSq
      ),
      c
    );
  }
}

/**
 * A point defined by the intersection of 2 circles. If they don't
 * intersect, getVector() will return null. If they are tangent, it will
 * return that tangent point. If they intersect at 2 points, it will return
 * one of those points, decided by the value of 'toggle'.
 *
 * @param p5 The P5 object with which to associate this point
 * @param circle1 The circle whose intersection with 'circle2' defines this point
 * @param circle2 The circle whose intersection with 'circle1' defines this point
 * @param toggle Whether or not to return the second of two intersections
 * @param visible Whether or not to render this point
 */
class CirclesIntersectionPoint extends Point {
  constructor(
    public p5: P5,
    public circle1: Circle,
    public circle2: Circle,
    public toggle: boolean,
    public visible: boolean,
    public color: p5.Color
  ) {
    super(p5, visible, color);
  }

  calcVector() {
    const c1 = this.circle1.center.getVector();
    const e1 = this.circle1.edge.getVector();
    const c2 = this.circle2.center.getVector();
    const e2 = this.circle2.edge.getVector();
    if (c1 == null || e1 == null || c2 == null || e2 == null) return null;

    const r1 = P5.Vector.dist(c1, e1);
    const r2 = P5.Vector.dist(c2, e2);

    const d = P5.Vector.sub(c1, c2).mag();
    const l = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const hSq = r1 * r1 - l * l;
    if (hSq < 0) return null;
    const h = this.p5.sqrt(hSq) * (this.toggle ? 1 : -1);

    const ret = P5.Vector.sub(c2, c1)
      .mult(l / d)
      .add(c1);
    const mod = P5.Vector.sub(c2, c1).mult(h / d);
    mod.set(mod.y, -mod.x);
    return P5.Vector.add(ret, mod);
  }
}

/**
 * A compass and straightedge construction. Contains many methods for
 * adding complex constructions in a single call. Pull requests for more
 * constructions welcome!
 */
export class Construction {
  private objects = new Collections.Dictionary<String, Point | Line | Circle>();

  constructor(
    public p5: P5,
    public intermediatesVisible: boolean = false,
    public defaultColor: p5.Color = p5.color("white")
  ) {}

  draw() {
    const objs = this.objects.values();

    for (let i = 0; i < objs.length; i++) {
      const o = objs[i];
      if (o instanceof Point) (o as Point).reset();
      if (this.intermediatesVisible || o.visible) o.draw();
    }
  }

  getObject(name: String): Point | Line | Circle {
    return this.objects.getValue(name);
  }

  addObject(name: String, object: Point | Line | Circle): Construction {
    this.objects.setValue(name, object);
    return this;
  }

  /**
   * Adds an idealized point, with position technically
   * defined by a P5.Vector but theoretically independant of any unit system.
   *
   * To be a true compass-and-straightedge construction, THIS VECTOR MUST NOT
   * BE USED IN ANY WAY except defining the position of this point. Further
   * construction definitions should only use operations on Points, Lines, and
   * Circles, and will be computed automatically based on the vectors
   * of their relevant points.
   *
   * If a point is defined in such a way that it doesn't exist (such as
   * the intersection of two parallel lines), neither the point nor any
   * further constructions based on the point will be drawn.
   * @param name The name by which to access this point
   * @param vector The vector defining the position of this point, or a function of time returning a vector
   * @param visible Whether or not to draw this point
   * @param color The color to draw this point with
   * @chainable
   */
  point(
    name: String,
    vector: P5.Vector | ((time: number) => P5.Vector),
    visible: boolean = false,
    color: p5.Color = this.defaultColor
  ): Construction {
    this.objects.setValue(name, new FreePoint(this.p5, vector, visible, color));
    return this;
  }
  public readonly P = this.point;

  /**
   * Adds a line defined by 2 points that it intersects
   * @param name The name by which to access this line
   * @param point1 The first point this line intersects with
   * @param point2 The second point this line intersects with
   * @param segment Whether or not to draw this line as a segement
   * @param visible Whether or not to draw this line
   * @param color The color to draw this line with
   * @chainable
   */
  line(
    name: String,
    point1: String,
    point2: String,
    visible: boolean = false,
    segment: boolean = false,
    color: p5.Color = this.defaultColor
  ): Construction {
    this.objects.setValue(
      name,
      new Line(
        this.p5,
        this.objects.getValue(point1) as Point,
        this.objects.getValue(point2) as Point,
        segment,
        visible,
        color
      )
    );
    return this;
  }
  public readonly L = this.line;

  /**
   * Adds a circle defined by its center and a point on its edge
   * @param name The name by which to access this circle
   * @param center The point that defines the center of this circle
   * @param edge A point on the edge of this circle, defining its radius
   * @param visible Whether or not to draw this circle
   * @param color The color to draw this circle with
   * @chainable
   */
  circle(
    name: String,
    center: String,
    edge: String,
    visible: boolean = false,
    color: p5.Color = this.defaultColor
  ): Construction {
    this.objects.setValue(
      name,
      new Circle(
        this.p5,
        this.objects.getValue(center) as Point,
        this.objects.getValue(edge) as Point,
        visible,
        color
      )
    );
    return this;
  }
  public readonly C = this.circle;

  /**
   * WIP gotta implement arcs first, this is just proof of concept
   * Adds an arc defined by its center and 2 point on its edge.
   * Draws counterclockwise around 'center' from 'point1' to 'point2'
   * at the center of the circle it's a part of
   * @param name The name by which to access this arc
   * @param center The point that defines the center of this arc
   * @param edge1 The first point on this arc
   * @param edge2 The second point on this arc
   * @param visible Whether or not to draw this arc
   * @param color The color to draw this arc with
   */
  arc(
    name: String,
    center: String,
    edge1: String,
    edge2: String,
    toggle: boolean,
    visible: boolean = false,
    color: p5.Color = this.defaultColor
  ): Construction {
    return this;
  }
  public readonly A = this.arc;

  /**
   * Adds a point defined by the intersection of the two given
   * objects. If two such points exist, the decision of which one
   * to add by this name is controlled by 'toggle'.
   * @param name The name by which to access this point
   * @param object1 The first object that passes through this point
   * @param object2 The second object that passes through this point
   * @param toggle If 2 intersection points, decides which one to add
   * @param visible Whether or not to draw this point
   * @param color The color to draw this point with
   */
  intersection(
    name: String,
    object1: String,
    object2: String,
    toggle: boolean = false,
    visible: boolean = false,
    color: p5.Color = this.defaultColor
  ): Construction {
    const o1 = this.objects.getValue(object1);
    const o2 = this.objects.getValue(object2);

    if (o1 instanceof Line && o2 instanceof Line)
      this.objects.setValue(
        name,
        new LinesIntersectionPoint(
          this.p5,
          o1 as Line,
          o2 as Line,
          visible,
          color
        )
      );
    else if (o1 instanceof Line && o2 instanceof Circle)
      this.objects.setValue(
        name,
        new LineCircleIntersectionPoint(
          this.p5,
          o1 as Line,
          o2 as Circle,
          toggle,
          visible,
          color
        )
      );
    else if (o1 instanceof Circle && o2 instanceof Line)
      this.objects.setValue(
        name,
        new LineCircleIntersectionPoint(
          this.p5,
          o2 as Line,
          o1 as Circle,
          toggle,
          visible,
          color
        )
      );
    else if (o1 instanceof Circle && o2 instanceof Circle)
      this.objects.setValue(
        name,
        new CirclesIntersectionPoint(
          this.p5,
          o1 as Circle,
          o2 as Circle,
          toggle,
          visible,
          color
        )
      );
    else console.error("Cannot add intersection involving Point");

    return this;
  }
  public readonly I = this.intersection;

  /**
   * Adds a line defined by the perpindicular bisector to two points
   * @param name The name by which to access this line
   * @param point1 The first point of the two to bisect
   * @param point2 The second point of the two to bisect
   * @param visible Whether or not to draw this line
   * @param color The color to draw this line with
   * @chainable
   */
  perpindicularBisector(
    name: String,
    point1: String,
    point2: String,
    visible: boolean = false,
    color: p5.Color = this.defaultColor
  ): Construction {
    return this.C(name + "#c1", point1, point2, false)
      .C(name + "#c2", point2, point1, false)
      .I(name + "#p1", name + "#c1", name + "#c2", false)
      .I(name + "#p2", name + "#c1", name + "#c2", true)
      .L(name, name + "#p1", name + "#p2", visible, false, color);
  }
  public readonly PB = this.perpindicularBisector;

  /**
   * Adds a point defined as the midpoint between two points
   * @param name The name by which to access this point
   * @param point1 The first point of the two to bisect
   * @param point2 The second point of the two to bisect
   * @param visible Whether or not to draw this point
   * @param color The color to draw this point with
   * @chainable
   */
  midpoint(
    name: String,
    point1: String,
    point2: String,
    visible: boolean = false,
    color: p5.Color = this.defaultColor
  ): Construction {
    return this.L(name + "#l", point1, point2)
      .PB(name + "#pb", point1, point2)
      .I(name, name + "#l", name + "#pb", visible, false, color);
  }
  public readonly M = this.midpoint;

  /**
   * WIP due to needing pointOnLine
   * Adds a line defined to be perpindicular to a line
   * and through a point
   * @param name The name by which to access this point
   * @param visible Whether or not to draw this point
   * @param color The color to draw this line with
   * @chainable
   */
  erectedPerpindicular(
    name: String,
    point: String,
    line: String,
    pointOnLine: String,
    visible: boolean = false,
    color: p5.Color = this.defaultColor
  ): Construction {
    return this.C(name + "#c1", point, pointOnLine, false)
      .I(name + "#p1", line, name + "#c1", false)
      .I(name + "#p2", line, name + "#c1", true)
      .C(name + "#c2", name + "#p1", name + "#p2")
      .C(name + "#c3", name + "#p2", name + "#p1")
      .I(name + "#p3", name + "#c2", name + "#c3", false)
      .L(name, name + "#p3", point, visible, false, color);
  }
  public readonly EP = this.erectedPerpindicular;

  /**
   * Adds a point defined as the circumcenter of three points
   * @param name The name by which to access this point
   * @param point1 The first point defining this point
   * @param point2 The second point defining this point
   * @param point3 The third point defining this point
   * @param visible Whether or not to draw this point
   * @param color The color to draw this point with
   */
  circumcenter(
    name: String,
    point1: String,
    point2: String,
    point3: String,
    visible: boolean = false,
    color: p5.Color = this.defaultColor
  ): Construction {
    return this.PB(name + "#pb1", point1, point2)
      .PB(name + "#pb2", point1, point3)
      .I(name, name + "#pb1", name + "#pb2", visible, false, color);
  }
  public readonly CC = this.circumcenter;

  /**
   * Adds a circle defined by 3 points on its edge
   * @param name The name by which to access this circle
   * @param point1 The first point on the circle's edge
   * @param point2 The second point on the circle's edge
   * @param point3 The third point on the circle's edge
   * @param visible Whether or not to draw this circle
   * @param color The color to draw this circle with
   */
  circleThrough3EdgePoints(
    name: String,
    point1: String,
    point2: String,
    point3: String,
    visible: boolean = false,
    color: p5.Color = this.defaultColor
  ): Construction {
    return this.CC(name + "#cc", point1, point2, point3, false).C(
      name + "#c",
      name + "#cc",
      point1,
      visible,
      color
    );
  }
  public readonly C3 = this.circleThrough3EdgePoints;

  /**
   * WIP gotta implement arcs first, this is just a proof of concept
   * Adds an arc defined by its 2 endpoints and any third point through it
   * @param name The name by which to access this arc
   * @param point1 The first endpoint of this arc
   * @param point2 A point through this arc
   * @param point3 The second endpoint of this arc
   * @param visible Whether or not to draw this arc
   * @param color The color to draw this arc with
   */
  arcThrough3EdgePoints(
    name: String,
    point1: String,
    point2: String,
    point3: String,
    visible: boolean = false,
    color: p5.Color = this.defaultColor
  ): Construction {
    let toggle = false; // TODO figure out toggle from point2

    return this.CC(name + "#cc", point1, point2, point3, false).A(
      name,
      name + "#cc",
      point1,
      point2,
      toggle,
      visible,
      color
    );
  }
  public readonly A3 = this.arcThrough3EdgePoints;

  // TODO make this not suck
  /*angleBisector(
    name: String,
    point1: String,
    point2: String,
    point3: String,
    visible: boolean = false
  ): Construction {
    return this.addCircle(
      name + "#c1",
      point2,
      point1
    )
      .C(name + "#c1", point2, point1, false)
      .C(name + "#c2", point2, point3, false)
      .I(
        name + "#p1",
        name + "#c1",
        name + "#c2",
        false
      )
      .L(name, point2, name + "#p1", segment, visible);
  }*/
}
