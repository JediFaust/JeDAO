/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-extraneous-import */
import * as dotenv from "dotenv";

import { task } from "hardhat/config"
import { Contract } from "ethers";
import "@nomiclabs/hardhat-waffle";

dotenv.config();

task("finish", "Finish proposal")
  .addParam("id", "ID of proposal")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contractAddr = process.env.CONTRACT_ADDRESS_DAO;

    const DAOContract = <Contract>await hre.ethers.getContractAt(
      "JeDAO",
      contractAddr as string,
      signer
    );

    const result = await DAOContract.finishProposal(taskArgs.id);

    console.log(result);
  });
