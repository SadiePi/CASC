/* eslint-disable no-undef */
import P5 from "p5";
import * as CASC from "./CASC";

const sketch = (p5: P5) => {
  // Utilizes every atomic construction as a proof of validity
  const C = new CASC.Construction(p5);

  // Draws a hexagon
  const hexagon = new CASC.Construction(p5);

  // Draws the flag of Nepal, as defined by construction in Nepalese law
  // WIP, the libraray can't currently handle all of it
  //const nepaleseFlag = new CASC.Construction(p5); // TODO: https://www.servat.unibe.ch/icl/np01000_.html

  const upv = p5.createVector(),
    lv = p5.createVector(),
    mv = p5.createVector();

  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.background(0);

    let noise = (time: number): P5.Vector => {
      return p5
        .createVector(p5.noise(time / 1000), p5.noise(0, time / 1000))
        .sub(0.5, 0.5)
        .mult(200);
    };

    /*C.addPoint("up", , true)
      .addPoint("down", p5.createVector(0, -100), true)
      .addPoint("right", p5.createVector(100, 0), true)
      .addPoint("left", lv, true)
      .addLine("horiz", "left", "right", false, true)
      .addLine("verti", "down", "up", false, true)
      .addLine("ld", "left", "down", false, true)
      .addLinesIntersectionPoint("center", "horiz", "verti", true)
      .addCircle("circ", "right", "up", true)
      .addLineCircleIntersectionPoint("c1", "ld", "circ", true, true)
      .addLineCircleIntersectionPoint("c2", "ld", "circ", false, true)
      .addCircle("circ2", "c1", "center", true)
      .addCirclesIntersectionPoint("ci1", "circ", "circ2", true, true)
      .addCirclesIntersectionPoint("ci2", "circ", "circ2", false, true)
      .addLine("cil", "ci1", "ci2", false, true)
      .addMidpoint("pbp", "left", "ci2", true);*/

    hexagon
      .addPoint("O", p5.createVector(0, 0), false)
      .addPoint("U", noise, false)
      .addLine("OU", "O", "U", true, false)
      .addCircle("C", "O", "U", false)
      .addLineCircleIntersectionPoint("A", "OU", "C", true, true)
      .addLineCircleIntersectionPoint("D", "OU", "C", false, true)
      .addCircle("C1", "A", "O", false)
      .addCircle("C2", "D", "O", false)
      .addCirclesIntersectionPoint("B", "C", "C1", false, true)
      .addCirclesIntersectionPoint("C", "C", "C2", true, true)
      .addCirclesIntersectionPoint("E", "C", "C2", false, true)
      .addCirclesIntersectionPoint("F", "C", "C1", true, true)
      .addLine("AB", "A", "B", true, true)
      .addLine("BC", "B", "C", true, true)
      .addLine("CD", "C", "D", true, true)
      .addLine("DE", "D", "E", true, true)
      .addLine("EF", "E", "F", true, true)
      .addLine("FA", "F", "A", true, true);
  };

  p5.draw = () => {
    p5.background(0);
    p5.fill(255);
    p5.stroke(255);
    p5.translate(p5.width / 2, p5.height / 2);

    mv.set(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2);

    // Note that the construction is only being defined once, and all the drawing is based off that
    //C.draw();
    hexagon.draw();
    //heptadecagon.draw();
    //nepaleseFlag.draw();
  };
};

new P5(sketch);
