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
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

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
    it("Should set proper allowance after address approval", async function () {
      await token.approve(addr1.address, 100);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(100);
    });
    it("Should revert when address tries to approve more tokens than it has", async function () {
      await expect(token.connect(addr1).approve(addr2.address, 100)).to.be.reverted;
    });
    it("Should revert when address tries to approve negative amount of tokens", async function () {
      await expect(token.approve(addr2.address, -100)).to.be.reverted;
    });
    it("Should correctly transfer tokens after approval", async function () {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      await token.approve(addr1.address, 100);
      await token.connect(addr1).transferFrom(owner.address, addr2.address, 50);
      expect(await token.balanceOf(addr2.address)).to.equal(50);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(50);
      expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance - 50);
    });
    it("Should revert when address tries to transfer more tokens than were approved", async function () {
      await token.approve(addr1.address, 100);
      await expect(token.connect(addr1).transferFrom(owner.address, addr2.address, 105)).to.be.reverted;
    });
  })
});
