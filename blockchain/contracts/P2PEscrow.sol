// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract P2PEscrow is ReentrancyGuard {
    enum TradeStatus { Active, Completed, Cancelled, Disputed }
    
    struct Trade {
        address seller;
        address buyer;
        address token;
        uint256 amount;
        uint256 price;
        TradeStatus status;
        uint256 createdAt;
        uint256 completedAt;
    }
    
    mapping(uint256 => Trade) public trades;
    uint256 public tradeCounter;
    
    event TradeCreated(uint256 indexed tradeId, address indexed seller, address token, uint256 amount, uint256 price);
    event TradeFunded(uint256 indexed tradeId, address indexed buyer);
    event TradeCompleted(uint256 indexed tradeId);
    event TradeCancelled(uint256 indexed tradeId);
    event TradeDisputed(uint256 indexed tradeId);
    
    // Create a new trade (seller deposits tokens)
    function createTrade(address token, uint256 amount, uint256 price) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(price > 0, "Price must be greater than 0");
        
        tradeCounter++;
        uint256 tradeId = tradeCounter;
        
        trades[tradeId] = Trade({
            seller: msg.sender,
            buyer: address(0),
            token: token,
            amount: amount,
            price: price,
            status: TradeStatus.Active,
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        // Transfer tokens to escrow
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        emit TradeCreated(tradeId, msg.sender, token, amount, price);
        return tradeId;
    }
    
    // Buyer accepts trade and sends payment confirmation
    function acceptTrade(uint256 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.Active, "Trade not active");
        require(trade.buyer == address(0), "Trade already accepted");
        require(msg.sender != trade.seller, "Seller cannot accept own trade");
        
        trade.buyer = msg.sender;
        emit TradeFunded(tradeId, msg.sender);
    }
    
    // Seller confirms payment received and releases tokens
    function completeTrade(uint256 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.Active, "Trade not active");
        require(msg.sender == trade.seller, "Only seller can complete");
        require(trade.buyer != address(0), "No buyer yet");
        
        trade.status = TradeStatus.Completed;
        trade.completedAt = block.timestamp;
        
        // Release tokens to buyer
        IERC20(trade.token).transfer(trade.buyer, trade.amount);
        
        emit TradeCompleted(tradeId);
    }
    
    // Cancel trade (only if no buyer yet)
    function cancelTrade(uint256 tradeId) external nonReentrant {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.Active, "Trade not active");
        require(msg.sender == trade.seller, "Only seller can cancel");
        require(trade.buyer == address(0), "Cannot cancel after buyer accepted");
        
        trade.status = TradeStatus.Cancelled;
        
        // Return tokens to seller
        IERC20(trade.token).transfer(trade.seller, trade.amount);
        
        emit TradeCancelled(tradeId);
    }
    
    // Dispute trade (can be called by buyer or seller)
    function disputeTrade(uint256 tradeId) external {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.Active, "Trade not active");
        require(msg.sender == trade.seller || msg.sender == trade.buyer, "Not authorized");
        
        trade.status = TradeStatus.Disputed;
        emit TradeDisputed(tradeId);
    }
    
    // Get trade details
    function getTrade(uint256 tradeId) external view returns (Trade memory) {
        return trades[tradeId];
    }
}
