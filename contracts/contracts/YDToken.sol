// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title YDToken - 易登平台代币
 * @dev ERC20标准代币，支持铸造和销毁功能
 * 用于Web3大学平台的课程购买和价值交换
 */
contract YDToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 100万个YD代币
    
    /**
     * @dev 构造函数
     * @param initialOwner 合约初始所有者地址
     */
    constructor(address initialOwner) 
        ERC20("YuanDao Platform Token", "YD") 
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
        
        // 触发代币创建事件
        emit TokenCreated(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @dev 铸造代币功能 - 仅合约所有者可调用
     * @param to 接收新铸造代币的地址
     * @param amount 要铸造的代币数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
        emit TokenMinted(to, amount);
    }
    
    /**
     * @dev 销毁代币功能 - 任何人都可以销毁自己的代币
     * @param amount 要销毁的代币数量
     */
    function burn(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance to burn");
        
        _burn(msg.sender, amount);
        emit TokenBurned(msg.sender, amount);
    }
    
    /**
     * @dev 批量转账功能
     * @param recipients 接收者地址数组
     * @param amounts 对应的转账金额数组
     */
    function batchTransfer(address[] memory recipients, uint256[] memory amounts) public {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(amounts[i] > 0, "Amount must be greater than 0");
            
            _transfer(msg.sender, recipients[i], amounts[i]);
        }
        
        emit BatchTransfer(msg.sender, recipients, amounts);
    }
    
    // 自定义事件
    event TokenCreated(address indexed owner, uint256 initialSupply);
    event TokenMinted(address indexed to, uint256 amount);
    event TokenBurned(address indexed from, uint256 amount);
    event BatchTransfer(address indexed from, address[] recipients, uint256[] amounts);
}