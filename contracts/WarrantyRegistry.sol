// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title WarrantyVault PK — warranty hash anchor on Polygon
/// @notice Stores SHA-256 warranty hashes; no PII on-chain. txType: 0=REGISTER, 1=TRANSFER, 2=CLAIM, 3=REVOKE
contract WarrantyRegistry {
    event WarrantyRecorded(
        bytes32 indexed warrantyHash,
        uint8 indexed txType,
        bytes32 payloadHash,
        uint256 timestamp
    );

    mapping(bytes32 => bool) public isRegistered;

    function recordWarranty(
        bytes32 warrantyHash,
        uint8 txType,
        bytes32 payloadHash
    ) external {
        if (txType == 0) {
            isRegistered[warrantyHash] = true;
        }
        emit WarrantyRecorded(warrantyHash, txType, payloadHash, block.timestamp);
    }

    function checkRegistered(bytes32 warrantyHash) external view returns (bool) {
        return isRegistered[warrantyHash];
    }
}
