/**
 * CASC.ts, by Sadie Dotzler (https://github.com/SadiePi)
 *
 * Leverages p5.js to enable the easy construction and visualization of compass
 * and straightedge constructions
 */

import P5 from "p5";
import * as Collections from "typescript-collections";

// TODO maybe stop using createVector so much ; create them once then use set()

export abstract class Point {
  private calced = false;
  private _vector: P5.Vector;
  protected abstract calcVector(): P5.Vector;
  reset() {
    this.calced = false;
  }

  getVector(): P5.Vector {
    if (!this.calced) {
      this._vector = this.calcVector();
      this.calced = true;
    }
    return this._vector;
  }
  constructor(public p5: P5, public visible: boolean) {}
  draw() {
    if (!this.visible) return;

    let p = this.getVector();
    if (p == null) return;
    this.p5.circle(p.x, p.y, 5);
  }
}

class FreePoint extends Point {
  constructor(
    public p5: P5,
    public vector: P5.Vector | ((time: number) => P5.Vector),
    public visible: boolean
  ) {
    super(p5, visible);
  }
  calcVector() {
    if (typeof this.vector === "function") return this.vector(this.p5.millis());
    return this.vector;
  }
}

/**
 * A straight line through 2 points.
 *
 * @param p5 The P5 object with which to associate this line
 * @param point1 The first point through which this line will pass
 * @param point2 The second point through which this line will pass
 * @param segment asdf
 * @param visible Whether or not to render this line
 */
export class Line {
  constructor(
    public p5: P5,
    public point1: Point,
    public point2: Point,
    public segment: boolean,
    public visible: boolean
  ) {}
  draw() {
    if (!this.visible) return;
    let p1 = this.point1.getVector();
    let p2 = this.point2.getVector();
    if (p1 == null || p2 == null) return;
    if (this.segment) {
      this.p5.line(p1.x, p1.y, p2.x, p2.y);
    } else {
      let dia_len = this.p5.createVector(this.p5.width, this.p5.height).mag();
      let dir_v = P5.Vector.sub(p2, p1).setMag(dia_len);
      let lp1 = P5.Vector.add(p1, dir_v);
      let lp2 = P5.Vector.sub(p1, dir_v);

      this.p5.line(lp1.x, lp1.y, lp2.x, lp2.y);
    }
  }
}

class LinesIntersectionPoint extends Point {
  constructor(
    public p5: P5,
    public line1: Line,
    public line2: Line,
    public visible: boolean
  ) {
    super(p5, visible);
  }
  calcVector() {
    let p1 = this.line1.point1.getVector();
    let p2 = this.line1.point2.getVector();
    let p3 = this.line2.point1.getVector();
    let p4 = this.line2.point2.getVector();

    if (p1 == null || p2 == null || p3 == null || p4 == null) return null;

    let den = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (den === 0) return null;
    let num1 = p1.x * p2.y - p1.y * p2.x;
    let num2 = p3.x * p4.y - p3.y * p4.x;
    let x = (num1 * (p3.x - p4.x) - (p1.x - p2.x) * num2) / den;
    let y = (num1 * (p3.y - p4.y) - (p1.y - p2.y) * num2) / den;
    return this.p5.createVector(x, y);
  }
}

// TODO make this not suck
class Arc {
  constructor(
    public p5: P5,
    public center: Point,
    public edge1: Point,
    public edge2: Point,
    public visible: boolean
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
    this.p5.noFill();
    this.p5.arc(c.x, c.y, 2 * r, 2 * r, theta1, theta2);
    this.p5.fill(255);
  }
}

/**
 * A circle theoretically drawn by positioning a compass at 'center' and
 * opening it to 'edge'.
 *
 * @param p5 The P5 object with which to associate this point
 * @param center The point that defines the center of this circle
 * @param edge A point on the edge of this circle, defining its radius
 * @param visible Whether or not to render this line
 */
