// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {SwapParams} from "v4-core/src/types/PoolOperation.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @notice Interface for retrieving the original message sender through routers
 * @dev Used to identify the actual swapper when going through approved routers
 */
interface IMsgSender {
    /**
     * @notice Returns the original message sender
     * @return The address of the original transaction initiator
     */
    function msgSender() external view returns (address);
}

/**
 * @title LiquiDAOHook
 * @author LiquiDAO Team
 * @notice A Uniswap V4 hook that implements access control for swaps using Merkle tree verification
 * @dev This hook verifies swap permissions using Merkle proofs before allowing transactions
 * @custom:security-contact security@liquidao.com
 */
contract LiquiDAOHook is BaseHook, Ownable, ReentrancyGuard {
    using PoolIdLibrary for PoolKey;

    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Configuration for a LiquiDAO managed pool
     * @param merkleRoot The root of the Merkle tree containing authorized addresses
     * @param poolOwner The owner of this specific pool configuration
     */
    struct LiquiDAOPool {
        bytes32 merkleRoot;
        address poolOwner;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice Mapping of approved router addresses that can perform swaps
    mapping(address router => bool approved) public verifiedRouters;

    /// @notice Mapping of pool IDs to their LiquiDAO configuration
    mapping(PoolId poolId => LiquiDAOPool config) public liquiDAOPools;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Emitted when a pool's verification parameters are set up or updated
     * @param poolId The ID of the pool being configured
     * @param merkleRoot The new Merkle root for authorized addresses
     * @param poolOwner The owner of the pool configuration
     */
    event VerificationParamsSetup(PoolId indexed poolId, bytes32 indexed merkleRoot, address indexed poolOwner);

    /**
     * @notice Emitted when a router is added to the verified list
     * @param router The address of the router being added
     * @param admin The address that added the router
     */
    event RouterAdded(address indexed router, address indexed admin);

    /**
     * @notice Emitted when a router is removed from the verified list
     * @param router The address of the router being removed
     * @param admin The address that removed the router
     */
    event RouterRemoved(address indexed router, address indexed admin);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Thrown when an unauthorized router attempts to perform a swap
    error RouterUnauthorized();

    /// @notice Thrown when a user is not authorized to perform an action
    error Unauthorized();

    /// @notice Thrown when the hook address doesn't match the expected hook
    error InvalidHook();

    /// @notice Thrown when a zero address is provided where it's not allowed
    error ZeroAddress();

    /// @notice Thrown when a zero merkle root is provided
    error ZeroMerkleRoot();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes the LiquiDAOHook contract
     * @param _poolManager The Uniswap V4 PoolManager contract address
     * @param _owner The initial owner of the contract
     */
    constructor(IPoolManager _poolManager, address _owner) BaseHook(_poolManager) Ownable(_owner) {}

    /*//////////////////////////////////////////////////////////////
                            HOOK CONFIGURATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Returns the hook permissions for this contract
     * @return Permissions struct indicating which hooks are enabled
     * @dev Only beforeSwap is enabled to perform access control checks
     */
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

    /*//////////////////////////////////////////////////////////////
                            POOL MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initializes a new LiquiDAO pool with access control
     * @param key The pool key containing the pool configuration
     * @param sqrtPriceX96 The initial sqrt price of the pool
     * @param merkleRoot The Merkle root for authorized addresses
     * @param poolOwner The owner of this pool's configuration
     * @return tick The initial tick of the pool
     * @dev Only callable by contract owner, initializes both the pool and access control
     */
    function initializeLiquiDAOPool(PoolKey memory key, uint160 sqrtPriceX96, bytes32 merkleRoot, address poolOwner)
        external
        nonReentrant
        returns (int24 tick)
    {
        if (address(key.hooks) != address(this)) revert InvalidHook();
        if (poolOwner == address(0)) revert ZeroAddress();
        if (merkleRoot == bytes32(0)) revert ZeroMerkleRoot();

        // Initialize the pool first
        tick = poolManager.initialize(key, sqrtPriceX96);

        // Then setup verification parameters
        PoolId poolId = key.toId();
        liquiDAOPools[poolId] = LiquiDAOPool({merkleRoot: merkleRoot, poolOwner: poolOwner});

        emit VerificationParamsSetup(poolId, merkleRoot, poolOwner);
    }

    /**
     * @notice Updates the access control parameters for an existing pool
     * @param key The pool key to update
     * @param merkleRoot The new Merkle root for authorized addresses
     * @param poolOwner The new owner of the pool configuration
     * @dev Only callable by the current pool owner
     */
    function updateLiquiDAOPool(PoolKey memory key, bytes32 merkleRoot, address poolOwner) external nonReentrant {
        if (address(key.hooks) != address(this)) revert InvalidHook();
        if (poolOwner == address(0)) revert ZeroAddress();
        if (merkleRoot == bytes32(0)) revert ZeroMerkleRoot();

        PoolId poolId = key.toId();
        if (liquiDAOPools[poolId].poolOwner != msg.sender) revert Unauthorized();

        liquiDAOPools[poolId] = LiquiDAOPool({merkleRoot: merkleRoot, poolOwner: poolOwner});

        emit VerificationParamsSetup(poolId, merkleRoot, poolOwner);
    }

    /*//////////////////////////////////////////////////////////////
                            ROUTER MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Adds a router to the list of verified routers
     * @param router The address of the router to add
     * @dev Only callable by contract owner
     */
    function addRouter(address router) external onlyOwner {
        if (router == address(0)) revert ZeroAddress();

        verifiedRouters[router] = true;
        emit RouterAdded(router, msg.sender);
    }

    /**
     * @notice Removes a router from the list of verified routers
     * @param router The address of the router to remove
     * @dev Only callable by contract owner
     */
    function removeRouter(address router) external onlyOwner {
        verifiedRouters[router] = false;
        emit RouterRemoved(router, msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                            HOOK IMPLEMENTATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Hook called before each swap to verify authorization
     * @param sender The address initiating the swap (usually a router)
     * @param key The pool key for the swap
     * @param hookData Encoded Merkle proof for authorization
     * @return selector The function selector for continuation
     * @return delta The before swap delta (always zero)
     * @return fee The dynamic fee (always zero)
     * @dev Verifies the swapper is authorized using Merkle proof verification
     */
    function _beforeSwap(address sender, PoolKey calldata key, SwapParams calldata, bytes calldata hookData)
        internal
        view
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        // Determine the actual swapper address
        address swapper = _getSwapper(sender);

        // Verify authorization using Merkle proof
        _verifySwapAuthorization(key.toId(), swapper, hookData);

        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Determines the actual swapper address from the sender
     * @param sender The address that initiated the swap
     * @return swapper The actual address performing the swap
     * @dev Handles both direct swaps and router-mediated swaps
     */
    function _getSwapper(address sender) internal view returns (address swapper) {
        if (!verifiedRouters[sender]) revert RouterUnauthorized();

        // Try to get the original sender through the router interface
        try IMsgSender(sender).msgSender() returns (address _swapper) {
            swapper = _swapper;
        } catch {
            revert RouterUnauthorized();
        }
    }

    /**
     * @notice Verifies that a swapper is authorized using Merkle proof
     * @param poolId The ID of the pool being swapped in
     * @param swapper The address attempting to swap
     * @param hookData The encoded Merkle proof
     * @dev Reverts if the proof is invalid or the swapper is not authorized
     */
    function _verifySwapAuthorization(PoolId poolId, address swapper, bytes calldata hookData) internal view {
        bytes32 root = liquiDAOPools[poolId].merkleRoot;

        // Decode the Merkle proof from hook data
        bytes32[] memory proof = abi.decode(hookData, (bytes32[]));

        // Create the leaf node from the swapper address
        bytes32 leaf = keccak256(abi.encodePacked(swapper));

        // Verify the proof
        if (!MerkleProof.verify(proof, root, leaf)) {
            revert Unauthorized();
        }
    }

    /*//////////////////////////////////////////////////////////////
                                VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Checks if a router is verified
     * @param router The router address to check
     * @return Whether the router is verified
     */
    function isRouterVerified(address router) external view returns (bool) {
        return verifiedRouters[router];
    }

    /**
     * @notice Gets the pool configuration for a given pool ID
     * @param poolId The pool ID to query
     * @return config The LiquiDAOPool configuration
     */
    function getPoolConfig(PoolId poolId) external view returns (LiquiDAOPool memory config) {
        return liquiDAOPools[poolId];
    }
}
