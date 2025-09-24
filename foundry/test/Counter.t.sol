// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";

contract CounterTest is Test {
    Counter public counter;

    function setUp() public {
        counter = new Counter();
    }

    function test_InitialValue() public {
        uint256 value = counter.number();
        assert(value == 0);
    }

    function test_SetNumber() public {
        counter.setNumber(42);
        uint256 value = counter.number();
        assert(value == 42);
    }

    function test_Increment() public {
        counter.setNumber(5);
        counter.increment();
        uint256 value = counter.number();
        assert(value == 6);
    }
}