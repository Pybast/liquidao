// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IEmailVerifier {
    function verify(bytes calldata proof, bytes32 domainHash) external view returns (bytes32, bool);
}
