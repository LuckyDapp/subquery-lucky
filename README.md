# SubQuery - Example Project for Astar's WASM

[SubQuery](https://subquery.network) is a fast, flexible, and reliable open-source data indexer that provides you with custom APIs for your web3 project across all of our supported networks. To learn about how to get started with SubQuery, [visit our docs](https://academy.subquery.network).

**This SubQuery project indexes all transactions and approvals from the [Astar Wasm based lottery contract](https://astar.subscan.io/account/bZ2uiFGTLcYyP8F88XzXa13xu5Mmp13VLiaW1gGn7rzxktc), as well as dApp staking events from [Astar's dApp Staking](https://docs.astar.network/docs/dapp-staking/) functions on Astar's WASM**

## Start

First, install SubQuery CLI globally on your terminal by using NPM `npm install -g @subql/cli`

You can either clone this GitHub repo, or use the `subql` CLI to bootstrap a clean project in the network of your choosing by running `subql init` and following the prompts.

Don't forget to install dependencies with `npm install`!

## Build the indexer on Shibuya

Run the following commands to generate and build the code to index the data coming from `Lucky` dApp in `Shibuya` ;

```
subql codegen -f project-shibuya.ts
subql build -f project-shibuya.ts
```

## Build the indexer on Shiden

Run the following commands to generate and build the code to index the data coming from `Lucky` dApp in `Shiden` ;

```
subql codegen -f project-shiden.ts
subql build -f project-shiden.ts
```


## Build the indexer on Astar

Run the following commands to generate and build the code to index the data coming from `Lucky` dApp in `Astar` ;

```
subql codegen -f project-astar.ts
subql build -f project-astar.ts
```

## Run the indexer on Shibuya/Shiden/Astar

You can use the docker image for test purpose.
or run the following command

```
EXPORT DB_USER=<username>
EXPORT DB_PASS=<pwd>
EXPORT DB_DATABASE=<db>
EXPORT DB_HOST=<host>
EXPORT DB_PORT=<port>

subql build --subquery=project-<env>.yaml --db-schema=lucky --port=3100 --batch-size=30
```

## Query your project

For this project, you can try to query with the following GraphQL code to get a taste of how it works.

```graphql
query{
 
  palletInfos{nodes{id, currentEra, currentPeriod, currentSubPeriod}}
     
  dAppRewards(orderBy: ERA_DESC, first: 1){nodes{id, era, tierId, beneficiaryId, amount}}
 
  raffleDones(orderBy: ERA_DESC, first: 1){nodes{id, era, nbWinners, totalRewards}}
  
  rewards(orderBy: ERA_DESC, first: 1){nodes{id, era, accountId, amount}}
  
  stakes (filter: {and: [ {period: {equalTo: "14"}}, {era: {lessThan: "4594"}} ] })
  {
    groupedAggregates(groupBy: ACCOUNT_ID)
    {keys, sum{amount}}
  }  
    
}
```

You can explore the different possible queries and entities to help you with GraphQL using the documentation draw on the right.

