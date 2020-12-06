import React from "react";
import ReactDOM from "react-dom";

import { AppComponent } from "./App";

const {readBagsTerm, read, readBagsOrTokensDataTerm } = require('rchain-token-files');

document.addEventListener("DOMContentLoaded", function () {
  if (typeof dappyRChain !== "undefined") {
    dappyRChain.exploreDeploys([
      read("REGISTRY_URI"),
      readBagsTerm("REGISTRY_URI"),
      readBagsOrTokensDataTerm("REGISTRY_URI", "bags"),
    ]).then(a => {
      const results = JSON.parse(a).results;

      const mainValues = blockchainUtils.rhoValToJs(
        JSON.parse(results[0].data).expr[0]
      );
      const bags = blockchainUtils.rhoValToJs(
        JSON.parse(results[1].data).expr[0]
      );
      const bagsData = blockchainUtils.rhoValToJs(
        JSON.parse(results[2].data).expr[0]
      );
      document
        .getElementById("root")
        .setAttribute("class", "loaded");
      if (bagsData["0"]) {
        ReactDOM.render(
          <AppComponent
            values={JSON.parse(decodeURI(bagsData["0"]))}
            bags={bags}
            bagsData={bagsData}
            registryUri={mainValues.registryUri}
            nonce={mainValues.nonce}
            publicKey={mainValues.publicKey}
          ></AppComponent>,
          document.getElementById("root")
        );
      } else {
        dappyRChain.identify({ publicKey: undefined })
        .then(a => {
          if (a.identified) {
            ReactDOM.render(
              <AppComponent
                nonce={mainValues.nonce}
                publicKey={mainValues.publicKey}
                registryUri={mainValues.registryUri}
                values={undefined}
                bags={undefined}
                bagsData={undefined}
              />,
              document.getElementById("root")
            );
          } else {
            console.error("This dapp needs identification");
          }
        })
        .catch(err => {
          console.error("This dapp needs identification");
          console.log(err);
        });  
      }
    });
  }
});
