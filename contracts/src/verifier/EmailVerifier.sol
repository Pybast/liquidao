// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IEmailVerifier} from "../interfaces/IEmailVerifier.sol";

contract EmailVerifier is IEmailVerifier {
    constructor() {}

    function verify(bytes calldata, bytes32 _domainHash) public view returns (bytes32, bool) {
        return (_domainHash, true);
    }
}
