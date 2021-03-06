/* eslint-disable no-undef */
import P5 from "p5";
import * as CASC from "./CASC";

const sketch = (p5: P5) => {
  let C: CASC.Construction, hexagon: CASC.Construction;

  // Draws the flag of Nepal, as defined by construction in Nepalese law
  // WIP, the libraray can't currently handle all of it
  //const nepaleseFlag = new CASC.Construction(p5); // TODO: https://www.servat.unibe.ch/icl/np01000_.html

  const lv = p5.createVector(-100, 0),
    mv = p5.createVector();

  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    p5.background(0);

    C = new CASC.Construction(p5)
      .addPoint("mouse", mv, true)
      .addPoint("up", p5.createVector(0, -100))
      .addPoint("right", p5.createVector(100, 0))
      .addPoint("left", lv)
      .addLine("horiz", "left", "right")
      .addLine("verti", "up", "mouse")
      .addLine("lu", "left", "up")
      .addLinesIntersectionPoint("center", "horiz", "verti")
      .addCircle("circ", "right", "mouse")
      .addLineCircleIntersectionPoint("c1", "lu", "circ", true)
      .addLineCircleIntersectionPoint("c2", "lu", "circ", false)
      .addCircle("circ2", "c1", "center")
      .addCirclesIntersectionPoint("ci1", "circ", "circ2", true)
      .addCirclesIntersectionPoint("ci2", "circ", "circ2", false)
      .addLine("cil", "ci1", "ci2")
      .addMidpoint("pbp", "left", "ci2")
      .addCircumcenter("cc", "up", "center", "left")
      .addLine("pbpcc", "pbp", "cc", true, true, p5.color("gold"));

    /*hexagon = new CASC.Construction(p5)
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
      .addLine("FA", "F", "A", true, true);*/
  };

  p5.draw = () => {
    p5.clear();
    p5.background(0);
    p5.stroke(255);
    p5.text(p5.frameRate(), 10, 10);
    p5.translate(p5.width / 2, p5.height / 2);

    mv.set(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2);

    // Note that the construction is only being defined once, and all the drawing is based off that
    C.draw();
    //hexagon.draw();
    //nepaleseFlag.draw();
    //heptadecagon.draw();
  };
};

new P5(sketch);
