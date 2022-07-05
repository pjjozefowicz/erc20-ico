const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenICO", function () {

  let TokenICO;
  let tokenICO;
  let owner;
  let deposit;
  let addr1;
  let addr2;
  let addrs;
  let totalSupply = 300000;

  beforeEach(async function () {
    TokenICO = await ethers.getContractFactory("TokenICO");
    [owner, deposit, addr1, addr2, ...addrs] = await ethers.getSigners();

    tokenICO = await TokenICO.deploy(totalSupply, deposit.address);
  });

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      expect(await tokenICO.admin()).to.equal(owner.address);
    });
    it("Should have deposit address equal to value passed through constructor", async function () {
      expect(await tokenICO.deposit()).to.equal(deposit.address);
    });
  });

  describe("Investing", function () {
    it("Should properly grant tokens to address that sends correct amount of ETH", async function () {
      const initialDepositBalance = await ethers.provider.getBalance(deposit.address);
      await tokenICO.connect(addr1).invest({value: ethers.utils.parseEther("1.0")});
      await tokenICO.connect(addr2).invest({value: ethers.utils.parseEther("0.3")});
      expect(await tokenICO.raisedAmount()).to.equal(ethers.utils.parseEther("1.3"));
      expect(await tokenICO.balanceOf(addr1.address)).to.equal(1000);
      expect(await tokenICO.balanceOf(addr2.address)).to.equal(300);
      expect(await tokenICO.balanceOf(owner.address)).to.equal(totalSupply - 1300);
      expect(await ethers.provider.getBalance(deposit.address)).to.equal(initialDepositBalance.add(ethers.utils.parseEther("1.3")));
    });
    it("Should revert when address wants to invest incorrect amount of ETH", async function () {
      await expect(tokenICO.connect(addr1).invest({value: ethers.utils.parseEther("6.0")})).to.be.reverted;
      await expect(tokenICO.connect(addr1).invest({value: ethers.utils.parseEther("0.001")})).to.be.reverted;
    });
    it("Should revert when address wants to invest more than 5.0 ETH", async function () {
      await tokenICO.connect(addr1).invest({value: ethers.utils.parseEther("3.0")});
      await expect(tokenICO.connect(addr1).invest({value: ethers.utils.parseEther("3.0")})).to.be.reverted;
    });
    it("Should not let you invest when ICO is not running", async function () {
      await tokenICO.halt();
      await expect(tokenICO.connect(addr1).invest({value: ethers.utils.parseEther("3.0")})).to.be.reverted;
      await tokenICO.resume();
      await tokenICO.connect(addr1).invest({value: ethers.utils.parseEther("3.0")});
      expect(await tokenICO.balanceOf(addr1.address)).to.equal(3000);
    });
  });

  describe("Transactions", function () {
    it("Should not let making transfers until lockup period has ended", async function () {
      await tokenICO.connect(addr1).invest({value: ethers.utils.parseEther("3.0")});
      await expect(tokenICO.connect(addr1).transfer(addr2.address, 200)).to.be.reverted;
      await tokenICO.connect(addr1).approve(addr2.address, 1000);
      await expect(tokenICO.connect(addr2).transferFrom(addr1.address, addrs[0].address, 1000)).to.be.reverted;
    });
    it("Should let making transfers after lockup period has ended", async function () {
      await tokenICO.connect(addr1).invest({value: ethers.utils.parseEther("3.0")});
      await ethers.provider.send("evm_increaseTime", [2 * 604800 + 3600]);
      await tokenICO.connect(addr1).transfer(addr2.address, 200);
      await tokenICO.connect(addr1).approve(addr2.address, 1000);
      await tokenICO.connect(addr2).transferFrom(addr1.address, addrs[0].address, 1000);
      expect(await tokenICO.balanceOf(addr2.address)).to.equal(200);
      expect(await tokenICO.balanceOf(addrs[0].address)).to.equal(1000);
    });
  })
  describe("Burning", function () {
    it("Should not let to burn tokens until sell has ended", async function () {
      await expect(tokenICO.burn()).to.be.reverted;
    });
    it("Should remove all owner tokens after burning", async function () {
      await ethers.provider.send("evm_increaseTime", [604800 + 3600]);
      await tokenICO.burn();
      expect(await tokenICO.balanceOf(owner.address)).to.equal(0);
    });
  })
  describe("Admin", function () {
    it("Should properly change deposit address", async function () {
      await tokenICO.changeDepositAddress(addrs[0].address);
      expect(await tokenICO.deposit()).to.equal(addrs[0].address);
    });
    it("Should not let to change deposit address by non-admin address", async function () {
      await expect(tokenICO.connect(addr1.address).changeDepositAddress(addrs[0].address)).to.be.reverted;
    });
  })
});
