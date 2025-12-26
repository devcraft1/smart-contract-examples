// SPDX-License-Identifier:MIT
pragma solidity >=0.4.22 <0.9.0;

contract BookAService {
    enum Statuses {
        Vacant,
        Occupied
    }
    Statuses currentStatus;
    address payable public owner;

    event Occupy(address _occupant, uint256 _value);

    constructor() {
        owner == msg.sender;
        currentStatus = Statuses.Vacant;
    }

    modifier onlyWhileVacant() {
        require(currentStatus == Statuses.Vacant, "Currently occupied.");
        _;
    }

    modifier costs(uint256 _amount) {
        require(msg.value >= _amount, "Not enough Ether provided.");
        _;
    }

    receive() external payable onlyWhileVacant costs(2 ether) {
        currentStatus = Statuses.Occupied;
        owner.transfer(msg.value);
        emit Occupy(msg.sender, msg.value);
    }
}
