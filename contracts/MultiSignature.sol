pragma solidity ^0.8.0;

contract Wallet {
    address[] public approvers;
    uint256 public quorum;
    struct Transfer {
        uint256 id;
        uint256 amount;
        address payable to;
        uint256 approvals;
        bool sent;
    }
    mapping(uint256 => Transfer) transfers;
    uint256 nextId;
    mapping(address => mapping(uint256 => bool)) approvals;

    constructor(address[] memory _approvers, uint256 _quorum) payable {
        approvers = _approvers;
        quorum = _quorum;
    }

    function createTransfer(uint256 amount, address payable to)
        external
        onlyApprover
    {
        transfers[nextId] = Transfer(nextId, amount, to, 0, false);
        nextId++;
    }

    function sendTransfer(uint256 id) external onlyApprover {
        require(transfers[id].sent == false, "transfer has already been sent");
        if (transfers[id].approvals >= quorum) {
            transfers[id].sent = true;
            address payable to = transfers[id].to;
            uint256 amount = transfers[id].amount;
            to.transfer(amount);
            return;
        }
        //BUG: put this BEFORE if(transfers[id].approvals >= quorum)
        if (approvals[msg.sender][id] == false) {
            approvals[msg.sender][id] = true;
            transfers[id].approvals++;
        }
    }

    modifier onlyApprover() {
        bool allowed = false;
        for (uint256 i; i < approvers.length; i++) {
            if (approvers[i] == msg.sender) {
                allowed = true;
            }
        }
        require(allowed == true, "only approver allowed");
        _;
    }
}
