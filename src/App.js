import React from "react";
import { erc1155Term, purchaseTokensTerm } from "rchain-erc1155";

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
      tokens will be created by default in the deployment of the ERC-1155 contract
    */
    let defaultBags = ``;
    const cells = payload.columns * payload.rows;
    for (let i = 0; i < cells; i += 1) {
      // "publicKey": "0" because no one is the owner and should be able to change price
      defaultBags += `"${i}": { "publicKey": "${
        "PUBLIC" +
        "_KEY".substr(
          0
        ) /* It must not be replaced by dappy-cli at compilation*/
      }", "n": "${i}", "price": ${payload.price}, "quantity": 1}${
        i === cells - 1 ? "" : ","
      }\n`;
    }

    const nonceForErc1155Term = blockchainUtils.generateNonce();
    const nonceForFilesModule = blockchainUtils.generateNonce();

    const erc1155ContractTerm = erc1155Term(
      nonceForErc1155Term,
      "PUBLIC" + "_KEY".substr(0) // It must not be replaced by dappy-cli at compilation
    );

    /*
      Add tokens by default in the contract
    */
    const erc1155TermWithDefaultBags = erc1155ContractTerm.replace(
      "/*DEFAULT_BAGS*/",
      defaultBags
    );
    /*
      When the ERC-1155 contract is created, we must record the values in the
      files module
    */
    const erc1155TermWithDefaultBagsAndReturnChannel = erc1155TermWithDefaultBags.replace(
      "/*OUTPUT_CHANNEL*/",
      `| erc1155OutputCh!({
        "registryUri": *entryUri,
      })`
    );

    // Storing the registry URI value in the files module
    const term = `
   new entryCh, erc1155OutputCh, lookup(\`rho:registry:lookup\`), stdout(\`rho:io:stdout\`) in {

     ${erc1155TermWithDefaultBagsAndReturnChannel} |

     for (@output <- erc1155OutputCh) { 
       stdout!({
         "rows": ${payload.rows},
         "price": ${payload.price},
         "columns": ${payload.columns},
         "erc1155RegistryUri": output.get("registryUri"),
       }) |

       lookup!(\`rho:id:REGISTRY_URI\`, *entryCh) |
     
       for(entry <- entryCh) {
         entry!(
           {
             "type": "ADD",
             "payload": {
               "id": "values",
               "file": {
                 "rows": ${payload.rows},
                 "price": ${payload.price},
                 "columns": ${payload.columns},
                 "erc1155RegistryUri": output.get("registryUri"),
               },
               "nonce": "${nonceForFilesModule}",
               "signature": "SIGNATURE"
             }
           },
           *stdout
         )
       }
     }
   }
   `;
    dappyRChain
      .transaction({
        term: term,
        signatures: {
          SIGNATURE: payload.nonce,
        },
      })
      .then((a) => {
        this.setState({
          modal: "values-chosen",
        });
      });
  };

  onPurchase = (payload) => {
    dappyRChain
      .transaction({
        term: purchaseTokensTerm(
          this.props.erc1155RegistryUri.replace("rho:id:", ""),
          payload.bagId,
          payload.price,
          `${payload.color}`,
          1,
          // It must not be replaced by dappy-cli at compilation
          "PUBLIC" + "_KEY".substr(0),
          blockchainUtils.generateNonce()
        ),
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
