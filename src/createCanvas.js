import { min } from "d3-array";
import hexbin from "d3-hexbin/src/hexbin";
import { select } from "d3-selection";

export const CELL_WIDTH = 25;
export const CELL_HEIGHT = 25;

export const createCanvas = (nbColumns, nbRows, bagsData, bags, onClick) => {
  console.log("createCanvas", nbColumns, nbRows);
  console.log(bagsData);
  console.log(bags);
  let colorsIndexedByTokenId = {};
  Object.keys(bagsData).forEach((key) => {
    // key is the bag ID
    // bags[key].n is the token ID
    if (bags[key] && bags[key].quantity > 0) {
      colorsIndexedByTokenId[bags[key].n] = decodeURI(bagsData[key]);
    }
  });

  //SVG sizes and margins
  var margin = {
      top: 15,
      right: 0,
      bottom: 0,
      left: 15,
    },
    width = nbColumns * CELL_WIDTH + 25,
    height = nbRows * CELL_HEIGHT + 25;

  //The maximum radius the hexagons can have to still fit the screen
  var hexRadius = min([
    width / ((nbColumns + 0.5) * Math.sqrt(3)),
    height / ((nbRows + 1 / 3) * 1.5),
  ]);

  //Calculate the center position of each hexagon
  var points = [];
  for (var i = 0; i < nbRows; i++) {
    for (var j = 0; j < nbColumns; j++) {
      var x = hexRadius * j * Math.sqrt(3);
      //Offset each uneven row by half of a "hex-width" to the right
      if (i % 2 === 1) x += (hexRadius * Math.sqrt(3)) / 2;
      var y = hexRadius * i * 1.5;
      points.push([x, y]);
    } //for j
  } //for i

  //Create SVG element
  var svg = select("#canvas")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //Set the hexagon radius
  var hexbinFunction = hexbin().radius(hexRadius);

  svg
    .append("g")
    .selectAll(".hexagon")
    .data(hexbinFunction(points))
    .enter()
    .append("path")
    .attr("class", "hexagon")
    .attr("d", function (d) {
      return "M" + d.x + "," + d.y + hexbinFunction.hexagon();
    })
    .attr("n", function (d, i) {
      return i;
    })
    .attr("stroke-width", "1px")
    .style("stroke", (d, i) => {
      const n = `${i}`;
      if (
        colorsIndexedByTokenId[n] &&
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorsIndexedByTokenId[n])
      ) {
        // return colorsIndexedByTokenId[n];
        return "#111111";
      } else {
        return "#111111";
      }
    })
    .style("fill", (d, i) => {
      const n = `${i}`;
      if (
        colorsIndexedByTokenId[n] &&
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorsIndexedByTokenId[n])
      ) {
        return colorsIndexedByTokenId[n];
      } else {
        return "rgba(255,255,255,0.5)";
      }
    })
    .on("click", onClick);
};
