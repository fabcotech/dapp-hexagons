import React from "react";

import { createCanvas } from "./createCanvas";
import { formatter } from "./utils";

export class GenesisFormComponent extends React.Component {
  state = {
    price: 1,
    columns: 15,
    rows: 15,
  };

  onCreateCanvas = () => {
    const el = document.getElementById("canvas");
    if (
      el &&
      typeof this.state.columns === "number" &&
      typeof this.state.rows === "number"
    ) {
      el.innerHTML = "";
      createCanvas(this.state.columns, this.state.rows, {}, {}, () => null);
    } else if (el) {
      el.innerHTML = "";
    }
  };

  onChangeColumns = (e) => {
    this.setState({ columns: parseInt(e.target.value) });
  };

  onChangeRows = (e) => {
    this.setState({ rows: parseInt(e.target.value) });
  };

  render() {
    console.log(this.state);
    this.onCreateCanvas();
    return (
      <div className="genesis-form form">
        <div id="canvas"></div>
        <p>
          Hi ! The canvas is not created, you must define the number of rows,
          columns, and the price for purchasing one cell (and chosing its
          color).
          <br />
          <br />
          Once you have submitted this form, wait few minutes and reload the
          page to see the canvas.
          <br />
          <br />
        </p>
        <div class="field">
          <label class="label">Number of rows</label>
          <div class="control">
            <input
              defaultValue={this.state.rows}
              onInput={this.onChangeRows}
              class="input"
              type="number"
              min={2}
              step={1}
              max={100}
            />
          </div>
        </div>
        <div class="field">
          <label class="label">Number of columns</label>
          <div class="control">
            <input
              defaultValue={this.state.columns}
              onInput={this.onChangeColumns}
              class="input"
              type="number"
              min={2}
              step={1}
              max={100}
            />
          </div>
        </div>
        <div class="field">
          <label class="label">Price for one cell (REV)</label>
          <div class="control">
            <input
              defaultValue={this.state.price}
              onChange={(e) =>
                this.setState({ price: parseInt(e.target.value) })
              }
              class="input"
              type="number"
              min={1}
              step={1}
            />
          </div>
          {this.state &&
          this.state.price &&
          this.state.columns &&
          this.state.rows ? (
            <p>
              Total REV :{" "}
              {formatter.format(
                this.state.price * this.state.columns * this.state.rows
              )}{" "}
              <br />
              Total dust (1 dust is 1 REV divided by 100.000.000):{" "}
              {formatter.format(
                this.state.price *
                  this.state.columns *
                  this.state.rows *
                  100000000
              )}{" "}
            </p>
          ) : undefined}
        </div>
        <div className="field">
          <button
            className="button is-light"
            disabled={
              !(
                this.state &&
                this.state.price &&
                this.state.columns &&
                this.state.rows
              )
            }
            type="button"
            onClick={(e) => {
              if (
                this.state &&
                this.state.price &&
                this.state.columns &&
                this.state.rows
              ) {
                this.props.onValuesChosen({
                  price: this.state.price * 100000000,
                  rows: this.state.rows,
                  columns: this.state.columns,
                  nonce: this.props.nonce,
                });
              }
            }}
          >
            Create canvas
          </button>
        </div>
      </div>
    );
  }
}
