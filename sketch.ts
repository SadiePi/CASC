/* eslint-disable no-undef */
import P5 from "p5";
import * as CASC from "./lib/CASC";

const sketch = (p5: P5) => {
  let C: CASC.Construction, hexagon: CASC.Construction;

  // Draws the flag of Nepal, as defined by construction in Nepalese law
  // WIP, the libraray can't currently handle all of it
  //const nepaleseFlag = new CASC.Construction(p5); // TODO: https://www.servat.unibe.ch/icl/np01000_.html

  const lv = p5.createVector(-100, 0),
    mouse = p5.createVector();

  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.background(0);

    C = new CASC.Construction(p5)
      .addPoint("mouse", mouse, true)
      .addPoint("up", p5.createVector(0, -100))
      .addPoint("right", p5.createVector(100, 0))
      .addPoint("left", lv)
      .addLine("horiz", "left", "right")
      .addLine("verti", "up", "mouse")
      .addLine("lu", "left", "up")
      .addIntersection("center", "horiz", "verti")
      .addCircle("circ", "right", "mouse")
      .addIntersection("c1", "lu", "circ", true)
      .addIntersection("c2", "lu", "circ", false)
      .addCircle("circ2", "c1", "center")
      .addIntersection("ci1", "circ", "circ2", true)
      .addIntersection("ci2", "circ", "circ2", false)
      .addLine("cil", "ci1", "ci2")
      .addMidpoint("pbp", "left", "ci2")
      .addCircumcenter("cc", "up", "center", "left")
      .addLine("pbpcc", "pbp", "cc", true, true, p5.color("gold"));

    hexagon = new CASC.Construction(p5, false, p5.color("RebeccaPurple"))
      .addPoint("O", p5.createVector(0, 0))
      .addPoint("U", mouse)
      .addLine("OU", "O", "U")
      .addCircle("Cir", "O", "U")
      .addIntersection("A", "OU", "Cir", true)
      .addIntersection("D", "OU", "Cir", false)
      .addCircle("C1", "A", "O")
      .addCircle("C2", "D", "O")
      .addIntersection("B", "Cir", "C1", false)
      .addIntersection("C", "Cir", "C2", true)
      .addIntersection("E", "Cir", "C2", false)
      .addIntersection("F", "Cir", "C1", true)
      .addLine("AB", "A", "B", true, true, p5.color("hotpink"))
      .addLine("BC", "B", "C", true, true)
      .addLine("CD", "C", "D", true, true, p5.color("hotpink"))
      .addLine("DE", "D", "E", true, true)
      .addLine("EF", "E", "F", true, true, p5.color("hotpink"))
      .addLine("FA", "F", "A", true, true);
  };

  p5.draw = () => {
    p5.clear();
    p5.background(0);
    p5.stroke(255);
    p5.text(Math.round(10 * p5.frameRate()) / 10, 10, 10);
    p5.translate(p5.width / 2, p5.height / 2);

    mouse.set(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2);

    // Note that the construction is only being defined once, and all the drawing is based off that
    C.draw();
    hexagon.draw();
    //nepaleseFlag.draw();
    //heptadecagon.draw();
  };
};

new P5(sketch);
