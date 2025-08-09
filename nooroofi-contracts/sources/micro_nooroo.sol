ragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

// Simple stETH token contract
contract StETHToken {
    string public name = "Staked Ether";
    string public symbol = "stETH";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    address public owner;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
}

contract NoorooVault {
    // ===== Hardcoded Addresses =====
    IERC20 constant USDC = IERC20(0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8);
    address constant FEE_RECIPIENT = 0x23F56adFc8Ff61Ebe7cb1bFdE6ae86F6DCb8D64f;
    
    StETHToken public immutable stETH;
    
    uint256 constant FEE_BPS = 50; // 0.5% fee
    uint256 constant STETH_RATE = 1000; // 1 USDC = 0.001 stETH (adjust as needed)
    
    event Deposit(address indexed user, uint256 usdcAmount, uint256 stethAmount, uint256 feeAmount);
    
    constructor() {
        stETH = new StETHToken();
    }
    
    function depositAndMint(uint256 amountIn) external {
        // Transfer USDC from sender
        require(USDC.transferFrom(msg.sender, address(this), amountIn), "USDC transfer failed");
        
        // Fee calculation (round up)
        uint256 feeAmount = (amountIn * FEE_BPS + 9999) / 10_000; // Round up division
        uint256 depositAmount = amountIn - feeAmount;
        
        // Send fee
        require(USDC.transfer(FEE_RECIPIENT, feeAmount), "Fee transfer failed");
        
        // Calculate stETH amount to mint (small amount based on deposit)
        uint256 stethAmount = depositAmount / STETH_RATE;
        require(stethAmount > 0, "Amount too small");
        
        // Mint stETH to user
        stETH.mint(msg.sender, stethAmount);
        
        emit Deposit(msg.sender, amountIn, stethAmount, feeAmount);
    }
    
    function getStETHAmount(uint256 usdcAmount) external pure returns (uint256) {
        uint256 feeAmount = (usdcAmount * FEE_BPS + 9999) / 10_000;
        uint256 depositAmount = usdcAmount - feeAmount;
        return depositAmount / STETH_RATE;
    }
    
    function withdrawUSDC(uint256 amount) external {
        require(msg.sender == FEE_RECIPIENT, "Only fee recipient can withdraw");
        require(USDC.transfer(msg.sender, amount), "USDC transfer failed");
    }
}