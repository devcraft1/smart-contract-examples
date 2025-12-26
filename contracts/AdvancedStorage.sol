// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract AdvancedStorage {
    uint256[] public ids;

    function add(uint256 _id) public {
        ids.push(_id);
    }

    function get(uint256 position) public view returns (uint256) {
        return ids[position];
    }

    function getAll() public view returns (uint256[] memory) {
        return ids;
    }

    function getLength() public view returns (uint256) {
        return ids.length;
    }
}
