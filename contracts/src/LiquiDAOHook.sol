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
import {VerificationParams} from "./types/VerificationParams.sol";
import {IImmutableState} from "v4-periphery/src/interfaces/IImmutableState.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

struct LiquiDAOPool {
    bytes32 merkleRoot;
    address owner;
}

interface IMsgSender {
    function msgSender() external view returns (address);
}

contract LiquiDAOHook is BaseHook, Ownable {
    using PoolIdLibrary for PoolKey;

    mapping(address swapRouter => bool approved) public verifiedRouters;

    mapping(PoolId => LiquiDAOPool) public liquiDAOPool;

    event VerificationParamsSetup(PoolId indexed poolId, bytes32 indexed merkleRoot, address indexed owner);

    error RouterUnauthorized();
    error Unauthorized();
    error WRONG_HOOK();

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) Ownable(msg.sender) {}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: false,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    function initializeLiquiDAOPool(PoolKey memory key, uint160 sqrtPriceX96, bytes32 merkleRoot, address owner)
        external
        returns (int24 tick)
    {
        if (address(key.hooks) != address(this)) revert WRONG_HOOK();

        // Initialize the pool first
        tick = poolManager.initialize(key, sqrtPriceX96);

        // Then setup verification params
        liquiDAOPool[key.toId()] = LiquiDAOPool({merkleRoot: merkleRoot, owner: owner});

        emit VerificationParamsSetup(key.toId(), merkleRoot, owner);
    }

    function updateLiquiDAOPool(PoolKey memory key, bytes32 merkleRoot, address owner) external {
        if (liquiDAOPool[key.toId()].owner != msg.sender) revert Unauthorized();
        if (address(key.hooks) != address(this)) revert WRONG_HOOK();

        liquiDAOPool[key.toId()] = LiquiDAOPool({merkleRoot: merkleRoot, owner: owner});

        emit VerificationParamsSetup(key.toId(), merkleRoot, owner);
    }

    function addRouter(address _router) external {
        verifiedRouters[_router] = true;
        console.log("Router added:", _router);
    }

    function removeRouter(address _router) external {
        verifiedRouters[_router] = false;
        console.log("Router removed:", _router);
    }

    /**
     * @dev Hook implementation for `beforeSwap`, to be overriden by the inheriting hook. The
     * flag must be set to true in the `getHookPermissions` function.
     */
    function _beforeSwap(address sender, PoolKey calldata key, SwapParams calldata params, bytes calldata hookData)
        internal
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        address swapper;
        try IMsgSender(sender).msgSender() returns (address _swapper) {
            swapper = _swapper;
        } catch {
            revert RouterUnauthorized();
        }

        // use hook data to verify that the swap is authorized.
        bytes32 root = liquiDAOPool[key.toId()].merkleRoot;
        bytes32[] memory proof = abi.decode(hookData, (bytes32[]));

        console.log("root");
        console.logBytes32(root);
        console.log("swapper");
        console.log(swapper);
        console.log("keccak256(abi.encodePacked(swapper))");
        console.logBytes32(keccak256(abi.encodePacked(swapper)));

        bool verified = MerkleProof.verify(proof, root, keccak256(abi.encodePacked(swapper)));

        if (!verified) revert Unauthorized();

        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, uint24(0));
    }
}
