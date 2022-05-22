/* eslint-disable prefer-const */
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { Contract } from "ethers";

/*
  Optional ERC20MintableBurnable contract
  may be deployed with commented out code below
*/

async function main() {
  let jeDAO: Contract;

  const totalAmount = 10000000;
  const three_days = 3 * 24 * 60 * 60;

  const JeDAO = await ethers.getContractFactory("JeDAO");
  jeDAO = <Contract>(
    await JeDAO.deploy(process.env.CHAIRMAN_ADDRESS, process.env.CONTRACT_ADDRESS_ERC20, totalAmount / 4, three_days)
  );

  await jeDAO.deployed();

  console.log("JeDAO deployed to:", jeDAO.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
