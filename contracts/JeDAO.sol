// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract JeDAO {
    address public chairman;
    address private _voteToken;
    uint256 private _minQuorum;
    uint256 private _debatePeriod;
    uint256 private _proposalID;

    struct Proposal {
        uint256 finishTime; 
        uint256 votesFor;
        uint256 votesAgainst;
        address recipient;
        bytes callData;
        string description;
    }

    struct Voter {
        uint256 deposit;
        uint256 withdrawTime;
        mapping(uint256 => uint256) votedAmount;
    }
    
    mapping(uint256 => Proposal) private _proposals;
    mapping(address => Voter) private _voters;


    constructor(
        address chairPerson,
        address voteToken,
        uint256 minimumQuorum,
        uint256 debatingPeriodDuration
    ) {
        chairman = chairPerson;
        _voteToken = voteToken;
        _minQuorum = minimumQuorum;
        _debatePeriod = debatingPeriodDuration;
    }


    modifier onlyChairman {
       require(msg.sender == chairman, "Chairman only");
       _;
    }


    function addProposal(
        bytes calldata callData,
        address _recipient,
        string calldata description
    ) external onlyChairman returns(uint256) {
        Proposal storage newProposal = _proposals[_proposalID];
        _proposalID++;

        newProposal.finishTime = block.timestamp + _debatePeriod;
        newProposal.recipient = _recipient;
        newProposal.callData = callData;
        newProposal.description = description;

        return _proposalID;
    }


    function vote(
        uint256 proposalID,
        uint256 amount,
        bool isVoteFor
    ) external returns(bool) {
        Proposal storage proposal = _proposals[proposalID];
        Voter storage voter = _voters[msg.sender];

        require(block.timestamp < proposal.finishTime, "Proposal is not active");
        require(voter.deposit - voter.votedAmount[proposalID] >= amount, "Not enough tokens");

        if(isVoteFor) {
            proposal.votesFor += amount;
            voter.votedAmount[proposalID] += amount;
        } else {
            proposal.votesAgainst += amount;
            voter.votedAmount[proposalID] += amount;
        }

        if(voter.withdrawTime < proposal.finishTime) {
            voter.withdrawTime = proposal.finishTime;
        }

        return true;
    }


    function finishProposal(uint256 proposalID) external view returns(bool) {
        Proposal storage proposal = _proposals[proposalID];
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;

        require(totalVotes >= _minQuorum, "Not enough votes");

        if(proposal.votesFor > proposal.votesAgainst) {
            // TODO: execute function
        }

        return true;
    }


    function deposit(uint256 amount) external returns(bool) {
        // TODO: transfer tokens to contract
        _voters[msg.sender].deposit += amount;

        return true;
    }
    

    function withdraw(uint256 amount) external returns(bool) {
        Voter storage voter = _voters[msg.sender];

        require(block.timestamp >= voter.withdrawTime, "Can't withdraw yet");
        require(voter.deposit >= amount, "Not enough tokens");

        // TODO: transfer tokens back to voter

        voter.deposit -= amount;

        return true;
    }

}