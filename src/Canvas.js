import React from "react";

import { createCanvas } from "./createCanvas";
import { formatter } from "./utils";

export class CanvasComponent extends React.Component {
  constructor(props) {
    super(props);
    this.el = React.createRef();
    this.colorInputEl = React.createRef();
    this.state = {
      color: "#444466",
      n: undefined,
      notAvailable: undefined,
    };
  }

  componentDidMount() {
    createCanvas(
      this.props.values.columns,
      this.props.values.rows,
      this.props.bagsData,
      this.props.bags,
      (a, n) => {
        let colorsIndexedByTokenId = {};
        let found = false;
        Object.keys(this.props.bags).forEach((bagId) => {
          // bags[bagId].n is the token ID
          if (
            this.props.bags[bagId].n === `${n}` &&
            this.props.bags[bagId].price == this.props.values.price &&
            this.props.bags[bagId].quantity > 0
          ) {
            found = true;
            this.setState({ n: `${n}`, notAvailable: undefined });
          }
        });
        if (!found) {
          this.setState({ notAvailable: `${n}`, n: undefined });
        }
      }
    );
  }

  onClick = (e) => {
    const x = e.pageX - this.el.current.getBoundingClientRect().left;
    const y = e.pageY - this.el.current.getBoundingClientRect().top;
  };

  render() {
    return (
      <div className="canvas-cont">
        <h2 className="title is-2">Fill the canvas !</h2>
        <div
          id="canvas"
          ref={this.el}
          // onClick={this.onClick}
          className="canvas"
        ></div>
        <div className="cell-form">
          {typeof this.state.notAvailable === "string" ? (
            <p className="has-text-danger">
              Cell {this.state.notAvailable} is not available
            </p>
          ) : undefined}
          {typeof this.state.n === "string" ? (
            <div className="n-and-color">
              <div>
                <span className="cell">Cell</span>
                <span className="cell-n">{this.state.n}</span>
                <br />
                <span className="cell-available">Available</span>
                <br />
                <span className="cell-available">
                  Price :{" "}
                  <b>
                    {formatter.format(this.props.values.price / 100000000)} REV
                  </b>
                  <br />
                  {formatter.format(this.props.values.price)} dusts
                </span>
              </div>
              <div>
                <input
                  ref={this.colorInputEl}
                  type="color"
                  id="body"
                  name="body"
                  className="color-input"
                  defaultValue="#444466"
                  onChange={(e) => this.setState({ color: e.target.value })}
                ></input>

                <div className="color-box">
                  <span className="label">Color</span>
                  <br />
                  <span
                    style={{ background: this.state.color || "#444466" }}
                    onClick={(e) => this.colorInputEl.current.click()}
                    className="color-square"
                  ></span>
                </div>
                <button
                  className="button is-white"
                  disabled={
                    !(this.state.color && typeof this.state.n === "string")
                  }
                  type="button"
                  onClick={(e) => {
                    if (this.state.color && typeof this.state.n === "string") {
                      const bagId = Object.keys(this.props.bags).find(
                        (bagId) => {
                          return (
                            this.props.bags[bagId].n === this.state.n &&
                            this.props.bags[bagId].quantity > 0 &&
                            this.props.bags[bagId].price ===
                              this.props.values.price
                          );
                        }
                      );

                      this.props.onPurchase({
                        bagId: bagId,
                        color: this.state.color,
                        price: this.props.values.price,
                      });
                    }
                  }}
                >
                  Buy cell
                </button>
              </div>
            </div>
          ) : undefined}
        </div>
      </div>
    );
  }
}
