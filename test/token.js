const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", function () {
  it("Should have total supply equal to value passed through constructor", async function () {
    const totalSupply = 1000000;
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(totalSupply);
    await token.deployed();

    expect(await token.totalSupply()).to.equal(totalSupply);
  });
  it("Should correctly transfer 1000 tokens from founder to another address", async function () {
    const totalSupply = 1000000;
    const [owner, addr1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(totalSupply);
    await token.deployed();

    const tokensSent = 1000;
    transferTx = await token.transfer(addr1.address, tokensSent);
    // wait until the transaction is mined
    await transferTx.wait();
    expect(await token.balanceOf(addr1.address)).to.equal(tokensSent);
    expect(await token.balanceOf(owner.address)).to.equal(totalSupply - tokensSent);
  });
  it("Should revert when someone tries to transfer more tokens than he owns", async function () {
    const totalSupply = 1000;
    const [owner, addr1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(totalSupply);
    await token.deployed();

    const tokensSent = 1005;
    await expect(token.transfer(addr1.address, tokensSent)).to.be.reverted;
  });
});
