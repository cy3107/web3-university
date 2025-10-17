import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 开始部署Web3大学合约...");
  console.log("=".repeat(50));

  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.2")) {
    throw new Error("❌ 余额不足，需要至少0.2 ETH进行部署");
  }

  console.log("\n🔄 开始部署流程...");

  try {
    // 1. 部署YD代币
    console.log("\n1️⃣ 部署YD代币合约...");
    const YDToken = await ethers.getContractFactory("YDToken");
    const ydToken = await YDToken.deploy(deployer.address);
    await ydToken.waitForDeployment();
    const ydTokenAddress = await ydToken.getAddress();
    console.log("✅ YDToken 部署成功:", ydTokenAddress);

    // 2. 部署课程管理合约 (需要0.1 ETH储备)
    console.log("\n2️⃣ 部署课程管理合约...");
    const CourseManager = await ethers.getContractFactory("CourseManager");
    console.log("部署参数检查:");
    console.log("- YD Token地址:", ydTokenAddress);
    console.log("- Owner地址:", deployer.address);

    const courseManager = await CourseManager.deploy(
      ydTokenAddress,
      deployer.address,
      { value: ethers.parseEther("0.1") }
    );
    await courseManager.waitForDeployment();
    const courseManagerAddress = await courseManager.getAddress();
    console.log("✅ CourseManager 部署成功:", courseManagerAddress);

    // 3. 初始化代币储备
    console.log("\n3️⃣ 初始化代币储备...");
    const initTx = await courseManager.initializeTokenReserve();
    await initTx.wait();
    console.log("✅ 代币储备初始化完成");

    // 4. 验证部署状态
    console.log("\n4️⃣ 验证部署状态...");
    const reserves = await courseManager.getExchangeReserves();
    console.log("📊 ETH储备:", ethers.formatEther(reserves[0]), "ETH");
    console.log("📊 YD储备:", ethers.formatEther(reserves[1]), "YD");
    
    const totalSupply = await ydToken.totalSupply();
    console.log("📊 YD总供应量:", ethers.formatEther(totalSupply), "YD");

    // 5. 获取网络信息
    const network = await deployer.provider.getNetwork();
    
    // 6. 保存合约信息到前端
    console.log("\n5️⃣ 保存合约信息...");
    const contractsData = {
      YDToken: {
        address: ydTokenAddress,
        abi: YDToken.interface.fragments.map(f => f.format('json')),
      },
      CourseManager: {
        address: courseManagerAddress,
        abi: CourseManager.interface.fragments.map(f => f.format('json')),
      },
      deployedAt: new Date().toISOString(),
      deployer: deployer.address,
      network: {
        name: network.name,
        chainId: Number(network.chainId),
      }
    };

    // 确保前端目录存在
    const frontendConfigDir = path.join(__dirname, "../../frontend/src/config");
    if (!fs.existsSync(frontendConfigDir)) {
      fs.mkdirSync(frontendConfigDir, { recursive: true });
    }

    // 保存完整的合约信息
    fs.writeFileSync(
      path.join(frontendConfigDir, "contracts.json"),
      JSON.stringify(contractsData, null, 2)
    );

    // 保存简化的地址信息
    const addresses = {
      YDToken: ydTokenAddress,
      CourseManager: courseManagerAddress,
    };
    
    fs.writeFileSync(
      path.join(frontendConfigDir, "addresses.json"),
      JSON.stringify(addresses, null, 2)
    );

    // 7. 计算Gas费用
    const finalBalance = await deployer.provider.getBalance(deployer.address);
    const gasCost = balance - finalBalance;

    // 8. 显示部署摘要
    console.log("\n" + "=".repeat(50));
    console.log("🎉 部署完成!");
    console.log("📄 合约信息已保存到:", frontendConfigDir);
    console.log("\n📋 部署摘要:");
    console.log("├── YDToken:", ydTokenAddress);
    console.log("├── CourseManager:", courseManagerAddress);
    console.log("├── 网络:", network.name, `(${network.chainId})`);
    console.log("├── 部署者:", deployer.address);
    console.log("└── Gas费用:", ethers.formatEther(gasCost), "ETH");

    // 9. 如果是Sepolia网络，提示验证命令
    if (network.chainId === 11155111n) {
      console.log("\n🔍 Etherscan验证命令:");
      console.log(`npx hardhat verify --network sepolia ${ydTokenAddress} "${deployer.address}"`);
      console.log(`npx hardhat verify --network sepolia ${courseManagerAddress} "${ydTokenAddress}" "${deployer.address}"`);
    }

    // 10. 如果是本地网络，创建测试数据
    if (network.chainId === 31337n) {
      console.log("\n🧪 创建测试数据...");
      await createTestCourses(courseManager);
    }

    console.log("\n✨ 全部完成! 您现在可以启动前端应用了!");

  } catch (error) {
    console.error("\n❌ 部署过程中出现错误:", error);
    throw error;
  }
}

/**
 * 创建测试课程数据
 */
async function createTestCourses(courseManager: any) {
  try {
    const testCourses = [
      {
        courseId: "course-blockchain-001",
        title: "区块链基础入门",
        description: "从零开始学习区块链技术，了解去中心化的魅力。包含比特币、以太坊基础原理讲解。",
        price: ethers.parseEther("100"), // 100 YD
        category: "区块链基础"
      },
      {
        courseId: "course-defi-002", 
        title: "DeFi协议详解",
        description: "深入理解去中心化金融协议的运作机制，包括AMM、借贷、收益农场等。",
        price: ethers.parseEther("200"), // 200 YD
        category: "DeFi"
      },
      {
        courseId: "course-nft-003",
        title: "NFT开发实战",
        description: "手把手教你开发和部署NFT智能合约，包含ERC721、ERC1155标准详解。",
        price: ethers.parseEther("150"), // 150 YD
        category: "NFT开发"
      },
      {
        courseId: "course-smart-contract-004",
        title: "Solidity智能合约进阶",
        description: "深入学习Solidity编程，掌握合约安全、Gas优化、升级模式等高级技巧。",
        price: ethers.parseEther("300"), // 300 YD
        category: "智能合约"
      },
      {
        courseId: "course-web3-frontend-005",
        title: "Web3前端开发",
        description: "学习使用React + wagmi构建现代化Web3应用，包含钱包连接、合约交互等。",
        price: ethers.parseEther("250"), // 250 YD
        category: "前端开发"
      }
    ];

    let createdCount = 0;
    for (const course of testCourses) {
      try {
        const tx = await courseManager.createCourse(
          course.courseId,
          course.title,
          course.description,
          course.price,
          course.category
        );
        await tx.wait();
        console.log(`📚 创建测试课程: ${course.title} (${ethers.formatEther(course.price)} YD)`);
        createdCount++;
      } catch (error) {
        console.log(`⚠️ 创建课程失败: ${course.title}`, error);
      }
    }

    console.log(`✅ 测试数据创建完成 (${createdCount}/${testCourses.length} 个课程)`);
    
    // 显示课程列表
    console.log("\n📋 已创建的测试课程:");
    const courseIds = await courseManager.getAllCourseIds();
    for (let i = 0; i < courseIds.length; i++) {
      const course = await courseManager.getCourse(courseIds[i]);
      console.log(`   ${i + 1}. ${course[0]} - ${ethers.formatEther(course[2])} YD (${course[7]})`);
    }
    
  } catch (error) {
    console.log("⚠️ 测试数据创建过程中出现错误:", error);
  }
}

main().catch((error) => {
  console.error("❌ 部署失败:", error);
  process.exitCode = 1;
});