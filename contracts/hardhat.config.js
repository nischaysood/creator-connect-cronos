import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.20",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
            url: "http://127.0.0.1:8545",
        },
        cronosTestnet: {
            url: "https://evm-t3.cronos.org/",
            chainId: 338,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
    },
};
