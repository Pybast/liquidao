// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {PoolSwapTest} from "v4-core/src/test/PoolSwapTest.sol";
import {LiquiDAOHook} from "../src/LiquiDAOHook.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";

import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";
import {EasyPosm} from "./utils/EasyPosm.sol";
import {Fixtures} from "./utils/Fixtures.sol";

contract LiquiDAOHookTest is Test, Fixtures {
    using EasyPosm for IPositionManager;
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using StateLibrary for IPoolManager;

    LiquiDAOHook public hook;
    PoolId public poolId;

    uint256 public tokenId;
    int24 public tickLower;
    int24 public tickUpper;

    function setUp() public {
        // create zk email verifier
        // Deploy the hook to an address with the correct flags
        address verifier = address(uint160(uint256(keccak256("EmailVerifier"))));
        deployCodeTo("EmailVerifier.sol:EmailVerifier", "", verifier);

        // creates the pool manager, utility routers, and test tokens
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();

        deployAndApprovePosm(manager);

        // Deploy the hook to an address with the correct flags
        address flags = address(
            uint160(Hooks.BEFORE_SWAP_FLAG) ^ (0x4444 << 144) // Namespace the hook to avoid collisions
        );
        bytes memory constructorArgs = abi.encode(manager, verifier); // Add all the necessary constructor arguments from the hook
        deployCodeTo("LiquiDAOHook.sol:LiquiDAOHook", constructorArgs, flags);
        hook = LiquiDAOHook(flags);

        // Create the pool
        key = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = key.toId();

        // save verification params in the hook contract
        hook.initializeLiquiDAOPool(key, SQRT_PRICE_1_1, bytes32(keccak256("somedomain")));

        // Provide full-range liquidity to the pool
        tickLower = TickMath.minUsableTick(key.tickSpacing);
        tickUpper = TickMath.maxUsableTick(key.tickSpacing);

        uint128 liquidityAmount = 100e18;

        (uint256 amount0Expected, uint256 amount1Expected) = LiquidityAmounts.getAmountsForLiquidity(
            SQRT_PRICE_1_1,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            liquidityAmount
        );

        (tokenId,) = posm.mint(
            key,
            tickLower,
            tickUpper,
            liquidityAmount,
            amount0Expected + 1,
            amount1Expected + 1,
            address(this),
            block.timestamp,
            ZERO_BYTES
        );
    }

    function testLiquiDAOHookHooks() public {
        // positions were created in setup()

        // verify that the pool domain hash is set
        assertEq(hook.poolDomainHash(poolId), bytes32(keccak256("somedomain")));

        // Perform a test swap //
        bool zeroForOne = true;
        int256 amountSpecified = -1e18; // negative number indicates exact input swap!
        bytes memory proofCalldata;

        BalanceDelta swapDelta = swap(key, zeroForOne, amountSpecified, proofCalldata);
        // ------------------- //

        assertEq(int256(swapDelta.amount0()), amountSpecified);

        // assertEq(hook.beforeSwapCount(poolId), 1);
        // assertEq(hook.afterSwapCount(poolId), 1);
    }
}
