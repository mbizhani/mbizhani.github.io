---
layout: post
title: Hyperledger Fabric Key Points
categories: article tech
excerpt: Hyperledger Fabric Key Points
update: 2020-11-30
---

## Components

**Network**
- allows organizations to collaborate in the formation of blockchain networks
- a technical infrastructure that provides ledger and smart contract (chaincode) services to applications.
- multiple `organizations` come together as a `consortium` to form the network, and their permissions are 
  determined by a set of `policies`

**MSP**
- To transact on a Fabric network a member needs to:
  1. Have an identity issued by a CA that is trusted by the network.
  2. Become a member of an organization that is recognized and approved by the network members.
     The MSP is how the identity is linked to the membership of an organization.
     Membership is achieved by adding the member’s public key (also known as `certificate`, `signing cert`, or `signcert`) to the organization’s MSP.
  3. Add the MSP to either a consortium on the network or a channel.
  4. Ensure the MSP is included in the policy definitions on the network.
- a set of folders that are added to the configuration of the network and is used to define an organization
- when a user is registered with a Fabric CA, a role of `admin`, `peer`, `client`, `orderer`, or `member` must be associated with the user.
- MSPs occur in two domains
  - Local MSP
    - for clients and for nodes (peers and orderers)
    - Every node must have a local MSP
  - Channel MSP (?)
    - administrative and participatory rights at the channel level
    - The system channel MSP includes the MSPs of all the organizations that participate in an ordering service

**Orderer**

**Consortium**
  - It defines the set of organizations in the network who share a need to transact with one another

**Channel**
- It is a primary communication mechanism by which the members of a consortium can communicate with each other
- There can be multiple channels in a network
- Types
  - The `system channel`
    - same as a regular channel
    - ordering service nodes operate a mini-blockchain, connected via the system channel
  - Application Channels
    - peer nodes in an application channel can distribute channel configuration transactions
- Each channel has its own configuration and policy

**Peer**
- network components hosting physical copies of the blockchain ledger
- Types
  - Endorsing hosting
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
- Defining a consortium
- Creating a channel for a consortium
  - Managed by organization in the consortium
  - Governed by channel configuration
  - Connected to an ordering service
- Joining Peer
  - A ledger is logically hosted in the channel, but physically hosted on the channel's peer(s)
- Application & Chain Code
  - it must have been installed on peers, and then defined on a channel
  - A client then call the smart contract to send transactions or query the ledger
  - A sufficient number of organizations need to approve a chaincode definition (A majority, by default)
  - Now, a client can send transaction proposal as input to the smart contract, and in return 
    it generates an endorsed transaction response by the peer (?)
- To change a network or channel configuration, an administrator must submit a **configuration transaction** 
  to change the network or channel configuration.

## References
- DEFAULT: [Hyperledger Fabric Official Doc](https://hyperledger-fabric.readthedocs.io/en/release-2.2/)
- 