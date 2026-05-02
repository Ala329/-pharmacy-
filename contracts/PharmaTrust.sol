/**
 * PharmaTrust Smart Contract (Reference Implementation)
 * This contract handles pharmaceutical batch registration and tracking.
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PharmaTrust {
    enum Status { Minted, InTransit, Delivered, Dispensed }

    struct Batch {
        string batchId;
        string name;
        address manufacturer;
        address currentOwner;
        Status status;
        uint256 createdAt;
        uint256 expiryDate;
    }

    struct HistoryEntry {
        address from;
        address to;
        Status status;
        uint256 timestamp;
    }

    mapping(string => Batch) public batches;
    mapping(string => HistoryEntry[]) public batchHistory;
    mapping(string => bool) public batchExists;

    event BatchRegistered(string batchId, string name, address manufacturer);
    event BatchTransferred(string batchId, address from, address to, Status newStatus);

    modifier onlyBatchOwner(string memory _batchId) {
        require(batches[_batchId].currentOwner == msg.sender, "Not the batch owner");
        _;
    }

    function registerBatch(
        string memory _batchId,
        string memory _name,
        uint256 _expiryDate
    ) public {
        require(!batchExists[_batchId], "Batch already exists");
        
        batches[_batchId] = Batch({
            batchId: _batchId,
            name: _name,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            status: Status.Minted,
            createdAt: block.timestamp,
            expiryDate: _expiryDate
        });

        batchExists[_batchId] = true;
        
        batchHistory[_batchId].push(HistoryEntry({
            from: address(0),
            to: msg.sender,
            status: Status.Minted,
            timestamp: block.timestamp
        }));

        emit BatchRegistered(_batchId, _name, msg.sender);
    }

    function transferBatch(
        string memory _batchId,
        address _to,
        Status _newStatus
    ) public onlyBatchOwner(_batchId) {
        address previousOwner = batches[_batchId].currentOwner;
        batches[_batchId].currentOwner = _to;
        batches[_batchId].status = _newStatus;

        batchHistory[_batchId].push(HistoryEntry({
            from: previousOwner,
            to: _to,
            status: _newStatus,
            timestamp: block.timestamp
        }));

        emit BatchTransferred(_batchId, previousOwner, _to, _newStatus);
    }

    function getBatchHistory(string memory _batchId) public view returns (HistoryEntry[] memory) {
        return batchHistory[_batchId];
    }
}