export class Circle {
  constructor(
    public p5: P5,
    public center: Point,
    public edge: Point,
    public visible: boolean
  ) {}
  draw() {
    if (!this.visible) return;
    let center = this.center.getVector();
    let edge = this.edge.getVector();
    if (center == null || edge == null) return;
    this.p5.noFill();
    this.p5.circle(center.x, center.y, 2 * P5.Vector.dist(edge, center));
    this.p5.fill(255);
  }
}

/**
 * A point defined by the intersection of a line and a circle. If they don't
 * intersect, getVector() will return null. If they are tangent, it will
 * return that tangent point. If they intersect at 2 points, it will return
 * one of those points, decided by the value of 'toggle'.
 *
 * @param p5 The P5 object with which to associate this point
 * @param line The line whose intersection with 'circle' defines this point
 * @param circle The circle whose intersection with 'line' defines this point
 * @param toggle Whether or not to return the second of two intersections
 * @param visible Whether or not to render this point
 */
class LineCircleIntersectionPoint extends Point {
  constructor(
    public p5: P5,
    public line: Line,
    public circle: Circle,
    public toggle: boolean,
    public visible: boolean
  ) {
    super(p5, visible);
  }
  calcVector() {
    let c = this.circle.center.getVector();
    let e = this.circle.edge.getVector();
    if (c == null || e == null) return null;
    let r = P5.Vector.dist(e, c);

    let p1 = P5.Vector.sub(this.line.point1.getVector(), c);
    let p2 = P5.Vector.sub(this.line.point2.getVector(), c);
    let d = P5.Vector.sub(p2, p1);
    let drSq = d.magSq();
    let det = p1.x * p2.y - p2.x * p1.y;

    let discriminant = r * r * drSq - det * det;
    if (discriminant < 0) return null;
    /*if (discriminant === 0)
      return this.p5.createVector(
        (det * d.y) / det + c.x,
        (-det * d.x) / det + c.y
      );*/
    let discSqrt = this.p5.sqrt(discriminant);
    let sgn = d.y < 0 ? -1 : 1;
    let toggle = this.toggle ? -1 : 1;
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
    public visible: boolean
  ) {
    super(p5, visible);
  }

  calcVector() {
    let c1 = this.circle1.center.getVector();
    let e1 = this.circle1.edge.getVector();
    let c2 = this.circle2.center.getVector();
    let e2 = this.circle2.edge.getVector();
    if (c1 == null || e1 == null || c2 == null || e2 == null) return null;

    let r1 = P5.Vector.dist(c1, e1);
    let r2 = P5.Vector.dist(c2, e2);

    let d = P5.Vector.sub(c1, c2).mag();
    let l = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    let h = this.p5.sqrt(r1 * r1 - l * l);
    if (this.toggle) h = -h;

    let ret = P5.Vector.sub(c2, c1)
      .mult(l / d)
      .add(c1);
    let mod = P5.Vector.sub(c2, c1).mult(h / d);
    mod.set(mod.y, -mod.x);
    return P5.Vector.add(ret, mod);
  }
}

export class Construction {
  // TODO refactor to Collections.Dictionary<String, Point|Line|Circle>()
  private pts = new Collections.Dictionary<String, Point>();
  private lines = new Collections.Dictionary<String, Line>();
  private circs = new Collections.Dictionary<String, Circle>();

  public intermediatesVisible: boolean = false;

  constructor(public p5: P5) {}

  draw() {
    let pts = this.pts.values();
    let lines = this.lines.values();
    let circs = this.circs.values();

    for (let o = 0; o < pts.length; o++) {
      pts[o].reset();
      pts[o].draw();
    }

    for (let o = 0; o < lines.length; o++) lines[o].draw();
    for (let o = 0; o < circs.length; o++) circs[o].draw();
  }

  // TODO support adding user-constructed points lines and circles

