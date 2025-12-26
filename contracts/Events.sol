// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventContract {
    struct Event {
        address admin;
        string name;
        uint256 date;
        uint256 price;
        uint256 ticketCount;
        uint256 ticketRemaining;
    }
    mapping(uint256 => Event) public events;
    mapping(address => mapping(uint256 => uint256)) public tickets;
    uint256 public nextId;

    function createEvent(
        string calldata name,
        uint256 date,
        uint256 price,
        uint256 ticketCount
    ) external {
        require(
            date > block.timestamp,
            "can only organize event at a future date"
        );
        require(
            ticketCount > 0,
            "can only organize event with at least 1 ticket"
        );
        events[nextId] = Event(
            msg.sender,
            name,
            date,
            price,
            ticketCount,
            ticketCount
        );
        nextId++;
    }

    function buyTicket(uint256 id, uint256 quantity)
        external
        payable
        eventExist(id)
        eventActive(id)
    {
        Event storage _event = events[id];
        require(
            msg.value == (_event.price * quantity),
            "ether sent must be equal to total ticket cost"
        );
        require(_event.ticketRemaining >= quantity, "not enough ticket left");
        _event.ticketRemaining -= quantity;
        tickets[msg.sender][id] += quantity;
    }

    function transferTicket(
        uint256 eventId,
        uint256 quantity,
        address to
    ) external eventExist(eventId) eventActive(eventId) {
        require(tickets[msg.sender][eventId] >= quantity, "not enough ticket");
        tickets[msg.sender][eventId] -= quantity;
        tickets[to][eventId] += quantity;
    }

    modifier eventExist(uint256 id) {
        require(events[id].date != 0, "this event does not exist");
        _;
    }
    modifier eventActive(uint256 id) {
        require(block.timestamp < events[id].date, "event must be active");
        _;
    }
}
