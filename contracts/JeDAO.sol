// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract JeDAO is ReentrancyGuard {
    address public chairman;
    uint256 private _minQuorum;
    uint256 private _debatePeriod;
    uint256 private _proposalID;
    ERC20 private _voteToken;

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
        ERC20 voteToken,
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
        bytes memory callData,
        address _recipient,
        string memory description
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


    function finishProposal(uint256 proposalID) external returns(bool) {
        Proposal storage proposal = _proposals[proposalID];
        require(block.timestamp >= proposal.finishTime, "Proposal is not active");

        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        require(totalVotes >= _minQuorum, "Not enough votes");

        if(proposal.votesFor > proposal.votesAgainst) {
            (bool success, ) = proposal.recipient.call(proposal.callData);

             require(success, "Operation failed");
        }

        return true;
    }


    function deposit(uint256 amount) external returns(bool) {
        _voteToken.transferFrom(msg.sender, address(this), amount);
        _voters[msg.sender].deposit += amount;

        return true;
    }
    

    function withdraw(uint256 amount) external nonReentrant returns(bool) {
        Voter storage voter = _voters[msg.sender];

        require(block.timestamp >= voter.withdrawTime, "Can't withdraw yet");
        require(voter.deposit >= amount, "Not enough tokens");

        _voteToken.transferFrom(address(this), msg.sender, amount);
        voter.deposit -= amount;

        return true;
    }

}