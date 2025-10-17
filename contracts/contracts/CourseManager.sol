// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./YDToken.sol";

/**
 * @title CourseManager - 课程管理合约
 * @dev 综合性的课程管理和代币兑换合约
 * 功能包括：课程创建/购买、ETH/YD兑换、平台手续费收取
 */
contract CourseManager is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // 状态变量
    IERC20 public immutable ydToken;
    
    // 平台配置常量
    uint256 public constant FEE_RATE = 500;           // 5% (500/10000)
    uint256 public constant EXCHANGE_RATE = 4000;     // 1 ETH = 4000 YD
    uint256 public constant MIN_COURSE_PRICE = 1 ether; // 最低课程价格 1 YD
    uint256 public constant MAX_COURSE_PRICE = 10000 ether; // 最高课程价格 10000 YD
    
    // 流动性储备
    uint256 public ethReserve;
    uint256 public tokenReserve;
    
    // 默认储备配置
    uint256 public constant DEFAULT_TOKEN_RESERVE = 500_000 * 10**18; // 50万YD
    uint256 public constant DEFAULT_ETH_RESERVE = 0.1 ether; // 0.1 ETH
    
    // 课程数据结构
    struct Course {
        string courseId;        // 课程ID
        string title;          // 课程标题
        string description;    // 课程描述
        uint256 price;         // 课程价格(YD代币)
        address creator;       // 课程创建者
        bool isActive;         // 是否激活
        uint256 createdAt;     // 创建时间戳
        uint256 purchaseCount; // 购买次数
        string category;       // 课程分类
    }
    
    // 存储映射
    mapping(string => Course) public courses;                           // 课程ID => 课程信息
    mapping(string => mapping(address => bool)) public userCoursePurchases; // 课程ID => 用户地址 => 是否已购买
    mapping(address => uint256) public creatorEarnings;                 // 创建者收益统计
    mapping(address => string[]) public userPurchasedCourses;          // 用户已购买课程列表
    
    string[] public courseIds;                                          // 所有课程ID数组
    
    // 事件定义
    event CourseCreated(
        string indexed courseId,
        string title,
        uint256 price,
        address indexed creator,
        string category
    );
    event CoursePurchased(
        string indexed courseId,
        address indexed buyer,
        address indexed creator,
        uint256 price
    );
    event CourseUpdated(
        string indexed courseId,
        string title,
        string description,
        uint256 price
    );
    event CourseDeactivated(string indexed courseId, address indexed creator);
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event TokensSold(address indexed seller, uint256 tokenAmount, uint256 ethAmount);
    event CreatorEarningsWithdrawn(address indexed creator, uint256 amount);
    event ReservesUpdated(uint256 ethReserve, uint256 tokenReserve);
    
    /**
     * @dev 构造函数
     * @param _ydToken YD代币合约地址
     * @param initialOwner 合约初始所有者地址
     */
    constructor(address _ydToken, address initialOwner) 
        payable
        Ownable(initialOwner)
    {
        require(_ydToken != address(0), "Invalid YD token address");
        require(msg.value >= DEFAULT_ETH_RESERVE, "Insufficient ETH for reserves");
        
        ydToken = IERC20(_ydToken);
        ethReserve = msg.value;
        
        emit ReservesUpdated(ethReserve, tokenReserve);
    }
    
    // ===== 课程管理功能 =====
    
    /**
     * @dev 创建新课程
     * @param courseId 唯一的课程ID
     * @param title 课程标题
     * @param description 课程描述
     * @param price 课程价格（以YD代币计价）
     * @param category 课程分类
     */
    function createCourse(
        string memory courseId,
        string memory title,
        string memory description,
        uint256 price,
        string memory category
    ) external whenNotPaused {
        require(bytes(courseId).length > 0, "Course ID cannot be empty");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(price >= MIN_COURSE_PRICE && price <= MAX_COURSE_PRICE, "Price out of range");
        require(bytes(courses[courseId].courseId).length == 0, "Course ID already exists");
        
        courses[courseId] = Course({
            courseId: courseId,
            title: title,
            description: description,
            price: price,
            creator: msg.sender,
            isActive: true,
            createdAt: block.timestamp,
            purchaseCount: 0,
            category: category
        });
        
        courseIds.push(courseId);
        
        emit CourseCreated(courseId, title, price, msg.sender, category);
    }
    
    /**
     * @dev 购买课程
     * @param courseId 要购买的课程ID
     */
    function purchaseCourse(string memory courseId) external nonReentrant whenNotPaused {
        require(bytes(courses[courseId].courseId).length > 0, "Course does not exist");
        require(courses[courseId].isActive, "Course is not active");
        require(!userCoursePurchases[courseId][msg.sender], "Already purchased");
        require(courses[courseId].creator != msg.sender, "Cannot buy your own course");
        
        Course storage course = courses[courseId];
        
        uint256 feeAmount = (course.price * FEE_RATE) / 10000;
        uint256 creatorAmount = course.price - feeAmount;
        
        // 检查用户余额
        require(ydToken.balanceOf(msg.sender) >= course.price, "Insufficient YD balance");
        
        // 转账给创建者
        require(
            ydToken.transferFrom(msg.sender, course.creator, creatorAmount),
            "Creator payment failed"
        );
        
        // 平台手续费
        require(
            ydToken.transferFrom(msg.sender, address(this), feeAmount),
            "Fee transfer failed"
        );
        
        // 更新状态
        userCoursePurchases[courseId][msg.sender] = true;
        userPurchasedCourses[msg.sender].push(courseId);
        course.purchaseCount += 1;
        creatorEarnings[course.creator] += creatorAmount;
        
        emit CoursePurchased(courseId, msg.sender, course.creator, course.price);
    }
    
    /**
     * @dev 更新课程信息（仅创建者）
     */
    function updateCourse(
        string memory courseId,
        string memory title,
        string memory description,
        uint256 price
    ) external whenNotPaused {
        require(bytes(courses[courseId].courseId).length > 0, "Course does not exist");
        require(courses[courseId].creator == msg.sender, "Only creator can update");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(price >= MIN_COURSE_PRICE && price <= MAX_COURSE_PRICE, "Price out of range");
        
        Course storage course = courses[courseId];
        course.title = title;
        course.description = description;
        course.price = price;
        
        emit CourseUpdated(courseId, title, description, price);
    }
    
    /**
     * @dev 停用课程（仅创建者）
     */
    function deactivateCourse(string memory courseId) external {
        require(bytes(courses[courseId].courseId).length > 0, "Course does not exist");
        require(courses[courseId].creator == msg.sender, "Only creator can deactivate");
        
        courses[courseId].isActive = false;
        emit CourseDeactivated(courseId, msg.sender);
    }
    
    // ===== ETH <-> YD 兑换功能 =====
    
    /**
     * @dev 使用ETH购买YD代币
     */
    function buyTokens() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must send ETH to buy tokens");
        require(tokenReserve > 0, "Token reserve not initialized");
        
        uint256 tokenAmount = msg.value * EXCHANGE_RATE;
        require(tokenReserve >= tokenAmount, "Insufficient token reserve");
        
        ethReserve += msg.value;
        tokenReserve -= tokenAmount;
        
        ydToken.safeTransfer(msg.sender, tokenAmount);
        
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
        emit ReservesUpdated(ethReserve, tokenReserve);
    }
    
    /**
     * @dev 出售YD代币获取ETH
     * @param tokenAmount 要出售的YD代币数量
     */
    function sellTokens(uint256 tokenAmount) external nonReentrant whenNotPaused {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(tokenAmount % (1 ether) == 0, "Token amount must be whole number");
        require(ydToken.balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        
        uint256 ethAmount = tokenAmount / EXCHANGE_RATE;
        require(ethReserve >= ethAmount, "Insufficient ETH reserve");
        
        ydToken.safeTransferFrom(msg.sender, address(this), tokenAmount);
        
        ethReserve -= ethAmount;
        tokenReserve += tokenAmount;
        
        payable(msg.sender).transfer(ethAmount);
        
        emit TokensSold(msg.sender, tokenAmount, ethAmount);
        emit ReservesUpdated(ethReserve, tokenReserve);
    }
    
    // ===== 管理员函数 =====
    
    /**
     * @dev 初始化代币储备（仅在部署后调用一次）
     */
    function initializeTokenReserve() external onlyOwner {
        require(tokenReserve == 0, "Token reserve already initialized");
        
        YDToken(address(ydToken)).mint(address(this), DEFAULT_TOKEN_RESERVE);
        tokenReserve = DEFAULT_TOKEN_RESERVE;
        
        emit ReservesUpdated(ethReserve, tokenReserve);
    }
    
    /**
     * @dev 添加ETH储备
     */
    function addETHReserve() external payable onlyOwner {
        require(msg.value > 0, "Must send ETH");
        ethReserve += msg.value;
        emit ReservesUpdated(ethReserve, tokenReserve);
    }
    
    /**
     * @dev 暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ===== 查询函数 =====
    
    /**
     * @dev 检查用户是否已购买课程
     */
    function hasUserPurchasedCourse(string memory courseId, address user) external view returns (bool) {
        return userCoursePurchases[courseId][user];
    }
    
    /**
     * @dev 获取课程详细信息
     */
    function getCourse(string memory courseId) external view returns (
        string memory title,
        string memory description,
        uint256 price,
        address creator,
        bool isActive,
        uint256 createdAt,
        uint256 purchaseCount,
        string memory category
    ) {
        Course memory course = courses[courseId];
        return (
            course.title,
            course.description,
            course.price,
            course.creator,
            course.isActive,
            course.createdAt,
            course.purchaseCount,
            course.category
        );
    }
    
    /**
     * @dev 获取所有课程ID
     */
    function getAllCourseIds() external view returns (string[] memory) {
        return courseIds;
    }
    
    /**
     * @dev 获取用户已购买的课程
     */
    function getUserPurchasedCourses(address user) external view returns (string[] memory) {
        return userPurchasedCourses[user];
    }
    
    /**
     * @dev 获取兑换储备信息
     */
    function getExchangeReserves() external view returns (uint256 _ethReserve, uint256 _tokenReserve) {
        return (ethReserve, tokenReserve);
    }
    
    /**
     * @dev 计算ETH能兑换的YD数量
     */
    function calculateTokensForETH(uint256 ethAmount) external pure returns (uint256) {
        return ethAmount * EXCHANGE_RATE;
    }
    
    /**
     * @dev 计算YD能兑换的ETH数量
     */
    function calculateETHForTokens(uint256 tokenAmount) external pure returns (uint256) {
        return tokenAmount / EXCHANGE_RATE;
    }
    
    /**
     * @dev 获取创建者收益
     */
    function getCreatorEarnings(address creator) external view returns (uint256) {
        return creatorEarnings[creator];
    }
    
    /**
     * @dev 接收ETH并自动添加到储备（仅owner）
     */
    receive() external payable {
        if (msg.sender == owner()) {
            ethReserve += msg.value;
            emit ReservesUpdated(ethReserve, tokenReserve);
        } else {
            revert("Direct ETH transfers not allowed");
        }
    }
}