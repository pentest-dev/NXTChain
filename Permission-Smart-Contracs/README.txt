# Permission-Smart-Contracts

Smart Contracs to Manage the Ingress of new Nodes

Address on Cahin of the Ingress Node Contract
0x0000000000000000000000000000000000009999

Main Smart Contract: NodeIngress.Sol
It's the root contract that manage the logic of adding and removing nodes and the roles for each node.

NodeRules.sol
Root smart contract for the logic to limit the ability of write or read of a node

Admin.sol
Root smart contract for the list of wallet that are the initial deployer group and that can manage the smart contract system

ExposedAdminList.sol and ExposedNodeRulesList.sol are the Smart contracts that hold the public record of the list of admins and nodes with their own rules
