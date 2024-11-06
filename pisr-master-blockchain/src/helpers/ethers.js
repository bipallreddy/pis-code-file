import { ethers } from "ethers";
import FIR from "../abi/FIR.json";

export const getProvider = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
};

export const getSigner = async () => {
    return await getProvider();
};

export const getNFT = async () => {
    const signer = await getSigner();
    console.log({signer, nft: process.env.REACT_APP_NFT_ADDRESS});
    const contract = new ethers.Contract(
        process.env.REACT_APP_NFT_ADDRESS,
        FIR.abi,
        signer
    );
    return contract;
};
