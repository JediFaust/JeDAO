/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-extraneous-import */
import * as dotenv from "dotenv";

import { task } from "hardhat/config"
import { Contract } from "ethers";
import "@nomiclabs/hardhat-waffle";

dotenv.config();
/*
bytes memory callData,
        address _recipient,
        string memory description
*/
task("deposit", "Deposit token for votes")
  .addParam("amount", "Amount of tokens")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contractAddr = process.env.CONTRACT_ADDRESS_DAO;

    const DAOContract = <Contract>await hre.ethers.getContractAt(
      "JeDAO",
      contractAddr as string,
      signer
    );

    const result = await DAOContract.deposit(taskArgs.id);

    console.log(result);
  });
