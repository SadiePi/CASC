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

    // Proof of concept construction utilizing all atomic and compound constructions
    // C = new CASC.Construction(p5)
    //   .point("mouse", mouse, true)
    //   .point("up", p5.createVector(0, -100))
    //   .point("right", p5.createVector(100, 0))
    //   .point("left", lv)
    //   .line("horiz", "left", "right")
    //   .line("verti", "up", "mouse")
    //   .line("lu", "left", "up")
    //   .intersection("center", "horiz", "verti")
    //   .circle("circ", "right", "mouse")
    //   .intersection("c1", "lu", "circ", true)
    //   .intersection("c2", "lu", "circ", false)
    //   .circle("circ2", "c1", "center")
    //   .intersection("ci1", "circ", "circ2", true)
    //   .intersection("ci2", "circ", "circ2", false)
    //   .line("cil", "ci1", "ci2")
    //   .midpoint("pbp", "left", "ci2")
    //   .circumcenter("cc", "up", "center", "left")
    //   .line("pbpcc", "pbp", "cc", true, true, p5.color("gold"));

    hexagon = new CASC.Construction(p5, false, p5.color("RebeccaPurple"))
      .point({ name: "O", vector: p5.createVector(0, 0) })
      .point({ name: "U", vector: mouse })
      .line({ name: "OU", point1: "O", point2: "U" })
      .circle({ name: "Cir", center: "O", edge: "U" })
      .intersection({ name: "A", object1: "OU", object2: "Cir", toggle: true })
      .intersection({ name: "D", object1: "OU", object2: "Cir" })
      .circle({ name: "C1", center: "A", edge: "O" })
      .circle({ name: "C2", center: "D", edge: "O" })
      .intersection({ name: "B", object1: "Cir", object2: "C1" })
      .intersection({ name: "C", object1: "Cir", object2: "C2", toggle: true })
      .intersection({ name: "E", object1: "Cir", object2: "C2" })
      .intersection({ name: "F", object1: "Cir", object2: "C1", toggle: true })
      .line({
        name: "AB",
        point1: "A",
        point2: "B",
        visible: true,
        segment: true,
        color: p5.color("hotpink")
      })
      .line({
        name: "BC",
        point1: "B",
        point2: "C",
        visible: true,
        segment: true
      })
      .line({
        name: "CD",
        point1: "C",
        point2: "D",
        visible: true,
        segment: true,
        color: p5.color("hotpink")
      })
      .line({
        name: "DE",
        point1: "D",
        point2: "E",
        visible: true,
        segment: true
      })
      .line({
        name: "EF",
        point1: "E",
        point2: "F",
        visible: true,
        segment: true,
        color: p5.color("hotpink")
      })
      .line({
        name: "FA",
        point1: "F",
        point2: "A",
        visible: true,
        segment: true
      });
  };

  p5.draw = () => {
    p5.clear();
    p5.background(0);
    p5.stroke(255);
    p5.text(Math.round(10 * p5.frameRate()) / 10, 10, 10);
    p5.translate(p5.width / 2, p5.height / 2);

    mouse.set(p5.mouseX - p5.width / 2, p5.mouseY - p5.height / 2);

    // Note that the construction is only being defined once, and all the drawing is based off that
    //C.draw();
    hexagon.draw();
    //nepaleseFlag.draw();
    //heptadecagon.draw();
  };
};

new P5(sketch);