  /**
   * Adds to the construction an idealized point, with position technically
   * defined by a P5.Vector but theoretically independant of any unit system.
   *
   * To be a true compass-and-straightedge construction, THIS VECTOR MUST NOT
   * BE USED IN ANY WAY except defining the position of this point. Further
   * construction definitions should only use operations on Points, Lines, and
   * Circles, and will be computed automatically based on the vectors
   * of their relevant points.
   *
   * If a point is defined in such a way that it doesn't exist (e.g. as
   * the intersection of two parallel lines), neither the point nor any
   * further constructions based on the point will be drawn.
   * @param name The name by which to access this point
   * @param vector The vector defining the position of this point, or a function of time returning a vector
   * @param visible Whether or not to draw this point
   * @chainable
   */
  addPoint(
    name: String,
    vector: P5.Vector | ((time: number) => P5.Vector),
    visible: boolean
  ): Construction {
    this.pts.setValue(name, new FreePoint(this.p5, vector, visible));
    return this;
  }

  /**
   * Adds to the construction a straight, infinite line through 2 points
   * @param name The name by which to access this line
   * @param point1 The first point this line intersects with
   * @param point2 The second point this line intersects with
   * @param segment Whether or not to draw this line as a segement ending at each of its defining points
   * @param visible Whether or not to draw this line
   * @chainable
   */
  addLine(
    name: String,
    point1: String,
    point2: String,
    segment: boolean,
    visible: boolean
  ): Construction {
    this.lines.setValue(
      name,
      new Line(
        this.p5,
        this.pts.getValue(point1),
        this.pts.getValue(point2),
        segment,
        visible
      )
    );
    return this;
  }

  /**
   * Adds to the construction a circle
   * @param name The name by which to access this circle
   * @param center The point that defines the center of this circle
   * @param edge A point on the edge of this circle, defining its radius
   * @param visible Whether or not to draw this circle
   * @chainable
   */
  addCircle(
    name: String,
    center: String,
    edge: String,
    visible: boolean
  ): Construction {
    this.circs.setValue(
      name,
      new Circle(
        this.p5,
        this.pts.getValue(center),
        this.pts.getValue(edge),
        visible
      )
    );
    return this;
  }

  // TODO refactor all these addBlaIntersectionPoint to
  //  addIntersectionPoint(Line|Circle,Line|Circle,toggle)

  /**
   * Adds to the construction a point defined by the intersection of two lines
   * @param name The name by which to access this point
   * @param line1 The first line that passes through this point
   * @param line2 The second line that passes through this point
   * @param visible Whether or not to draw this line
   * @chainable
   */
  addLinesIntersectionPoint(
    name: String,
    line1: String,
    line2: String,
    visible: boolean
  ): Construction {
    this.pts.setValue(
      name,
      new LinesIntersectionPoint(
        this.p5,
        this.lines.getValue(line1),
        this.lines.getValue(line2),
        visible
      )
    );
    return this;
  }

  /**
   * Adds to the construction a point defined by the intersection between a
   * line and a circle. If two such points exist, the decision of which one
   * to add by this name is controlled by 'toggle'
   * @param name The name by which to access this point
   * @param line The line that passes through this point
   * @param circle The circle that passes through this point
   * @param toggle If 2 intersection points, decides which one to add
   * @param visible Whether or not to draw this point
   * @chainable
   */
  addLineCircleIntersectionPoint(
    name: String,
    line: String,
    circle: String,
    toggle: boolean,
    visible: boolean
  ): Construction {
    this.pts.setValue(
      name,
      new LineCircleIntersectionPoint(
        this.p5,
        this.lines.getValue(line),
        this.circs.getValue(circle),
        toggle,
        visible
      )
    );
    return this;
  }
  /**
   * Adds to the construction a point defined by the intersection between
   * two circles. If two such points exist, the decision of which one
   * to add by this name is controlled by 'toggle'
   * @param name The name by which to access this point
   * @param circle The first circle that passes through this point
   * @param circle The second circle that passes through this point
   * @param toggle If 2 intersection points, decides which one to add
   * @param visible Whether or not to draw this point
   * @chainable
   */
  addCirclesIntersectionPoint(
    name: String,
    circle1: String,
    circle2: String,
    toggle: boolean,
    visible: boolean
  ): Construction {
    this.pts.setValue(
      name,
      new CirclesIntersectionPoint(
        this.p5,
        this.circs.getValue(circle1),
        this.circs.getValue(circle2),
        toggle,
        visible
      )
    );
    return this;
  }

