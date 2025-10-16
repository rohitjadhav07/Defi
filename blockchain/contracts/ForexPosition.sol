// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ForexPosition is ReentrancyGuard {
    enum PositionType { Long, Short }
    enum PositionStatus { Open, Closed, Liquidated }
    
    struct Position {
        address trader;
        string pair;
        PositionType positionType;
        uint256 collateral;
        uint256 leverage;
        uint256 entryPrice;
        uint256 exitPrice;
        uint256 size;
        PositionStatus status;
        uint256 openedAt;
        uint256 closedAt;
        int256 pnl;
    }
    
    mapping(uint256 => Position) public positions;
    mapping(address => uint256[]) public userPositions;
    uint256 public positionCounter;
    
    address public collateralToken; // USDC/USDT for collateral
    
    event PositionOpened(uint256 indexed positionId, address indexed trader, string pair, uint256 collateral, uint256 leverage);
    event PositionClosed(uint256 indexed positionId, int256 pnl);
    event PositionLiquidated(uint256 indexed positionId);
    
    constructor(address _collateralToken) {
        collateralToken = _collateralToken;
    }
    
    // Open a new forex position
    function openPosition(
        string memory pair,
        PositionType positionType,
        uint256 collateral,
        uint256 leverage,
        uint256 entryPrice
    ) external nonReentrant returns (uint256) {
        require(collateral > 0, "Collateral must be greater than 0");
        require(leverage >= 1 && leverage <= 100, "Invalid leverage");
        
        // Transfer collateral to contract
        IERC20(collateralToken).transferFrom(msg.sender, address(this), collateral);
        
        positionCounter++;
        uint256 positionId = positionCounter;
        
        uint256 size = collateral * leverage;
        
        positions[positionId] = Position({
            trader: msg.sender,
            pair: pair,
            positionType: positionType,
            collateral: collateral,
            leverage: leverage,
            entryPrice: entryPrice,
            exitPrice: 0,
            size: size,
            status: PositionStatus.Open,
            openedAt: block.timestamp,
            closedAt: 0,
            pnl: 0
        });
        
        userPositions[msg.sender].push(positionId);
        
        emit PositionOpened(positionId, msg.sender, pair, collateral, leverage);
        return positionId;
    }
    
    // Close position
    function closePosition(uint256 positionId, uint256 exitPrice) external nonReentrant {
        Position storage position = positions[positionId];
        require(position.trader == msg.sender, "Not position owner");
        require(position.status == PositionStatus.Open, "Position not open");
        
        position.exitPrice = exitPrice;
        position.status = PositionStatus.Closed;
        position.closedAt = block.timestamp;
        
        // Calculate PnL
        int256 priceDiff;
        if (position.positionType == PositionType.Long) {
            priceDiff = int256(exitPrice) - int256(position.entryPrice);
        } else {
            priceDiff = int256(position.entryPrice) - int256(exitPrice);
        }
        
        int256 pnl = (priceDiff * int256(position.size)) / int256(position.entryPrice);
        position.pnl = pnl;
        
        // Calculate final amount
        uint256 finalAmount = uint256(int256(position.collateral) + pnl);
        
        if (finalAmount > 0) {
            IERC20(collateralToken).transfer(msg.sender, finalAmount);
        }
        
        emit PositionClosed(positionId, pnl);
    }
    
    // Get user's positions
    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }
    
    // Get position details
    function getPosition(uint256 positionId) external view returns (Position memory) {
        return positions[positionId];
    }
}
