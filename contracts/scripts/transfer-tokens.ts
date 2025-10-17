import { ethers } from "hardhat";

async function main() {
  console.log("🔄 开始转账YD代币到测试账户...");
  
  // 获取部署账户（拥有所有YD代币的账户）
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署者账户:", deployer.address);
  
  // 替换为您实际部署的合约地址
  const YD_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // 替换为实际地址
  const COURSE_MANAGER_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // 替换为实际地址
  
  // 连接到YD代币合约
  const YDToken = await ethers.getContractFactory("YDToken");
  const ydToken = YDToken.attach(YD_TOKEN_ADDRESS);
  
  // 您的MetaMask测试账户地址 - 替换为您实际的地址
  const TEST_ACCOUNT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // 替换为您的实际地址
  
  console.log("📊 检查当前余额...");
  
  // 检查部署者余额
  const deployerBalance = await ydToken.balanceOf(deployer.address);
  console.log("部署者YD余额:", ethers.formatUnits(deployerBalance, 18), "YD");
  
  // 检查测试账户余额
  const testAccountBalance = await ydToken.balanceOf(TEST_ACCOUNT);
  console.log("测试账户YD余额:", ethers.formatUnits(testAccountBalance, 18), "YD");
  
  // 转账金额 - 给测试账户转10,000个YD代币用于测试
  const transferAmount = ethers.parseUnits("10000", 18);
  
  console.log("💸 开始转账...");
  console.log("从:", deployer.address);
  console.log("到:", TEST_ACCOUNT);
  console.log("金额:", ethers.formatUnits(transferAmount, 18), "YD");
  
  try {
    // 执行转账
    const transferTx = await ydToken.transfer(TEST_ACCOUNT, transferAmount);
    console.log("⏳ 等待交易确认...");
    console.log("交易哈希:", transferTx.hash);
    
    await transferTx.wait();
    console.log("✅ 转账成功!");
    
    // 验证转账结果
    const newTestAccountBalance = await ydToken.balanceOf(TEST_ACCOUNT);
    const newDeployerBalance = await ydToken.balanceOf(deployer.address);
    
    console.log("📊 转账后余额:");
    console.log("测试账户YD余额:", ethers.formatUnits(newTestAccountBalance, 18), "YD");
    console.log("部署者YD余额:", ethers.formatUnits(newDeployerBalance, 18), "YD");
    
  } catch (error) {
    console.error("❌ 转账失败:", error);
  }
  
  console.log("🎉 操作完成!");
}

main().catch((error) => {
  console.error("💥 脚本执行失败:", error);
  process.exitCode = 1;
});