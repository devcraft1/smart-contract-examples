// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Test {
    struct User {
        uint256 id;
        string name;
        string interest;
    }

    User[] user;

    function createUser(
        uint256 id,
        string memory name,
        string memory interest
    ) public {
        user.push(User({id: id, name: name, interest: interest}));
    }

    function UserId(uint256 id) public view returns (uint256) {
        for (uint256 i = 0; i < user.length; i++) {
            if (user[i].id == id) {
                return (user[i].id);
            }
        }
        revert("user id not found");
    }

    function UserName(uint256 id) public view returns (string memory) {
        for (uint256 i = 0; i < user.length; i++) {
            if (user[i].id == id) {
                return (user[i].name);
            }
            return "username not found";
        }
    }

    function UserInterest(uint256 id) public view returns (string memory) {
        for (uint256 i = 0; i < user.length; i++) {
            if (user[i].id == id) {
                return (user[i].interest);
            }
            return "user interest not found";
        }
    }
}
