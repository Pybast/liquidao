// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {IHooks} from "v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {LiquiDAOHook} from "../src/LiquiDAOHook.sol";
import {IUniswapV4Router04} from "v4-router/src/interfaces/IUniswapV4Router04.sol";
import {CurrencyLibrary, Currency} from "v4-core/src/types/Currency.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {IERC20} from "openzeppelin/contracts/interfaces/IERC20.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";

interface ISinglePoolRouter {
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

contract LiquiDAOHookV4RouterTest is Test {
    using CurrencyLibrary for Currency;

    address currency0 = 0x54302a301DEe4D315A4042a203c404fCa709C911; // Pybast
    address currency1 = 0xb9BB3d304BFF39d00Ef25BB82bA8A8084d5B9248; // USDCliquidao

    LiquiDAOHook public hook = LiquiDAOHook(0x508582654e9f47CB1ED7E1D07E03baA74Ef38080);

    ISinglePoolRouter v4Router = ISinglePoolRouter(payable(0x00000000000044a361Ae3cAc094c9D1b14Eece97));

    address eoa = 0x9a4BE8291b1a53339b2b2258648194A9B6Efdc06; // Replace with actual EOA address

    function setUp() public {
        // Fork Sepolia at specific block
        vm.createSelectFork("sepolia", 8636177);

        // Impersonate EOA account
        vm.startPrank(eoa);
    }

    function test_swap() public {
        // Create an empty proof array (or real proof if you have one)
        bytes32[] memory proof = new bytes32[](0);
        bytes memory hookData = abi.encode(proof);

        // Approve v4Router to spend currency0
        IERC20(currency0).approve(address(v4Router), type(uint256).max);

        v4Router.swapExactTokensForTokens{value: 0}(
            100, // amountIn
            0, // amountOutMin
            true, // zeroForOne
            PoolKey({
                currency0: Currency.wrap(currency0),
                currency1: Currency.wrap(currency1),
                fee: 0,
                tickSpacing: 1,
                hooks: IHooks(hook)
            }),
            hookData, // <- Pass encoded proof instead of empty string
            eoa, // receiver
            block.timestamp // deadline
        );
    }
}
