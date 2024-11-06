import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, run, network } = hre;

    const { deployer } = await getNamedAccounts();

    const contract = await deployments.deploy("FIR", {
        from: deployer,
        log: true,
        waitConfirmations: 5,
    });

    if (network.name !== "hardhat") {
        await run("verify:verify", {
            address: contract.address,
        });
    }
};

func.tags = ["FIR"];
export default func;
