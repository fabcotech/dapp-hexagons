import React from "react";
import { purchaseTokensTerm, createTokensTerm } from "rchain-token-files";

import { GenesisFormComponent } from "./GenesisForm";
import { CanvasComponent } from "./Canvas";

export class AppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: undefined,
    };
  }

  onValuesChosen = (payload) => {
    if (typeof dappyRChain === "undefined") {
      console.warn("window.dappyRChain is undefined, cannot deploy ERC1155");
      return;
    }

    /*
      each cell will have unique bag with quantity 1
    */
    const bags = {
      "0": {
        n: "0",
        quantity: 1,
        publicKey: this.props.publicKey,
        price: null,
        nonce: blockchainUtils.generateNonce(),
      }
    };
    const bagsData = {
      "0": encodeURI(JSON.stringify({
        "rows": payload.rows,
        "price": payload.price,
        "columns": payload.columns,
      })),
    };
    const cells = payload.columns * payload.rows;
    for (let i = 1; i < cells + 1; i += 1) {
      bags[`${i}`] = {
        n: `${i}`,
        quantity: 1,
        publicKey: this.props.publicKey,
        price: payload.price,
        nonce: blockchainUtils.generateNonce(),
      }
    }

    const newNonce = blockchainUtils.generateNonce();
    const payloadForTerm = {
      bags: bags,
      data: bagsData,
      nonce: this.props.nonce,
      newNonce: newNonce,
    }

    const ba = blockchainUtils.toByteArray(payloadForTerm);
    const term = createTokensTerm(
      this.props.registryUri.replace("rho:id:", ""),
      payloadForTerm,
      'SIGN',
    );
    console.log(term);

    dappyRChain
      .transaction({
        term: term,
        signatures: {
          SIGN: blockchainUtils.uInt8ArrayToHex(ba),
        },
      })
      .then((a) => {
        this.setState({
          modal: "values-chosen",
        });
      });
  };

  onPurchase = (payload) => {
    const term = purchaseTokensTerm(
      this.props.registryUri.replace("rho:id:", ""),
      {
        publicKey: this.props.publicKey,
        bagId: payload.bagId,
        newBagId: payload.newBagId,
        quantity: 1,
        price: payload.price,
        bagNonce: blockchainUtils.generateNonce(),
        data: encodeURI(payload.color),
      }
    );
    dappyRChain
      .transaction({
        term: term,
        signatures: {},
      })
      .then((a) => {
        this.setState({
          modal: "purchase",
        });
      });
  };

  render() {
    if (this.state.modal === "purchase") {
      return (
        <div className="modal">
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Purchase successful</p>
              <button
                onClick={() => this.setState({ modal: undefined })}
                className="delete"
                aria-label="close"
              ></button>
            </header>
            <section className="modal-card-body">
              Transaction was successfully sent. Wait few minutes, reload, and
              you should see your cell with the color you chose. Thank you for
              your participation.
            </section>
            <footer className="modal-card-foot">
              <button
                onClick={() => this.setState({ modal: undefined })}
                class="button"
              >
                Ok
              </button>
            </footer>
          </div>
        </div>
      );
    }

    if (this.state.modal === "genesis-form") {
      return (
        <div className="modal">
          <div className="modal-background"></div>
          <div className="modal-card">
            <header className="modal-card-head">
              <p className="modal-card-title">Submit successful</p>
              <button
                onClick={() => this.setState({ modal: undefined })}
                className="delete"
                aria-label="close"
              ></button>
            </header>
            <section className="modal-card-body">
              Submit was successful, wait few minutes, reload, and the ERC-1155
              contract should be initiated.
            </section>
            <footer className="modal-card-foot">
              <button
                onClick={() => this.setState({ modal: undefined })}
                class="button"
              >
                Ok
              </button>
            </footer>
          </div>
        </div>
      );
    }

    if (this.props.values) {
      return (
        <CanvasComponent
          onPurchase={this.onPurchase}
          values={this.props.values}
          bagsData={this.props.bagsData}
          bags={this.props.bags}
        ></CanvasComponent>
      );
    }

    return (
      <GenesisFormComponent
        onValuesChosen={this.onValuesChosen}
        nonce={this.props.nonce}
      ></GenesisFormComponent>
    );
  }
}
