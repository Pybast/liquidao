// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";

import {LiquiDAOHook} from "../src/LiquiDAOHook.sol";
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";
import {EasyPosm} from "./utils/EasyPosm.sol";
import {Fixtures} from "./utils/Fixtures.sol";

/**
 * @title LiquiDAOHookTest
 * @author LiquiDAO Team
 * @notice Comprehensive test suite for the LiquiDAOHook contract
 * @dev Tests all functionality including initialization, authorization, and swaps
 */
contract LiquiDAOHookTest is Test, Fixtures {
    using EasyPosm for IPositionManager;
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using StateLibrary for IPoolManager;

    /*//////////////////////////////////////////////////////////////
                            TEST CONTRACTS
    //////////////////////////////////////////////////////////////*/

    LiquiDAOHook public hook;

    /*//////////////////////////////////////////////////////////////
                            TEST CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint128 private constant LIQUIDITY_AMOUNT = 100e18;
    int256 private constant SWAP_AMOUNT = -1e18; // Exact input swap
    address private constant TEST_OWNER = address(0x1234);
    address private constant UNAUTHORIZED_USER = address(0x5678);

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    PoolId public poolId;
    uint256 public tokenId;
    int24 public tickLower;
    int24 public tickUpper;
    bytes32 public testMerkleRoot;
    address public testPoolOwner;

    /*//////////////////////////////////////////////////////////////
                                SETUP
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sets up the test environment
     * @dev Deploys contracts, creates pools, and provides initial liquidity
     */
    function setUp() public {
        // Deploy core infrastructure
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();
        deployAndApprovePosm(manager);

        // Deploy the hook with correct flags
        _deployHook();

        // Setup router authorization
        hook.addRouter(address(swapRouter));

        // Create and initialize pool
        _createAndInitializePool();

        // Provide initial liquidity
        _provideLiquidity();
    }

    /*//////////////////////////////////////////////////////////////
                            INITIALIZATION TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Tests successful pool initialization
     */
    function test_InitializeLiquiDAOPool_Success() public {
        // Create new pool key for this test
        PoolKey memory testKey = PoolKey(currency0, currency1, 3000, 120, IHooks(hook));
        bytes32 merkleRoot = keccak256(abi.encodePacked("test-root"));
        address poolOwner = TEST_OWNER;

        // Initialize pool
        vm.expectEmit(true, true, true, true);
        emit LiquiDAOHook.VerificationParamsSetup(testKey.toId(), merkleRoot, poolOwner);

        int24 tick = hook.initializeLiquiDAOPool(testKey, SQRT_PRICE_4_1, merkleRoot, poolOwner);

        // Verify pool configuration
        LiquiDAOHook.LiquiDAOPool memory poolConfig = hook.getPoolConfig(testKey.toId());
        assertEq(poolConfig.merkleRoot, merkleRoot);
        assertEq(poolConfig.poolOwner, poolOwner);
        assertTrue(tick != 0); // Ensure pool was initialized
    }

    /**
     * @notice Tests initialization failure with wrong hook
     */
    function test_InitializeLiquiDAOPool_RevertIf_WrongHook() public {
        PoolKey memory wrongKey = PoolKey(currency0, currency1, 3000, 120, IHooks(address(0x1111)));

        vm.expectRevert(LiquiDAOHook.InvalidHook.selector);
        hook.initializeLiquiDAOPool(wrongKey, SQRT_PRICE_1_1, keccak256("root"), TEST_OWNER);
    }

    /**
     * @notice Tests initialization failure with zero address owner
     */
    function test_InitializeLiquiDAOPool_RevertIf_ZeroAddressOwner() public {
        PoolKey memory testKey = PoolKey(currency0, currency1, 3000, 120, IHooks(hook));

        vm.expectRevert(LiquiDAOHook.ZeroAddress.selector);
        hook.initializeLiquiDAOPool(testKey, SQRT_PRICE_1_1, keccak256("root"), address(0));
    }

    /**
     * @notice Tests initialization failure with zero merkle root
     */
    function test_InitializeLiquiDAOPool_RevertIf_ZeroMerkleRoot() public {
        PoolKey memory testKey = PoolKey(currency0, currency1, 3000, 120, IHooks(hook));

        vm.expectRevert(LiquiDAOHook.ZeroMerkleRoot.selector);
        hook.initializeLiquiDAOPool(testKey, SQRT_PRICE_1_1, bytes32(0), TEST_OWNER);
    }

    /*//////////////////////////////////////////////////////////////
                            UPDATE POOL TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Tests successful pool configuration update
     */
    function test_UpdateLiquiDAOPool_Success() public {
        bytes32 newMerkleRoot = keccak256(abi.encodePacked("new-root"));
        address newOwner = TEST_OWNER;

        vm.prank(testPoolOwner);
        vm.expectEmit(true, true, true, true);
        emit LiquiDAOHook.VerificationParamsSetup(poolId, newMerkleRoot, newOwner);

        hook.updateLiquiDAOPool(key, newMerkleRoot, newOwner);

        // Verify update
        LiquiDAOHook.LiquiDAOPool memory poolConfig = hook.getPoolConfig(poolId);
        assertEq(poolConfig.merkleRoot, newMerkleRoot);
        assertEq(poolConfig.poolOwner, newOwner);
    }

    /**
     * @notice Tests update failure with unauthorized caller
     */
    function test_UpdateLiquiDAOPool_RevertIf_Unauthorized() public {
        vm.prank(UNAUTHORIZED_USER);
        vm.expectRevert(LiquiDAOHook.Unauthorized.selector);
        hook.updateLiquiDAOPool(key, keccak256("new-root"), TEST_OWNER);
    }

    /*//////////////////////////////////////////////////////////////
                            ROUTER MANAGEMENT TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Tests adding a router
     */
    function test_AddRouter_Success() public {
        address newRouter = address(0x9999);

        vm.expectEmit(true, true, false, false);
        emit LiquiDAOHook.RouterAdded(newRouter, address(this));

        hook.addRouter(newRouter);
        assertTrue(hook.isRouterVerified(newRouter));
    }

    /**
     * @notice Tests adding router with zero address
     */
    function test_AddRouter_RevertIf_ZeroAddress() public {
        vm.expectRevert(LiquiDAOHook.ZeroAddress.selector);
        hook.addRouter(address(0));
    }

    /**
     * @notice Tests removing a router
     */
    function test_RemoveRouter_Success() public {
        address routerToRemove = address(swapRouter);

        vm.expectEmit(true, true, false, false);
        emit LiquiDAOHook.RouterRemoved(routerToRemove, address(this));

        hook.removeRouter(routerToRemove);
        assertFalse(hook.isRouterVerified(routerToRemove));
    }

    /**
     * @notice Tests router management access control
     */
    function test_RouterManagement_RevertIf_NotOwner() public {
        vm.startPrank(UNAUTHORIZED_USER);

        vm.expectRevert();
        hook.addRouter(address(0x9999));

        vm.expectRevert();
        hook.removeRouter(address(swapRouter));

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                                SWAP TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Tests successful authorized swap
     */
    function test_Swap_Success_WithValidProof() public {
        // Create valid merkle proof (empty for single element tree)
        bytes32[] memory proof = new bytes32[](0);
        bytes memory hookData = abi.encode(proof);

        // Perform swap
        BalanceDelta swapDelta = swap(key, true, SWAP_AMOUNT, hookData);

        // Verify swap executed successfully
        assertEq(int256(swapDelta.amount0()), SWAP_AMOUNT);
        assertTrue(swapDelta.amount1() > 0);
    }

    /**
     * @notice Tests swap failure with invalid proof
     */
    function test_Swap_RevertIf_InvalidProof() public {
        // Create invalid proof
        bytes32[] memory invalidProof = new bytes32[](1);
        invalidProof[0] = keccak256("invalid");
        bytes memory hookData = abi.encode(invalidProof);

        // Expect unauthorized error
        vm.expectRevert();
        swap(key, true, SWAP_AMOUNT, hookData);
    }

    /**
     * @notice Tests swap failure with unauthorized router
     */
    function test_Swap_RevertIf_UnauthorizedRouter() public {
        // Remove router authorization
        hook.removeRouter(address(swapRouter));

        bytes32[] memory proof = new bytes32[](0);
        bytes memory hookData = abi.encode(proof);

        // Expect router unauthorized error
        vm.expectRevert();
        swap(key, true, SWAP_AMOUNT, hookData);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTION TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Tests hook permissions configuration
     */
    function test_GetHookPermissions() public {
        Hooks.Permissions memory permissions = hook.getHookPermissions();

        // Only beforeSwap should be enabled
        assertTrue(permissions.beforeSwap);
        assertFalse(permissions.afterSwap);
        assertFalse(permissions.beforeInitialize);
        assertFalse(permissions.afterInitialize);
        assertFalse(permissions.beforeAddLiquidity);
        assertFalse(permissions.afterAddLiquidity);
        assertFalse(permissions.beforeRemoveLiquidity);
        assertFalse(permissions.afterRemoveLiquidity);
    }

    /**
     * @notice Tests pool configuration retrieval
     */
    function test_GetPoolConfig() public {
        LiquiDAOHook.LiquiDAOPool memory config = hook.getPoolConfig(poolId);

        assertEq(config.merkleRoot, testMerkleRoot);
        assertEq(config.poolOwner, testPoolOwner);
    }

    /**
     * @notice Tests router verification check
     */
    function test_IsRouterVerified() public {
        assertTrue(hook.isRouterVerified(address(swapRouter)));
        assertFalse(hook.isRouterVerified(address(0x9999)));
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL HELPERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Deploys the hook contract with proper flags
     */
    function _deployHook() private {
        address flags = address(
            uint160(Hooks.BEFORE_SWAP_FLAG) ^ (0x4444 << 144) // Namespace to avoid collisions
        );
        bytes memory constructorArgs = abi.encode(manager, address(this));
        deployCodeTo("LiquiDAOHook.sol:LiquiDAOHook", constructorArgs, flags);
        hook = LiquiDAOHook(flags);
    }

    /**
     * @notice Creates and initializes the test pool
     */
    function _createAndInitializePool() private {
        // Create pool key
        key = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = key.toId();

        // Setup test parameters
        testMerkleRoot = keccak256(abi.encodePacked(address(this)));
        testPoolOwner = address(this);

        // Initialize pool with verification parameters
        hook.initializeLiquiDAOPool(key, SQRT_PRICE_1_1, testMerkleRoot, testPoolOwner);
    }

    /**
     * @notice Provides initial liquidity to the test pool
     */
    function _provideLiquidity() private {
        // Calculate tick range
        tickLower = TickMath.minUsableTick(key.tickSpacing);
        tickUpper = TickMath.maxUsableTick(key.tickSpacing);

        // Calculate required token amounts
        (uint256 amount0Expected, uint256 amount1Expected) = LiquidityAmounts.getAmountsForLiquidity(
            SQRT_PRICE_1_1,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            LIQUIDITY_AMOUNT
        );

        // Mint liquidity position
        (tokenId,) = posm.mint(
            key,
            tickLower,
            tickUpper,
            LIQUIDITY_AMOUNT,
            amount0Expected + 1,
            amount1Expected + 1,
            address(this),
            block.timestamp,
            ZERO_BYTES
        );
    }
}
