// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {console} from "forge-std/console.sol";
import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {SwapParams} from "v4-core/src/types/PoolOperation.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta, BalanceDeltaLibrary} from "v4-core/src/types/BalanceDelta.sol";
import {IEmailVerifier} from "./interfaces/IEmailVerifier.sol";
import {VerificationParams} from "./types/VerificationParams.sol";
import {IImmutableState} from "v4-periphery/src/interfaces/IImmutableState.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract LiquiDAOHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    mapping(PoolId => bytes32) public poolMerkleRoot;

    IEmailVerifier public immutable EMAIL_VERIFIER;

    event VerificationParamsSetup(PoolId indexed poolId, bytes32 indexed domainHash);

    error Unauthorized();
    error WRONG_HOOK();

    constructor(IPoolManager _poolManager, address _emailVerifier) BaseHook(_poolManager) {
        EMAIL_VERIFIER = IEmailVerifier(_emailVerifier);
    }

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: false,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    function initializeLiquiDAOPool(PoolKey memory key, uint160 sqrtPriceX96, bytes32 merkleRoot)
        external
        returns (int24 tick)
    {
        if (address(key.hooks) != address(this)) revert WRONG_HOOK();

        // Initialize the pool first
        tick = poolManager.initialize(key, sqrtPriceX96);

        // Then setup verification params
        poolMerkleRoot[key.toId()] = merkleRoot;

        emit VerificationParamsSetup(key.toId(), merkleRoot);
    }

    function updateLiquiDAOPool(PoolKey memory key, bytes32 merkleRoot) external {
        // TODO only pool owner can update the merkle root
        if (address(key.hooks) != address(this)) revert WRONG_HOOK();
        poolMerkleRoot[key.toId()] = merkleRoot;
        emit VerificationParamsSetup(key.toId(), merkleRoot);
    }

    // -----------------------------------------------
    // NOTE: see IHooks.sol for function documentation
    // -----------------------------------------------

    /**
     * @dev Hook implementation for `afterSwap`, to be overriden by the inheriting hook. The
     * flag must be set to true in the `getHookPermissions` function.
     */
    function _afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) internal override returns (bytes4, int128) {
        // use hook data to verify that the swap is authorized.
        bytes32 root = poolMerkleRoot[key.toId()];
        bytes32[] memory proof = abi.decode(hookData, (bytes32[]));

        bool verified = MerkleProof.verify(proof, root, keccak256(abi.encodePacked(sender)));

        if (!verified) revert Unauthorized();

        return (BaseHook.afterSwap.selector, BalanceDeltaLibrary.ZERO_DELTA);
    }
}
