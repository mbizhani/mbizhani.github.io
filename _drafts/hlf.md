---
layout: post
title: Hyperledger Fabric Key Points
categories: article tech blockchain
excerpt: Hyperledger Fabric Key Points
update: 2020-11-30
---

## Introduction

### Fabric vs. Others

- Other Blockchain
  - **order-execute** architecture for submitting transactions
    1. the consensus protocol validates and orders transactions then propagates them to all peer nodes
    2. each peer then executes the transactions sequentially
  - Using a DSL (e.g. Solidity) to ensure deterministic consensus
  - Sequential transaction execution that results in limited performance and scale
- HLF
  - **execute-order-validate** architecture for submitting transactions
    1. **execute** a transaction and check its correctness, thereby endorsing it
    2. **order** transactions via a (pluggable) consensus protocol
    3. **validate** transactions against an application-specific endorsement policy before committing them to the ledger
  - each transaction need only be executed (endorsed) by the subset of the peer nodes necessary 
    to satisfy the transaction’s endorsement policy => prevents non-determinism

## Components

**Network**
- Allows organizations to collaborate in the formation of blockchain networks
- A technical infrastructure that provides ledger and smart contract (chaincode) services to applications.
- Multiple `organizations` come together as a `consortium` to form the network, and their permissions are 
  determined by a set of `policies`

**MSP**
- To transact on a Fabric network a member needs to:
  1. Have an identity issued by a CA that is trusted by the network.
  2. Become a member of an organization that is recognized and approved by the network members.
     The MSP is how the identity is linked to the membership of an organization.
     Membership is achieved by adding the member’s public key (also known as `certificate`, `signing cert`, or `signcert`) to the organization’s MSP.
  3. Add the MSP to either a consortium on the network or a channel.
  4. Ensure the MSP is included in the policy definitions on the network.
- A set of folders that are added to the configuration of the network and is used to define an organization
- When a user is registered with a Fabric CA, a role of `admin`, `peer`, `client`, `orderer`, or `member` must be associated with the user.
- MSPs occur in two domains
  - Local MSP
    - for clients and for nodes (peers and orderers)
    - Every node must have a local MSP
  - Channel MSP (?)
    - Administrative and participatory rights at the channel level
    - The system channel MSP includes the MSPs of all the organizations that participate in an ordering service

**Orderer**

**Consortium**
  - It defines the set of organizations in the network who share a need to transact with one another

**Channel**
- It is a primary communication mechanism by which the members of a consortium can communicate with each other
- There can be multiple channels in a network
- Types
  - The `system channel`
    - Same as a regular channel
    - Ordering service nodes operate a mini-blockchain, connected via the `system channel`
  - Application Channels
    - peer nodes in an application channel can distribute channel configuration transactions
- Each channel has its own configuration and policy

**Peer**
- network components hosting physical copies of the blockchain ledger
- Types
  - Endorsing
    - must be used by a client application to generate a digitally signed transaction response
    - hosting a smart contract
    - + committing
  - Committing
    - without a smart contract
    - just have a copy of ledger with validation + accepting/rejecting
  - Leader
    - a node when an organization has multiple peers in a channel
    - responsible for distributing transactions from the orderer to the other committing peers in the organization
    - static/dynamic leadership
  - Anchor
    - defined in the channel configuration for that organization
    - communicating with a peer in another organization

**Note:** a peer can be a committing peer, endorsing peer, leader peer and anchor peer all at the same time!

**Smart Contract & Chain Code**
- Smart contracts are used to generate transactions which are subsequently distributed to every peer node in the network 
  where they are immutably recorded on their copy of the ledger.
- A smart contract defines the transaction logic that controls the lifecycle of a business object contained in the world state.
  It is then packaged into a chaincode which is then deployed to a blockchain network.
  Think of smart contracts as governing transactions, whereas chaincode governs how smart contracts are packaged for deployment.
- The most important piece of information supplied within the chaincode definition is the `endorsement policy`.

## Key Concepts
- At least one CA per organization
- The network is formed when an orderer is started by an organization with an initial network configuration having initial policies
- Define a consortium
- Create a channel for a consortium
  - Managed by organization in the consortium
  - Governed by channel configuration
  - Connected to an ordering service
- Joining Peer
  - A ledger is logically hosted in the channel, but physically hosted on the channel's peer(s)
- Application & Chain Code
  - It must have been installed on peers, and then defined on a channel
  - A client then call the smart contract to send transactions or query the ledger
  - A sufficient number of organizations need to approve a chaincode definition (A majority, by default)
  - Now, a client can send transaction proposal as input to the smart contract, and in return 
    it generates an endorsed transaction response by the peer (`transaction flow`)
- To change a network or channel configuration, an administrator must submit a **configuration transaction** 
  to change the network or channel configuration.


### Creating a Network

<div style="text-align: center;">
<img alt="network" style="border:1px solid black;width:50%;height:50%" src="/assets/images/hlf/create-network.png"/>
</div>

Steps on the above picture, top diagram:

1. Org `R4` (identities from `CA4`) creates network `N` with orderer `O4` using initial net config `NC4`. 
   It then added org `R1` (identities from `CA1`) with administrative rights.
2. An admin from `R1` or `R4` creates the consortium `X1` containing orgs `R1` and `R2` (identities from `CA2`).
3. Channel `C1` is created based on consortium `X1` using channel config `CC1` stating that it can be accessed only by orgs `R1` or `R2`.
4. Peer `P1` for org `R1` is created. This scenario will be repeated for `P2` of `R2`. Both peers logically access the same ledger `L1`, 
   while physically a copy is hosted on the node of each peer.
5. Chaincode `S5` is installed on peer `P1`. Then application `A1` in org `R1` can use `S5` to read/write the ledger `L1` via `P1`.

The bottom diagram of the above picture shows extending the network by adding another channel in following steps:
1. An admin from `R1` or `R4` creates the consortium `X2` containing orgs `R2` and `R3` (identities from `CA3`). 
   In fact, consortium definition is always added to net config `NC4`.
2. Here, an admin from `R2` or `R3` can create channel `C2` using config `CC2` for consortium `X2` 
   (such access policy should be defined in the net config).
   **Note:** channel configs `CC1` and `CC2` and net config `NC4` are completely 3 different configs.
3. Peer `P3` for org `R3` is created. For `R2`, its previous peer, `P2`, can also access channel `C2`.
   Again, both peers, `P3` and `P2`, logically access the same ledger `L2`, while physically a copy is hosted on the node of each peer.
4. Chaincode `S6` is installed on peer `P3`. Then application `A3` in org `R3` can use `S6` to read/write the ledger `L2` via `P3`.


## References
- DEFAULT: [Hyperledger Fabric Official Doc](https://hyperledger-fabric.readthedocs.io/en/release-2.2/)
- 