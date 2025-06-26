export const LiquiDAOHookAbi = [
  {
    type: "constructor",
    inputs: [
      {
        name: "_poolManager",
        type: "address",
        internalType: "contract IPoolManager",
      },
      { name: "_owner", type: "address", internalType: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addRouter",
    inputs: [{ name: "_router", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "afterAddLiquidity",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      {
        name: "params",
        type: "tuple",
        internalType: "struct ModifyLiquidityParams",
        components: [
          { name: "tickLower", type: "int24", internalType: "int24" },
          { name: "tickUpper", type: "int24", internalType: "int24" },
          {
            name: "liquidityDelta",
            type: "int256",
            internalType: "int256",
          },
          { name: "salt", type: "bytes32", internalType: "bytes32" },
        ],
      },
      { name: "delta", type: "int256", internalType: "BalanceDelta" },
      {
        name: "feesAccrued",
        type: "int256",
        internalType: "BalanceDelta",
      },
      { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
      { name: "", type: "bytes4", internalType: "bytes4" },
      { name: "", type: "int256", internalType: "BalanceDelta" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "afterDonate",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      { name: "amount0", type: "uint256", internalType: "uint256" },
      { name: "amount1", type: "uint256", internalType: "uint256" },
      { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "afterInitialize",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      {
        name: "sqrtPriceX96",
        type: "uint160",
        internalType: "uint160",
      },
      { name: "tick", type: "int24", internalType: "int24" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "afterRemoveLiquidity",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      {
        name: "params",
        type: "tuple",
        internalType: "struct ModifyLiquidityParams",
        components: [
          { name: "tickLower", type: "int24", internalType: "int24" },
          { name: "tickUpper", type: "int24", internalType: "int24" },
          {
            name: "liquidityDelta",
            type: "int256",
            internalType: "int256",
          },
          { name: "salt", type: "bytes32", internalType: "bytes32" },
        ],
      },
      { name: "delta", type: "int256", internalType: "BalanceDelta" },
      {
        name: "feesAccrued",
        type: "int256",
        internalType: "BalanceDelta",
      },
      { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
      { name: "", type: "bytes4", internalType: "bytes4" },
      { name: "", type: "int256", internalType: "BalanceDelta" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "afterSwap",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      {
        name: "params",
        type: "tuple",
        internalType: "struct SwapParams",
        components: [
          { name: "zeroForOne", type: "bool", internalType: "bool" },
          {
            name: "amountSpecified",
            type: "int256",
            internalType: "int256",
          },
          {
            name: "sqrtPriceLimitX96",
            type: "uint160",
            internalType: "uint160",
          },
        ],
      },
      { name: "delta", type: "int256", internalType: "BalanceDelta" },
      { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
      { name: "", type: "bytes4", internalType: "bytes4" },
      { name: "", type: "int128", internalType: "int128" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "beforeAddLiquidity",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      {
        name: "params",
        type: "tuple",
        internalType: "struct ModifyLiquidityParams",
        components: [
          { name: "tickLower", type: "int24", internalType: "int24" },
          { name: "tickUpper", type: "int24", internalType: "int24" },
          {
            name: "liquidityDelta",
            type: "int256",
            internalType: "int256",
          },
          { name: "salt", type: "bytes32", internalType: "bytes32" },
        ],
      },
      { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "beforeDonate",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      { name: "amount0", type: "uint256", internalType: "uint256" },
      { name: "amount1", type: "uint256", internalType: "uint256" },
      { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "beforeInitialize",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      { name: "sqrtPriceX96", type: "uint160", internalType: "uint160" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "beforeRemoveLiquidity",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      {
        name: "params",
        type: "tuple",
        internalType: "struct ModifyLiquidityParams",
        components: [
          { name: "tickLower", type: "int24", internalType: "int24" },
          { name: "tickUpper", type: "int24", internalType: "int24" },
          {
            name: "liquidityDelta",
            type: "int256",
            internalType: "int256",
          },
          { name: "salt", type: "bytes32", internalType: "bytes32" },
        ],
      },
      { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [{ name: "", type: "bytes4", internalType: "bytes4" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "beforeSwap",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      {
        name: "params",
        type: "tuple",
        internalType: "struct SwapParams",
        components: [
          { name: "zeroForOne", type: "bool", internalType: "bool" },
          {
            name: "amountSpecified",
            type: "int256",
            internalType: "int256",
          },
          {
            name: "sqrtPriceLimitX96",
            type: "uint160",
            internalType: "uint160",
          },
        ],
      },
      { name: "hookData", type: "bytes", internalType: "bytes" },
    ],
    outputs: [
      { name: "", type: "bytes4", internalType: "bytes4" },
      { name: "", type: "int256", internalType: "BeforeSwapDelta" },
      { name: "", type: "uint24", internalType: "uint24" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getHookPermissions",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Hooks.Permissions",
        components: [
          {
            name: "beforeInitialize",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "afterInitialize",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "beforeAddLiquidity",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "afterAddLiquidity",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "beforeRemoveLiquidity",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "afterRemoveLiquidity",
            type: "bool",
            internalType: "bool",
          },
          { name: "beforeSwap", type: "bool", internalType: "bool" },
          { name: "afterSwap", type: "bool", internalType: "bool" },
          { name: "beforeDonate", type: "bool", internalType: "bool" },
          { name: "afterDonate", type: "bool", internalType: "bool" },
          {
            name: "beforeSwapReturnDelta",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "afterSwapReturnDelta",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "afterAddLiquidityReturnDelta",
            type: "bool",
            internalType: "bool",
          },
          {
            name: "afterRemoveLiquidityReturnDelta",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "initializeLiquiDAOPool",
    inputs: [
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      {
        name: "sqrtPriceX96",
        type: "uint160",
        internalType: "uint160",
      },
      { name: "merkleRoot", type: "bytes32", internalType: "bytes32" },
      { name: "owner", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "tick", type: "int24", internalType: "int24" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "liquiDAOPool",
    inputs: [{ name: "", type: "bytes32", internalType: "PoolId" }],
    outputs: [
      { name: "merkleRoot", type: "bytes32", internalType: "bytes32" },
      { name: "owner", type: "address", internalType: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "poolManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IPoolManager",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "removeRouter",
    inputs: [{ name: "_router", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateLiquiDAOPool",
    inputs: [
      {
        name: "key",
        type: "tuple",
        internalType: "struct PoolKey",
        components: [
          {
            name: "currency0",
            type: "address",
            internalType: "Currency",
          },
          {
            name: "currency1",
            type: "address",
            internalType: "Currency",
          },
          { name: "fee", type: "uint24", internalType: "uint24" },
          { name: "tickSpacing", type: "int24", internalType: "int24" },
          {
            name: "hooks",
            type: "address",
            internalType: "contract IHooks",
          },
        ],
      },
      { name: "merkleRoot", type: "bytes32", internalType: "bytes32" },
      { name: "owner", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verifiedRouters",
    inputs: [{ name: "swapRouter", type: "address", internalType: "address" }],
    outputs: [{ name: "approved", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "VerificationParamsSetup",
    inputs: [
      {
        name: "poolId",
        type: "bytes32",
        indexed: true,
        internalType: "PoolId",
      },
      {
        name: "merkleRoot",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "HookNotImplemented", inputs: [] },
  { type: "error", name: "NotPoolManager", inputs: [] },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
  },
  { type: "error", name: "RouterUnauthorized", inputs: [] },
  { type: "error", name: "Unauthorized", inputs: [] },
  { type: "error", name: "WRONG_HOOK", inputs: [] },
] as const;
