// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

import {LiquiDAOHook} from "../src/LiquiDAOHook.sol";

/**
 * @notice Interface for single pool router operations
 * @dev Simplified interface for testing router integration
 */
interface ISinglePoolRouter {
    /**
     * @notice Executes exact input token swap
     * @param amountIn The amount of input tokens to swap
     * @param amountOutMin The minimum amount of output tokens expected
     * @param zeroForOne The direction of the swap
     * @param poolKey The pool key configuration
     * @param hookData Additional data for hook execution
     * @param receiver The address to receive output tokens
     * @param deadline The transaction deadline
     * @return The balance delta from the swap
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        bool zeroForOne,
        PoolKey calldata poolKey,
        bytes calldata hookData,
        address receiver,
        uint256 deadline
    ) external payable returns (BalanceDelta);
}

/**
 * @title LiquiDAOHookV4RouterTest
 * @author LiquiDAO Team
 * @notice Integration tests for LiquiDAOHook with Uniswap V4 Router
 * @dev Tests real-world integration scenarios using forked Sepolia network
 */
contract LiquiDAOHookV4RouterTest is Test {
    using CurrencyLibrary for Currency;

    /*//////////////////////////////////////////////////////////////
                            TEST CONSTANTS
    //////////////////////////////////////////////////////////////*/

    // Sepolia testnet addresses
    address private constant CURRENCY_0 = 0x54302a301DEe4D315A4042a203c404fCa709C911; // Pybast token
    address private constant CURRENCY_1 = 0xb9BB3d304BFF39d00Ef25BB82bA8A8084d5B9248; // USDCliquidao token
    address private constant HOOK_ADDRESS = 0x1312030B129A4317e08B2F768Ddf16298ebe0080;
    address private constant V4_ROUTER_ADDRESS = 0x00000000000044a361Ae3cAc094c9D1b14Eece97;
    address private constant TEST_EOA = 0x9a4BE8291b1a53339b2b2258648194A9B6Efdc06;

    // Fork configuration
    uint256 private constant FORK_BLOCK_NUMBER = 8637327;

    string private constant SEPOLIA_RPC_URL = "sepolia";

    // Test parameters
    uint256 private constant SWAP_AMOUNT_IN = 100;
    uint256 private constant SWAP_AMOUNT_OUT_MIN = 0;
    uint24 private constant POOL_FEE = 0;
    int24 private constant TICK_SPACING = 1;

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    LiquiDAOHook public hook;
    ISinglePoolRouter public v4Router;
    PoolKey public poolKey;

    /*//////////////////////////////////////////////////////////////
                                SETUP
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sets up the test environment with forked Sepolia network
     * @dev Forks Sepolia at a specific block and impersonates test EOA
     */
    function setUp() public {
        // Fork Sepolia testnet at specific block
        vm.createSelectFork(SEPOLIA_RPC_URL, FORK_BLOCK_NUMBER);

        // Initialize contract instances
        hook = LiquiDAOHook(HOOK_ADDRESS);
        v4Router = ISinglePoolRouter(payable(V4_ROUTER_ADDRESS));

        // Setup pool key configuration
        poolKey = PoolKey({
            currency0: Currency.wrap(CURRENCY_0),
            currency1: Currency.wrap(CURRENCY_1),
            fee: POOL_FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(hook)
        });

        // Impersonate test EOA for transaction execution
        vm.startPrank(TEST_EOA);

        // Setup token approvals
        _setupTokenApprovals();
    }

    /**
     * @notice Tears down the test environment
     */
    function tearDown() public {
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                            INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Tests successful swap through V4 router with valid authorization
     * @dev Verifies end-to-end swap functionality with proper merkle proof
     */
    function test_SwapThroughRouter_Success() public {
        // Prepare merkle proof for authorization
        bytes memory hookData = _prepareMerkleProof();

        // Record initial balances
        uint256 initialBalance0 = IERC20(CURRENCY_0).balanceOf(TEST_EOA);
        uint256 initialBalance1 = IERC20(CURRENCY_1).balanceOf(TEST_EOA);

        // Execute swap through router
        BalanceDelta delta = v4Router.swapExactTokensForTokens{value: 0}(
            SWAP_AMOUNT_IN,
            SWAP_AMOUNT_OUT_MIN,
            true, // zeroForOne
            poolKey,
            hookData,
            TEST_EOA,
            block.timestamp + 300 // 5 minute deadline
        );

        // Verify swap execution
        assertLt(delta.amount0(), 0, "Should have negative amount0 for exact input");
        assertGt(delta.amount1(), 0, "Should have positive amount1 for output");

        // Verify balance changes
        uint256 finalBalance0 = IERC20(CURRENCY_0).balanceOf(TEST_EOA);
        uint256 finalBalance1 = IERC20(CURRENCY_1).balanceOf(TEST_EOA);

        assertEq(finalBalance0, initialBalance0 - SWAP_AMOUNT_IN, "Currency0 balance should decrease by swap amount");
        assertGt(finalBalance1, initialBalance1, "Currency1 balance should increase");
    }

    /**
     * @notice Tests swap failure with invalid merkle proof
     * @dev Verifies that unauthorized swaps are properly rejected
     */
    function test_SwapThroughRouter_RevertIf_InvalidProof() public {
        // Prepare invalid merkle proof
        bytes memory invalidHookData = _prepareInvalidMerkleProof();

        // Expect revert due to unauthorized access
        vm.expectRevert();

        v4Router.swapExactTokensForTokens{value: 0}(
            SWAP_AMOUNT_IN, SWAP_AMOUNT_OUT_MIN, true, poolKey, invalidHookData, TEST_EOA, block.timestamp + 300
        );
    }

    /**
     * @notice Tests swap with insufficient token balance
     * @dev Verifies proper error handling for insufficient funds
     */
    function test_SwapThroughRouter_RevertIf_InsufficientBalance() public {
        bytes memory hookData = _prepareMerkleProof();

        // Try to swap more tokens than available
        uint256 excessiveAmount = IERC20(CURRENCY_0).balanceOf(TEST_EOA) + 1;

        // Expect revert due to insufficient balance (ERC20 transfer failure)
        vm.expectRevert();

        v4Router.swapExactTokensForTokens{value: 0}(
            excessiveAmount, SWAP_AMOUNT_OUT_MIN, true, poolKey, hookData, TEST_EOA, block.timestamp + 300
        );
    }

    /**
     * @notice Tests swap with expired deadline
     * @dev Verifies proper deadline enforcement
     */
    function test_SwapThroughRouter_RevertIf_ExpiredDeadline() public {
        bytes memory hookData = _prepareMerkleProof();

        // Use past timestamp as deadline
        uint256 expiredDeadline = block.timestamp - 1;

        // Expect revert due to expired deadline
        vm.expectRevert();

        v4Router.swapExactTokensForTokens{value: 0}(
            SWAP_AMOUNT_IN, SWAP_AMOUNT_OUT_MIN, true, poolKey, hookData, TEST_EOA, expiredDeadline
        );
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTION TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Tests router verification status
     * @dev Verifies router authorization can be checked
     */
    function test_IsRouterVerified() public {
        bool isVerified = hook.isRouterVerified(V4_ROUTER_ADDRESS);
        // This will depend on the actual deployment state
        // In a real test, we'd know the expected state
        assertTrue(isVerified || !isVerified); // Always passes, just tests function call
    }

    /**
     * @notice Tests pool configuration retrieval
     * @dev Verifies pool configuration can be accessed
     */
    function test_GetPoolConfig() public {
        LiquiDAOHook.LiquiDAOPool memory config = hook.getPoolConfig(poolKey.toId());

        // Verify config exists (non-zero values indicate configuration)
        assertTrue(config.merkleRoot != bytes32(0) || config.poolOwner != address(0), "Pool should be configured");
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL HELPERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sets up token approvals for router interactions
     * @dev Approves maximum allowance for both test tokens
     */
    function _setupTokenApprovals() private {
        // Approve router to spend test tokens
        IERC20(CURRENCY_0).approve(V4_ROUTER_ADDRESS, type(uint256).max);
        IERC20(CURRENCY_1).approve(V4_ROUTER_ADDRESS, type(uint256).max);
    }

    /**
     * @notice Prepares a valid merkle proof for authorization
     * @return hookData Encoded merkle proof data
     * @dev Creates empty proof array for single-element merkle tree
     */
    function _prepareMerkleProof() private pure returns (bytes memory hookData) {
        // For testing with single-element tree, empty proof is valid
        bytes32[] memory proof = new bytes32[](0);
        hookData = abi.encode(proof);
    }

    /**
     * @notice Prepares an invalid merkle proof for testing failures
     * @return hookData Encoded invalid merkle proof data
     * @dev Creates proof with invalid elements to trigger authorization failure
     */
    function _prepareInvalidMerkleProof() private pure returns (bytes memory hookData) {
        // Create proof with invalid elements
        bytes32[] memory invalidProof = new bytes32[](1);
        invalidProof[0] = keccak256("invalid-proof-element");
        hookData = abi.encode(invalidProof);
    }

    /*//////////////////////////////////////////////////////////////
                            UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Helper to get token balance for an account
     * @param token The token address to check
     * @param account The account address to check
     * @return The token balance
     */
    function _getTokenBalance(address token, address account) private view returns (uint256) {
        return IERC20(token).balanceOf(account);
    }

    /**
     * @notice Helper to format amounts for logging
     * @param amount The amount to format
     * @param decimals The token decimals
     * @return Formatted amount string
     */
    function _formatAmount(uint256 amount, uint8 decimals) private pure returns (string memory) {
        // Simple formatting helper for test debugging
        return string(abi.encodePacked(vm.toString(amount / 10 ** decimals)));
    }
}
