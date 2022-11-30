const BN = web3.utils.BN;
const { expect } = require("chai");
// const { AddressZero } = require("ethers/constants");
const { ethers, network } = require("hardhat")
const RulesList = artifacts.require('ExposedNodeRulesList.sol');
const NodeStorage = artifacts.require('NodeStorage.sol');
const NodeIngress = artifacts.require('NodeIngress.sol');
const Admin = artifacts.require('Admin.sol');

const enode1 = "9bd359fdc3a2ed5df436c3d8914b1532740128929892092b7fcb320c1b62f375"
+ "2e1092b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929";
const node1Host = "139.86.2.1";
const node1Port = 30303;
const enode2 = "892092b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929"
+ "cb320c1b62f37892092b7f59bd359fdc3a2ed5df436c3d8914b1532740128929";
const node2Host = "127.0.0.1";
const node2Port = 30304;
const enode3 = "765092b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929"
+ "920982b7fcb320c1b62f3759bd359fdc3a2ed5df436c3d8914b1532740128929";
const node3Host = "domain.com";
const node3Port = 30305;
let AddressZero = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");
const ADMIN='0x61646d696e697374726174696f6e000000000000000000000000000000000000';

contract("NodeStorage (access control)", async (accounts) => {

  let rulesListContract;
  let storageContract;
  let storageContract1;
  let ingressContract;
  let adminContract;

  beforeEach(async () => {
    adminContract = await Admin.new();
    rulesListContract = await RulesList.new();
    ingressContract = await NodeIngress.new();
    // initialize the storage
    storageContract = await NodeStorage.new(AddressZero);
    storageContract1 = await NodeStorage.new(ingressContract.address);
    console.log("   >>> Storage contract deployed with address = " + storageContract.address);
    // set rules -> storage
    rulesListContract._setStorage(storageContract.address);
    // set rules as the storage owner: storage -> rules
    await storageContract.upgradeVersion(rulesListContract.address);
    console.log("   >>> Set storage owner to Rules.address " + rulesListContract.address);
  });

  it("only owner permitted since ingressContract is explicitly set to zero", async () => {
    await expect(storageContract.upgradeVersion(rulesListContract.address, {from: accounts[1]})).
    to.be.revertedWith("only owner permitted since ingressContract is explicitly set to zero");
  })
  
  it("Sender not authorized", async () => {
    let nodeIngressContract = await NodeIngress.new();;
    await nodeIngressContract.setContractAddress(ADMIN, adminContract.address);
    rulesListContract = await RulesList.new();
    storageContract1 = await NodeStorage.new(nodeIngressContract.address);
    await expect(storageContract1.upgradeVersion(rulesListContract.address, {from: accounts[1]}))
    .to.be.revertedWith("Sender not authorized");
  })

  
  it("calculate key when onlyUseEnodeId is true", async () => {
    storageContract = await NodeStorage.new(ingressContract.address);
    await storageContract.add(enode1, node1Host, node1Port);
    await storageContract.getByIndex(0);
    await storageContract.getByIndex(1);
    await storageContract.setValidateEnodeIdOnly(false);
    await storageContract.setValidateEnodeIdOnly(true);

    await storageContract.calculateKey(enode1, node1Host, node1Port);
  })


  it("Ingress contract must have Admin contract registered", async () => {
    await expect(storageContract1.upgradeVersion(rulesListContract.address))
      .to.be.revertedWith("Ingress contract must have Admin contract registered");
  });

  it("should allow add when calling from RuleList", async () => {
    await rulesListContract._add(enode1, node1Host, node1Port);

    let size = await rulesListContract._size();
    assert.equal(size, 1);
  });

  it("should deny when calling from other than RuleList", async () => {
    try {
        await storageContract.add(enode1, node1Host, node1Port);
        assert.fail("Unauthorized sender was allowed to add a node")
    } catch (err) {
        assert.isOk(err.toString().includes("only the latestVersion can modify the list"), "Expected revert in message");
    }
  });

  it("should allow remove when calling from RuleList", async () => {
    let txResult = await rulesListContract._remove(enode1, node1Host, node1Port);
    assert.ok(txResult.receipt.status);
  });

  it("should deny when calling  from other than RuleList", async () => {
    try {
        await storageContract.remove(enode1, node1Host, node1Port);
        assert.fail("Unauthorized sender was allowed to add a node")
    } catch (err) {
        assert.isOk(err.toString().includes("only the latestVersion can modify the list"), "Expected revert in message");
    }
  });


});
