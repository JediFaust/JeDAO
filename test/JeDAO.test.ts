/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

describe("JeDAO", function () {
  let owner: SignerWithAddress;
  let userOne: SignerWithAddress;
  let userTwo: SignerWithAddress;
  let chairman: SignerWithAddress;
  let jeDAO: Contract;
  let jedi20: Contract;
  let totalAmount: number = 10000000;

  beforeEach(async function () {
    // Get the signers
    [owner, userOne, userTwo, chairman] = await ethers.getSigners();

    // Deploy ERC20BurnableMintable token on ETH
    const testERC20 = await ethers.getContractFactory("ERC20MintableBurnable");
    jedi20 = <Contract>await testERC20.deploy("JDT", "JediToken", totalAmount , 1);
    await jedi20.deployed();

    // Deploy the JeDAO
    const testDAO = await ethers.getContractFactory("JeDAO");
    jeDAO = <Contract>await testDAO.deploy(chairman.address, jedi20.address, totalAmount / 4, 3 * 24 * 60 * 60);
    await jeDAO.deployed();

    // Set the DAO as minter and burner
    await jedi20.setMinterBurner(owner.address);
  });

  it("should be deployed", async function () {
    expect(jedi20.address).to.be.properAddress;
    expect(jeDAO.address).to.be.properAddress;
  });

  it("should be able to deposit and withdraw", async function () {
    // Deposit
    await jedi20.mint(userOne.address, totalAmount / 8);

    const balanceBefore = await jedi20.balanceOf(userOne.address);
    const daoBalanceBefore = await jedi20.balanceOf(jeDAO.address);

    expect(balanceBefore).to.be.equal(totalAmount / 8);
    expect(daoBalanceBefore).to.be.equal(0);
    
    await jedi20.connect(userOne).approve(jeDAO.address, totalAmount / 8);
    await jeDAO.connect(userOne).deposit(totalAmount / 8);

    const balanceAfter = await jedi20.balanceOf(userOne.address);
    const daoBalanceAfter = await jedi20.balanceOf(jeDAO.address);

    expect(balanceAfter).to.be.equal(0);
    expect(daoBalanceAfter).to.be.equal(totalAmount / 8);
    
    // Withdraw
    await jeDAO.connect(userOne).withdraw(totalAmount / 8);

    const balanceAfterWithdraw = await jedi20.balanceOf(userOne.address);
    const daoBalanceAfterWithdraw = await jedi20.balanceOf(jeDAO.address);

    expect(balanceAfterWithdraw).to.be.equal(totalAmount / 8);
    expect(daoBalanceAfterWithdraw).to.be.equal(0);
  });

  it('should be able to add proposal, vote and finish', async function () {
    // Deposit as userOne and userTwo
    await jedi20.mint(userOne.address, totalAmount / 8 + 10);
    await jedi20.connect(userOne).approve(jeDAO.address, totalAmount / 8 + 10);
    await jeDAO.connect(userOne).deposit(totalAmount / 8 + 10);

    await jedi20.mint(userTwo.address, totalAmount / 8);
    await jedi20.connect(userTwo).approve(jeDAO.address, totalAmount / 8);
    await jeDAO.connect(userTwo).deposit(totalAmount / 8);

    // Generate call data
    var jsonInterface =
      ["function mint(address _to,uint256 _value)"];

    const iface = new ethers.utils.Interface(jsonInterface);
    const callData = iface.encodeFunctionData('mint', [userOne.address, 9990]);

    // Add proposal
    await jeDAO.connect(chairman)
      .addProposal(callData, jedi20.address, "Mint 9990 JDT to userOne");

    // Vote little bit
    await jeDAO.connect(userOne).vote(0, 10, true);

    // Turn time for 3 days
    await ethers.provider.send('evm_increaseTime', [3 * 24 * 60 * 60]);
    await ethers.provider.send('evm_mine', []);

    // Try finish
    expect(jeDAO.connect(userTwo).finishProposal(1))
      .to.be.revertedWith("Proposal is not finished");
    expect(jeDAO.connect(userTwo).finishProposal(0))
      .to.be.revertedWith("Not enough votes");

    // Vote
    await jeDAO.connect(userOne).vote(0, totalAmount / 8, true);
    await jeDAO.connect(userTwo).vote(0, totalAmount / 8, false);

    // Try finish without permission
    expect(jeDAO.connect(userTwo).finishProposal(0))
      .to.be.revertedWith("Operation failed");

    // Give permission to mint
    await jedi20.setMinterBurner(jeDAO.address);

    await jeDAO.connect(userTwo).finishProposal(0);
    
    // Check balance
    const balanceAfter = await jedi20.balanceOf(userOne.address);
    expect(balanceAfter).to.be.equal(9990 * 2);

    // Withdraw and check balance
    await jeDAO.connect(userOne).withdraw(totalAmount / 8);
    const balanceAfterWithdraw = await jedi20.balanceOf(userOne.address);
    expect(balanceAfterWithdraw).to.be.equal((9990 * 2) + totalAmount / 8);
  });

  it('should be able to finish when against votes is more', async function () {
    // Deposit
    await jedi20.mint(userOne.address, totalAmount / 4);
    await jedi20.connect(userOne).approve(jeDAO.address, totalAmount / 4);
    await jeDAO.connect(userOne).deposit(totalAmount / 4);

    // Generate call data
    var jsonInterface =
      ["function mint(address _to,uint256 _value)"];

    const iface = new ethers.utils.Interface(jsonInterface);
    const callData = iface.encodeFunctionData('mint', [userOne.address, 9990]);

    // Add identical proposals
    await jeDAO.connect(chairman)
      .addProposal(callData, jedi20.address, "Mint 9990 JDT to userOne");

    // Turn time for 3 days
    await ethers.provider.send('evm_increaseTime', [3 * 24 * 60 * 60]);
    await ethers.provider.send('evm_mine', []);

    // Try to add proposal as userTwo

    // Add another proposal
    expect(jeDAO.connect(userTwo)
      .addProposal(callData, jedi20.address, "Mint 9990 JDT to userOne"))
        .to.be.revertedWith("Chairman only");

    // Vote for last and after to first proposal
    await jeDAO.connect(userOne).vote(1, totalAmount / 4, false);
    await jeDAO.connect(userOne).vote(0, totalAmount / 4, false);

    // Try to withdraw
    expect(jeDAO.connect(userOne).withdraw(totalAmount / 4))
      .to.be.revertedWith("Can't withdraw yet");

    // Turn time for 3 days again
    await ethers.provider.send('evm_increaseTime', [3 * 24 * 60 * 60]);
    await ethers.provider.send('evm_mine', []);

    await jeDAO.connect(userTwo).finishProposal(0);
    await jeDAO.connect(userTwo).finishProposal(1);
    
    // Check balance
    const balanceAfter = await jedi20.balanceOf(userOne.address);
    expect(balanceAfter).to.be.equal(0);


    // Try to withdraw more amount
    expect(jeDAO.connect(userOne).withdraw(totalAmount / 2))
      .to.be.revertedWith("Not enough tokens");

    // Withdraw and check balance
    await jeDAO.connect(userOne).withdraw(totalAmount / 4);
    const balanceAfterWithdraw = await jedi20.balanceOf(userOne.address);
    expect(balanceAfterWithdraw).to.be.equal(totalAmount / 4);
  });

  
});
