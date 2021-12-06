// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;
import "../contracts/Admin.sol";

contract Voting is Admin {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    struct Proposal {
        string description;
        uint256 voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }
    
    uint256 public winningProposalId;
    uint256 public numberProposals = 0;
    WorkflowStatus public actualStatus = WorkflowStatus.RegisteringVoters;
    //mapping(uint8 => Proposal) public proposals;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );
    event ProposalRegistered(uint256 proposalId);
    event Voted(address voter, uint256 proposalId);


    //Permet de changer facilement le workFlow
    function changeWorkflow(WorkflowStatus newStatus) public  onlyOwner{
        require(
            newStatus != actualStatus,
            "Ce status est deja celui actuel"
        );
        require(newStatus > actualStatus, "On ne peut pas revenir en arriere");
        emit WorkflowStatusChange(actualStatus, newStatus);
        actualStatus = newStatus;
    }

    //Enregistrement des electeurs par l'administrateur
    function voterRegistered(address _address) public onlyOwner {
        require(
            uint256(actualStatus) == uint256(WorkflowStatus.RegisteringVoters),
            "La periode d enregistrement a la whitelist est ferme ! "
        );
        Admin.whitelist(_address);
        emit VoterRegistered(_address);
    }

    // Enregistrement des propositions
    function registeredProposal(string memory description) public {
        require(
            actualStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "La periode d enregistrement des propositions est ferme ! "
        );
        require(Admin.isWhitelisted(msg.sender), "faux");
        require(numberProposals < 1000, "Il y a trop de propositions");
        proposals.push(Proposal(description, 0));
        emit ProposalRegistered(numberProposals);
        
        numberProposals++;
    }

    //Les electeurs votent pour la proposition
    function vote(uint256 proposalId) public {
        require(
            actualStatus == WorkflowStatus.VotingSessionStarted,
            "La session de vote est ferme ! "
        );
        require(proposalId < numberProposals, "La proposition n'existe pas");
        require(!voters[msg.sender].hasVoted, "Vous avez deja vote");
        require(Admin.isWhitelisted(msg.sender), "Vous n etes pas enregistre");
        voters[msg.sender].isRegistered = Admin.isWhitelisted(msg.sender);
        proposals[proposalId].voteCount++;
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = proposalId;

        emit Voted(msg.sender, proposalId);
        
        if(winningProposalId == 0 ){
            winningProposalId = proposalId;
        }

        if(proposals[proposalId].voteCount > proposals[winningProposalId].voteCount){
            winningProposalId = proposalId;
        }
    }

    function getProposals() public view returns(Proposal[] memory){
        return proposals;
    } 

    function getWinningProposals()public view returns(Proposal memory){
        return proposals[winningProposalId];
    }
}
