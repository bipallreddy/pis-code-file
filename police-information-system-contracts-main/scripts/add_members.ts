import { getNamedAccounts, deployments } from "hardhat";

const func = async () => {
    const { deployer } = await getNamedAccounts();

    const LAWYER = await deployments.read("FIR", {}, "LAWYER_ROLE");
    const POLICE = await deployments.read("FIR", {}, "POLICE_ROLE");

    const lawyers = [
        "0x8452aDfCC7DA51c96dB0C8A61159Cb054299B737"
    ];

    const police = [
        "0x8452aDfCC7DA51c96dB0C8A61159Cb054299B737"
    ];

    await deployments.execute(
        "FIR",
        {
            from: deployer,
            log: true,
            waitConfirmations: 1,
        },
        "grantRole",
        LAWYER,
        lawyers[0]
    );

    await deployments.execute(
        "FIR",
        {
            from: deployer,
            log: true,
            waitConfirmations: 1,
        },
        "grantRole",
        POLICE,
        police[0]
    );


};

func().then((res) => console.log(res));
