<h1 align="center"><b>JeDAO smart contract with votes</b></h3>

<div align="left">


[![Language](https://img.shields.io/badge/language-solidity-orange.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

</div>

---

<p align="center"><h2 align="center"><b>Solidity Smart contract for DAO voting 
    </h2></b><br> 
</p>

## 📝 Table of Contents

- [EtherScan Link](#etherscan)
- [Installing](#install)
- [Contract Functions](#functions)
- [Deploy & Test Scripts](#scripts)
- [HardHat Tasks](#tasks)

## 🚀 Link on EtherScan <a name = "etherscan"></a>
JeDAO on Etherscan: <br>
https://rinkeby.etherscan.io/address/0x4C978293CD41816CDD1C29EEA1912eFfcbDB2902#code<br>




## 🚀 Installing <a name = "install"></a>
- Set validator address on scripts/deploy.ts file
- Deploy four contracts running on console:
```shell
node scripts/deploy.ts
```
- Copy address of deployed contract and paste to .env file as CONTRACT_ADDRESS_DAO
- Use <b>deposit</b>, <b>add-proposal</b>, <b>vote</b> and <b>finish</b> functions




## ⛓️ Contract Functions <a name = "functions"></a>

- **addProposal()**
>Add new proposal<br>
>Only chairman can call<br>

- **deposit()**
>Deposit tokens to vote<br>

- **vote()**
>Actual voting with id of proposal and votes amount with for or against<br>

- **finishProposal()**
>Finish proposal with current ID<br>

- **withdraw()**
>Withdraw deposited tokens with given amount<br>









## 🎈 Deploy & Test Scripts <a name = "scripts"></a>

```shell
node scripts/deploy.js
npx hardhat test  --network hardhat
```


## 💡 HardHat Tasks <a name = "tasks"></a>


```shell
npx hardhat deposit --amount
npx hardhat add-proposal --calldata --recipient --description 
npx hardhat vote --id --amount --for
npx hardhat finish --id
```
```

