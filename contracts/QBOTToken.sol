// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title QBOTToken — Strategic ERC-20 Token for QMOOSA BOT CHAIN
 * @dev Implements an initial supply of 1,000,000,000 QBOT with an on-chain enforced
 *      maximum annual inflation rate of 2% (200 basis points).
 *      No arbitrary minting can exceed the rolling 365-day issuance cap.
 *      Includes role-based access control (AccessControl) and emergency pause.
 */

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract QBOTToken is IERC20 {
    string public constant name = "Qmoosa BotChain Utility Token";
    string public constant symbol = "QBOT";
    uint8 public constant decimals = 18;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // Roles
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    mapping(bytes32 => mapping(address => bool)) private _roles;

    // Inflation & Governance Invariants
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 Billion QBOT
    uint256 public constant MAX_ANNUAL_INFLATION_BPS = 200; // 2.00% max per year (basis points)
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant INFLATION_PERIOD = 365 days;

    uint256 public currentPeriodStart;
    uint256 public periodStartSupply;
    uint256 public mintedInCurrentPeriod;
    bool public paused;

    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event Paused(address account);
    event Unpaused(address account);
    event AnnualInflationMint(address indexed recipient, uint256 amount, uint256 periodStart);

    modifier onlyRole(bytes32 role) {
        require(_roles[role][msg.sender], "QBOT: caller lacks required role");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "QBOT: token transfers are paused");
        _;
    }

    constructor(address initialAdmin, address initialTreasury) {
        require(initialAdmin != address(0), "QBOT: invalid admin");
        require(initialTreasury != address(0), "QBOT: invalid treasury");

        _roles[DEFAULT_ADMIN_ROLE][initialAdmin] = true;
        _roles[MINTER_ROLE][initialAdmin] = true;
        _roles[PAUSER_ROLE][initialAdmin] = true;

        emit RoleGranted(DEFAULT_ADMIN_ROLE, initialAdmin, msg.sender);
        emit RoleGranted(MINTER_ROLE, initialAdmin, msg.sender);
        emit RoleGranted(PAUSER_ROLE, initialAdmin, msg.sender);

        currentPeriodStart = block.timestamp;
        periodStartSupply = INITIAL_SUPPLY;
        mintedInCurrentPeriod = 0;

        _mint(initialTreasury, INITIAL_SUPPLY);
    }

    // Role Management
    function hasRole(bytes32 role, address account) external view returns (bool) {
        return _roles[role][account];
    }

    function grantRole(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _roles[role][account] = true;
        emit RoleGranted(role, account, msg.sender);
    }

    function revokeRole(bytes32 role, address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _roles[role][account] = false;
        emit RoleRevoked(role, account, msg.sender);
    }

    // Inflation Policy & Minting
    function maxMintableInCurrentPeriod() public view returns (uint256) {
        uint256 baseSupply = (block.timestamp >= currentPeriodStart + INFLATION_PERIOD) ? _totalSupply : periodStartSupply;
        uint256 maxAnnual = (baseSupply * MAX_ANNUAL_INFLATION_BPS) / BPS_DENOMINATOR;
        if (block.timestamp >= currentPeriodStart + INFLATION_PERIOD) {
            return maxAnnual;
        }
        if (mintedInCurrentPeriod >= maxAnnual) {
            return 0;
        }
        return maxAnnual - mintedInCurrentPeriod;
    }

    function mintInflation(address to, uint256 amount) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(to != address(0), "QBOT: mint to zero address");

        // Roll over annual period if 365 days elapsed
        if (block.timestamp >= currentPeriodStart + INFLATION_PERIOD) {
            currentPeriodStart = block.timestamp;
            periodStartSupply = _totalSupply;
            mintedInCurrentPeriod = 0;
        }

        uint256 maxAllowed = (periodStartSupply * MAX_ANNUAL_INFLATION_BPS) / BPS_DENOMINATOR;
        require(
            mintedInCurrentPeriod + amount <= maxAllowed,
            "QBOT: mint amount exceeds 2% annual inflation ceiling"
        );

        mintedInCurrentPeriod += amount;
        _mint(to, amount);

        emit AnnualInflationMint(to, amount, currentPeriodStart);
    }

    // Emergency Pause
    function pause() external onlyRole(PAUSER_ROLE) {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        paused = false;
        emit Unpaused(msg.sender);
    }

    // Burn
    function burn(uint256 amount) external whenNotPaused {
        require(_balances[msg.sender] >= amount, "QBOT: burn amount exceeds balance");
        _balances[msg.sender] -= amount;
        _totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    // Standard ERC-20
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 value) external override whenNotPaused returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 value) external override returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external override whenNotPaused returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= value, "QBOT: insufficient allowance");
        unchecked {
            _approve(from, msg.sender, currentAllowance - value);
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0), "QBOT: transfer from zero address");
        require(to != address(0), "QBOT: transfer to zero address");
        require(_balances[from] >= value, "QBOT: transfer amount exceeds balance");

        _balances[from] -= value;
        _balances[to] += value;
        emit Transfer(from, to, value);
    }

    function _mint(address account, uint256 value) internal {
        _totalSupply += value;
        _balances[account] += value;
        emit Transfer(address(0), account, value);
    }

    function _approve(address owner, address spender, uint256 value) internal {
        require(owner != address(0), "QBOT: approve from zero address");
        require(spender != address(0), "QBOT: approve to zero address");
        _allowances[owner][spender] = value;
        emit Approval(owner, spender, value);
    }
}
