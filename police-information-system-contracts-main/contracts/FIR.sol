// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FIR is ERC721URIStorage, AccessControl {
    bytes32 public constant POLICE_ROLE = keccak256("POLICE_ROLE");
    bytes32 public constant LAWYER_ROLE = keccak256("LAWYER_ROLE");

    mapping(uint => address) public raisedBy;

    using Counters for Counters.Counter;
    Counters.Counter public idCounter;

    event ComplaintFiled(address raisedBy, uint firId, string url);
    event ComplaintWithdrawn(address victim, uint firId, uint timestamp);
    event ComplaintAssigned(address police, address lawyer, uint timestamp);
    event CaseClosed(uint firId, uint timestamp);

    constructor() ERC721("First Report System", "FIR") {
        idCounter.increment();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function fileComplaint(string memory _tokenURI) external returns (uint256) {
        address user = _msgSender();
        uint id = idCounter.current();

        _mint(address(this), id);
        _setTokenURI(id, _tokenURI);

        raisedBy[id] = user;
        idCounter.increment();

        emit ComplaintFiled(user, id, _tokenURI);
        return id;
    }

    function withdrawComplain(uint firId) external returns (bool) {
        address user = _msgSender();
        require(
            raisedBy[firId] == user,
            string(
                abi.encodePacked(
                    "FIR: ",
                    Strings.toHexString(user),
                    " can't be withdrawn by ",
                    Strings.toString(firId)
                )
            )
        );

        _burn(firId);
        emit ComplaintWithdrawn(user, firId, block.timestamp);
        return true;
    }

    function assignToLawyer(
        uint firId,
        address lawyer
    ) external onlyRole(POLICE_ROLE) returns (bool) {
        _checkRole(LAWYER_ROLE, lawyer);
        _transfer(address(this), lawyer, firId);
        return true;
    }

    function caseSolved(
        uint firId
    ) external onlyRole(POLICE_ROLE) returns (bool) {
        address lawyer = _ownerOf(firId);
        _checkRole(LAWYER_ROLE, lawyer);
        _burn(firId);
        emit CaseClosed(firId, block.timestamp);
        return true;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(AccessControl, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
