// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
import "@openzeppelin/contracts/access/Ownable.sol";
import "../Final_module/Admin.sol";

contract Voting is Ownable{
    struct Voter{
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal{
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    uint public winningProposalId;
    uint public numberProposals = 0;
    WorkflowStatus public actualStatus = WorkflowStatus.RegisteringVoters;
    Proposal[] public proposals;
    mapping(address => Voter) public voters;

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);
    event test(string test);
    Admin public admin = new Admin();
   
    //Permet de changer facilement le workFlow
    function changeWorkflow(WorkflowStatus newStatus) public  onlyOwner{
        //emit WorkflowStatusChange(newStatus, actualStatus);
        require(uint8(newStatus) != uint8(actualStatus), "Ce status est deja celui actuel");
        emit WorkflowStatusChange(actualStatus, newStatus);
        actualStatus = newStatus;

        if(uint(actualStatus) == uint(WorkflowStatus.VotingSessionEnded)){
            getWinningProposal();
        }
    }

    //Enregistrement des electeurs par l'administrateur
    function voterRegistered(address _address) public onlyOwner{
        require(uint(actualStatus) == uint(WorkflowStatus.RegisteringVoters), "La periode d enregistrement a la whitelist est ferme ! ");
        admin.whitelist(_address);
        emit VoterRegistered(_address);
    }
    // Enregistrement des propositions
    function registeredProposal(string memory description)  public{
        require(actualStatus == WorkflowStatus.ProposalsRegistrationStarted, "La periode d enregistrement des propositions est ferme ! ");
        require(admin.isWhitelisted(msg.sender), "faux");
        proposals.push( Proposal(description, 0) );
        emit ProposalRegistered(numberProposals);
        numberProposals++;
    }

    //Les electeurs votent pour la proposition
    function vote(uint proposalId)  public{
        require(actualStatus == WorkflowStatus.VotingSessionStarted, "La session de vote est ferme ! ");
        require(  proposalId < numberProposals , "La proposition n'existe pas"); 
        require(!voters[msg.sender].hasVoted, "Vous avez deja vote");
        require(admin.isWhitelisted(msg.sender), "Vous n etes pas enregistre");
        voters[msg.sender].isRegistered = admin.isWhitelisted(msg.sender);
        proposals[proposalId].voteCount++;
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = proposalId;

        emit Voted(msg.sender, proposalId);

    }

    // Permet de récupérer le gagnant
    function getWinningProposal()  public  returns(uint){
        require(WorkflowStatus.VotesTallied == actualStatus ||actualStatus== WorkflowStatus.VotingSessionEnded, "Le decompte n est pas ouvert");
        require((numberProposals -1) > 0, "Il n'y a pas de prosition");
        
        uint arrayLength = proposals.length;
        uint countWinner = 0;
        for (uint i=0; i<arrayLength; i++) {
            
            if(proposals[i].voteCount > 0 && countWinner < proposals[i].voteCount){
                winningProposalId = i;
                countWinner =proposals[i].voteCount;
            }
            
        }


        changeWorkflow(WorkflowStatus.VotesTallied);
        return winningProposalId;
    }
}