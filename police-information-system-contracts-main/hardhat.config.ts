import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import { config as dotenvConfig } from "dotenv";

import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";

dotenvConfig();

const config: HardhatUserConfig = {
    solidity: "0.8.17",

    networks: {
        mumbai: {
            url: process.env.MUMBAI,
            accounts: [process.env.ACCOUNT as string],
        },
    },

    namedAccounts: {
        deployer: 0,
    },

    etherscan: {
        apiKey: process.env.API,
    },
};

export default config;
