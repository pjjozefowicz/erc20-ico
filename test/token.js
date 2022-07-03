const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", function () {

  let Token;
  let token;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let totalSupply = 1000000;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    token = await Token.deploy(totalSupply);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
    it("Should have total supply equal to value passed through constructor", async function () {
      expect(await token.totalSupply()).to.equal(totalSupply);
    });
  });

  describe("Transactions", function () {
    it("Should correctly transfer 1000 tokens from owner to another address", async function () {
      await token.deployed();

      const tokensSent = 1000;
      await token.transfer(addr1.address, tokensSent);

      expect(await token.balanceOf(addr1.address)).to.equal(tokensSent);
      expect(await token.balanceOf(owner.address)).to.equal(totalSupply - tokensSent);

      await token.connect(addr1).transfer(addr2.address, tokensSent);
      expect(await token.balanceOf(addr2.address)).to.equal(tokensSent);
      expect(await token.balanceOf(addr1.address)).to.equal(0);
    });
    it("Should revert when someone tries to transfer more tokens than he owns", async function () {
      await expect(token.connect(addr1).transfer(addr2.address, 1)).to.be.reverted;
      expect(await token.balanceOf(addr2.address)).to.equal(0);
    });
    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      await token.transfer(addr1.address, 100);
      await token.transfer(addr2.address, 50);

      expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(150));
      expect(await token.balanceOf(addr1.address)).to.equal(100);
      expect(await token.balanceOf(addr2.address)).to.equal(50);
    });
  })
});
