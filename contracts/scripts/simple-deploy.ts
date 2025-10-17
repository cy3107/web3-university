import { ethers } from "hardhat";

async function main() {
  console.log("🧪 开始简化部署测试...");
  
  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");

  console.log("1️⃣ 部署YD代币...");
  
  // 部署 YDToken - 构造函数需要 initialOwner 参数
  const YDToken = await ethers.getContractFactory("YDToken");
  console.log("📝 部署参数: initialOwner =", deployer.address);
  
  const ydToken = await YDToken.deploy(deployer.address);
  await ydToken.waitForDeployment();
  console.log("✅ YDToken 部署成功");
  
  const ydTokenAddress = await ydToken.getAddress();
  console.log("📍 YDToken 地址:", ydTokenAddress);

  console.log("2️⃣ 测试YD代币功能...");
  
  // 测试代币基本信息
  const totalSupply = await ydToken.totalSupply();
  const owner = await ydToken.owner();
  const deployerBalance = await ydToken.balanceOf(deployer.address);
  
  console.log("📊 总供应量:", ethers.formatUnits(totalSupply, 18), "YD");
  console.log("👤 代币所有者:", owner);
  console.log("✅ 所有者匹配:", owner === deployer.address);
  console.log("💰 部署者余额:", ethers.formatUnits(deployerBalance, 18), "YD");

  console.log("3️⃣ 部署CourseManager...");
  
  // 部署 CourseManager
  const CourseManager = await ethers.getContractFactory("CourseManager");
  const courseManager = await CourseManager.deploy(
    ydTokenAddress,
    deployer.address,
    { value: ethers.parseEther("0.1") }
  );
  await courseManager.waitForDeployment();
  
  const courseManagerAddress = await courseManager.getAddress();
  console.log("📍 CourseManager 地址:", courseManagerAddress);

  console.log("4️⃣ 测试CourseManager功能...");
  
  // 测试 CourseManager 基本信息
  const cmOwner = await courseManager.owner();
  const ethReserve = await ethers.provider.getBalance(courseManagerAddress);
  const ydReserve = await ydToken.balanceOf(courseManagerAddress);
  
  console.log("👤 CourseManager所有者:", cmOwner);
  console.log("✅ 所有者匹配:", cmOwner === deployer.address);
  console.log("📊 ETH储备:", ethers.formatEther(ethReserve), "ETH");
  console.log("📊 YD储备:", ethers.formatUnits(ydReserve, 18), "YD");

  console.log("5️⃣ 初始化代币储备...");
  
  try {
    // 方法1: 直接从部署者转账给 CourseManager
    const transferAmount = ethers.parseUnits("10000", 18); // 转10000个YD代币
    console.log("📤 准备转账", ethers.formatUnits(transferAmount, 18), "YD 到 CourseManager");
    
    const transferTx = await ydToken.transfer(courseManagerAddress, transferAmount);
    await transferTx.wait();
    console.log("✅ 代币转账成功");
    
    // 验证转账结果
    const newYdReserve = await ydToken.balanceOf(courseManagerAddress);
    console.log("📊 CourseManager新的YD余额:", ethers.formatUnits(newYdReserve, 18), "YD");
    
  } catch (error) {
    console.log("❌ 方法1失败，尝试方法2...");
    
    try {
      // 方法2: 先授权，再让 CourseManager 调用 transferFrom
      const approveAmount = ethers.parseUnits("10000", 18);
      console.log("📝 授权CourseManager使用", ethers.formatUnits(approveAmount, 18), "YD");
      
      const approveTx = await ydToken.approve(courseManagerAddress, approveAmount);
      await approveTx.wait();
      console.log("✅ 授权成功");
      
      // 如果CourseManager有相应的函数来接收代币
      // const receiveTx = await courseManager.receiveTokens(approveAmount);
      // await receiveTx.wait();
      // console.log("✅ 代币接收成功");
      
    } catch (error2) {
      console.log("❌ 方法2也失败:", error2.message);
      console.log("💡 建议检查合约代码中的权限设置");
    }
  }

  console.log("6️⃣ 最终状态检查...");
  
  // 最终状态检查
  const finalEthReserve = await ethers.provider.getBalance(courseManagerAddress);
  const finalYdReserve = await ydToken.balanceOf(courseManagerAddress);
  const finalDeployerBalance = await ydToken.balanceOf(deployer.address);
  
  console.log("📊 最终状态:");
  console.log("  - CourseManager ETH余额:", ethers.formatEther(finalEthReserve), "ETH");
  console.log("  - CourseManager YD余额:", ethers.formatUnits(finalYdReserve, 18), "YD");
  console.log("  - 部署者YD余额:", ethers.formatUnits(finalDeployerBalance, 18), "YD");

  console.log("🎉 部署测试完成!");
  console.log("📋 部署结果:");
  console.log("├── YDToken:", ydTokenAddress);
  console.log("└── CourseManager:", courseManagerAddress);
  
  // 保存地址到文件
  const deploymentInfo = {
    network: "localhost",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      YDToken: ydTokenAddress,
      CourseManager: courseManagerAddress
    },
    balances: {
      courseManagerETH: ethers.formatEther(finalEthReserve),
      courseManagerYD: ethers.formatUnits(finalYdReserve, 18),
      deployerYD: ethers.formatUnits(finalDeployerBalance, 18)
    }
  };
  
  console.log("💾 部署信息已记录");
  return deploymentInfo;
}

main().catch((error) => {
  console.error("💥 部署失败:", error);
  process.exitCode = 1;
});