// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console2} from "forge-std/Script.sol";
import {Counter} from "../src/Counter.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        Counter counter = new Counter();

        console2.log("Counter deployed at:", address(counter));

        vm.stopBroadcast();
    }
}