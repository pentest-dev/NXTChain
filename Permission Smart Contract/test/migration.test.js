const { expect } = require("chai");

const Migrations = artifacts.require('Migrations.sol');

contract("Migrations", async accounts => {

  let migrationContract;
  let migrationContract2;

  beforeEach(async () => {
    migrationContract = await Migrations.new();
    migrationContract2 = await Migrations.new();
  })

  it("set complete in migration", async () => {
    await migrationContract.setCompleted(1);
    await migrationContract2.setCompleted(2);
  });
  it("upgrade address in migration", async () => {
    await migrationContract.upgrade(migrationContract2.address);

  });
  
});