  /**
   *
   * @param name The name by which to access this point
   * @param point1 The first point of the two to bisect
   * @param point2 The second point of the two to bisect
   * @param visible Whether or not to draw this point
   * @chainable
   */
  addPerpindicularBisector(
    name: String,
    point1: String,
    point2: String,
    visible: boolean
  ): Construction {
    return this.addCircle(
      name + "c1",
      point1,
      point2,
      this.intermediatesVisible
    )
      .addCircle(name + "c2", point2, point1, this.intermediatesVisible)
      .addCirclesIntersectionPoint(
        name + "p1",
        name + "c1",
        name + "c2",
        false,
        this.intermediatesVisible
      )
      .addCirclesIntersectionPoint(
        name + "p2",
        name + "c1",
        name + "c2",
        true,
        this.intermediatesVisible
      )
      .addLine(name, name + "p1", name + "p2", false, visible);
  }

  addMidpoint(
    name: String,
    point1: String,
    point2: String,
    visible: boolean
  ): Construction {
    return this.addLine(
      name + "l",
      point1,
      point2,
      true,
      this.intermediatesVisible
    )
      .addPerpindicularBisector(
        name + "pb",
        point1,
        point2,
        this.intermediatesVisible
      )
      .addLinesIntersectionPoint(name, name + "l", name + "pb", visible);
  }

  addErectedPerpindicular(
    name: String,
    point: String,
    line: String,
    pointOnLine: String,
    visible: boolean,
    intermediatesVisible: boolean
  ): Construction {
    return this.addCircle(
      name + "_c1",
      point,
      pointOnLine,
      intermediatesVisible
    )
      .addLineCircleIntersectionPoint(
        name + "_p1",
        line,
        name + "_c1",
        false,
        intermediatesVisible
      )
      .addLineCircleIntersectionPoint(
        name + "_p2",
        line,
        name + "_c1",
        true,
        intermediatesVisible
      )
      .addCircle(name + "_c2", name + "_p1", name + "_p2", intermediatesVisible)
      .addCircle(name + "_c3", name + "_p2", name + "_p1", intermediatesVisible)
      .addCirclesIntersectionPoint(
        name + "_p3",
        name + "_c2",
        name + "_c3",
        false,
        intermediatesVisible
      )
      .addLine(name, name + "p3", point, false, visible);
  }

  addCircumcenter(
    name: String,
    point1: String,
    point2: String,
    point3: String,
    visible: boolean,
    intermediatesVisible: boolean
  ): Construction {
    return this.addPerpindicularBisector(
      name + "pb1",
      point1,
      point2,
      intermediatesVisible
    )
      .addPerpindicularBisector(
        name + "pb2",
        point1,
        point3,
        intermediatesVisible
      )
      .addLinesIntersectionPoint(name, name + "pb1", name + "pb2", visible);
  }

  // TODO make this not suck
  addAngleBisector(
    name: String,
    point1: String,
    point2: String,
    point3: String,
    segment: boolean,
    visible: boolean
  ): Construction {
    return this.addCircle(
      name + "c1",
      point2,
      point1,
      this.intermediatesVisible
    )
      .addCircle(name + "c2", point2, point3, this.intermediatesVisible)
      .addCirclesIntersectionPoint(
        name + "p1",
        name + "c1",
        name + "c2",
        false,
        this.intermediatesVisible
      )
      .addLine(name, point2, name + "p1", segment, visible);
  }
}
