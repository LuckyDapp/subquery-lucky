import {SubstrateDatasourceKind, SubstrateHandlerKind, SubstrateProject,} from "@subql/types";

import {WasmDatasource} from "@subql/substrate-wasm-processor";

// Can expand the Datasource processor types via the generic param
const projectShiden: SubstrateProject<WasmDatasource> = {
    specVersion: "1.0.0",
    version: "2.0.0",
    name: "lucky-subql",
    description:
        "This SubQuery project indexes data used by the dApp Lucky on Shiden network",
    runner: {
        node: {
            name: "@subql/node",
            version: ">=3.0.1",
        },
        query: {
            name: "@subql/query",
            version: "*",
        },
    },
    schema: {
        file: "./schema.graphql",
    },
    network: {
        chainId:
            "0xf1cf9022c7ebb34b162d5b5e34e705a5a740b2d0ecc1009fb89023e62a488108",
        endpoint: ["wss://rpc.shiden.astar.network", "wss://shiden-rpc.dwellir.com"],
    },
    dataSources: [
        {
            // This is the datasource for dAppStakingV3 events
            kind: SubstrateDatasourceKind.Runtime,
            startBlock: 5843300,
            mapping: {
                file: "./dist/indexShiden.js",
                handlers: [
                    {
                        kind: SubstrateHandlerKind.Event,
                        handler: "handleStake",
                        filter: {
                            module: "dappStaking",
                            method: "Stake",
                        },
                    },
                    {
                        kind: SubstrateHandlerKind.Event,
                        handler: "handleUnstake",
                        filter: {
                            module: "dappStaking",
                            method: "Unstake",
                        },
                    },
                    {
                        kind: SubstrateHandlerKind.Event,
                        handler: "handleDAppReward",
                        filter: {
                            module: "dappStaking",
                            method: "DAppReward",
                        },
                    },
                    {
                        kind: SubstrateHandlerKind.Event,
                        handler: "handleNewEra",
                        filter: {
                            module: "dappStaking",
                            method: "NewEra",
                        },
                    },
                    {
                        kind: SubstrateHandlerKind.Event,
                        handler: "handleNewSubPeriod",
                        filter: {
                            module: "dappStaking",
                            method: "NewSubperiod",
                        },
                    },
                ],
            },
        },
        {
            kind: "substrate/Wasm",
            startBlock: 6391400,
            //endBlock: 1,
            processor: {
                file: "./node_modules/@subql/substrate-wasm-processor/dist/bundle.js",
                options: {
                    abi: "luckyRaffle",
                    //old contract before 2024-04-25: "antwZPZH7fuhLwcjKQUT2cbpfjcKUJS1bt1Lnq2VxSszg8d",
                    contract: "W5pzj2pfkkvsNbyLCSA92G5VNYWmxvS86EiN9Kog6PrTfij",
                },
            },
            assets: new Map([["luckyRaffle", {file: "./metadata_shiden/lucky_raffle_metadata.json"}]]),
            mapping: {
                file: "./dist/indexShibuya.js",
                handlers: [
                    {
                        handler: "handleRaffleDone",
                        kind: "substrate/WasmEvent",
                        filter: {
                            identifier: "RaffleDone"
                        }
                    },
                    {
                        handler: "handleRaffleSkipped",
                        kind: "substrate/WasmEvent",
                        filter: {
                            identifier: "RaffleSkipped"
                        }
                    }
                ]
            }
        },
        {
            kind: "substrate/Wasm",
            startBlock: 3964500,
            //endBlock: 1,
            processor: {
                file: "./node_modules/@subql/substrate-wasm-processor/dist/bundle.js",
                options: {
                    abi: "rewardManager",
                    contract: "X6yBHZm9MGzedCVBn6nGHHUDxEnjUNzSoN4aqAP4qooQpEU",
                },
            },
            assets: new Map([["rewardManager", {file: "./metadata_shiden/reward_manager_metadata.json"}]]),
            mapping: {
                file: "./dist/indexShiden.js",
                handlers: [
                    {
                        handler: "handlePendingReward",
                        kind: "substrate/WasmEvent",
                        filter: {
                            identifier: "PendingReward"
                        }
                    },
                    {
                        handler: "handleRewardsClaimed",
                        kind: "substrate/WasmEvent",
                        filter: {
                            identifier: "RewardsClaimed"
                        }
                    }
                ]
            }
        },
    ],
};

// Must set default to the project instance
export default projectShiden;
