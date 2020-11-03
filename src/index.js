import React from "react";
import ReactDOM from "react-dom";

import { AppComponent } from "./App";

document.addEventListener("DOMContentLoaded", function () {
  if (typeof dappyRChain !== "undefined") {
    dappyRChain
      // shortcut
      .fetch("dappy://REGISTRY_URI")
      .then((a) => {
        const response = JSON.parse(a);
        const rholangTerm = response.expr[0];
        const jsValue = blockchainUtils.rhoValToJs(rholangTerm);
        /*
        If a file names "values" exists, it means that the ERC-115 has been created,
        we can display the hexagons after having retrieved values and ERC-1155 bags

        If it does not exist we must display the form to create it
      */
        console.log(jsValue);
        if (jsValue.files.values) {
          dappyRChain
            // shortcut
            .exploreDeploys("dappy://explore-deploys", [
              /* Get values (rows, columns, price) from the rholang-files-module contract */
              `new return,
              fileCh,
              fileCh,
              filesModuleCh,
              lookup(\`rho:registry:lookup\`) in {
                lookup!(\`${jsValue.files.values}\`, *fileCh) |
                for(file <- fileCh) {
                  return!(*file)
                }
            }`,
            ])
            .then((a) => {
              const results = JSON.parse(a).results;
              const values = blockchainUtils.rhoValToJs(
                JSON.parse(results[0].data).expr[0]
              );
              console.log(
                "files-module .values file retrieved with explore-deploy :"
              );
              console.log(values);

              dappyRChain
                // shortcut
                .exploreDeploys("dappy://explore-deploys", [
                  /* Get all bags from ERC-1155 contract */
                  `new return,
                entryCh,
                lookup(\`rho:registry:lookup\`)
                in {
                  lookup!(\`${values.erc1155RegistryUri}\`, *entryCh) |
                  for(entry <- entryCh) {
                    entry!(
                      {
                        "type": "READ_BAGS",
                      },
                      *return
                    )
                  }
                }`,
                  `new return,
                entryCh,
                lookup(\`rho:registry:lookup\`)
                in {
                  lookup!(\`${values.erc1155RegistryUri}\`, *entryCh) |
                  for(entry <- entryCh) {
                    entry!(
                      {
                        "type": "READ_BAGS_DATA",
                      },
                      *return
                    )
                  }
                }`,
                ])
                .then((a2) => {
                  const results2 = JSON.parse(a2).results;
                  const bags = blockchainUtils.rhoValToJs(
                    JSON.parse(results2[0].data).expr[0]
                  );
                  console.log("ERC-1155 bags retrieved with explore-deploy :");
                  console.log(bags);

                  const bagsData = blockchainUtils.rhoValToJs(
                    JSON.parse(results2[1].data).expr[0]
                  );
                  console.log(
                    "ERC-1155 bagsData retrieved with explore-deploy :"
                  );
                  console.log(bagsData);

                  document
                    .getElementById("root")
                    .setAttribute("class", "loaded");
                  ReactDOM.render(
                    <AppComponent
                      values={values}
                      bags={bags}
                      bagsData={bagsData}
                      erc1155RegistryUri={values.erc1155RegistryUri}
                    ></AppComponent>,
                    document.getElementById("root")
                  );
                });
            });
        } else {
          document.getElementById("root").setAttribute("class", "loaded");
          ReactDOM.render(
            <AppComponent
              nonce={jsValue.nonce}
              values={undefined}
              bags={undefined}
              bagsData={undefined}
            />,
            document.getElementById("root")
          );
        }
      })
      .catch((err) => {
        console.error(
          "Something went wrong when retreiving the files module object"
        );
        console.log(err);
      });
  }
});
