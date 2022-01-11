// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

/**
 * @notice Stakeable is a contract who is ment to be inherited by other contract that wants Staking capabilities
 */
import "./PriceConsumerV3.sol";
import "./EmpireToken.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Stakeable is PriceConsumerV3 {
    using SafeMath for uint256;
    /**
     * @notice
      rewardPerHour is 1000 because it is used to represent 0.001, since we only use integer numbers
      This will give users 0.1% reward for each staked token / H
     */
    uint256 internal rewardPerHour;
    uint256 internal priceEmpireToken = 10;
    EmpireToken public rewardTokenInstance;

    struct Stake {
        address user;
        uint256 amount;
        uint256 since;
        uint256 claimable;
    }

    struct StakingSummary {
        uint256 total_amount;
        Stake[] stakes;
    }

    struct StakeHolder {
        address user;
        Stake[] address_stakes;
    }

    StakeHolder[] internal stakeholders;

    //stakes is used to keep track of the INDEX for the stakers in the stakes array
    mapping(address => uint256) internal stakes;

    event Staked(
        address indexed user,
        uint256 amount,
        uint256 index,
        uint256 timestamp
    );

    event withdrawStakeEvent(
        address indexed user,
        uint256 reward,
        uint256 ethstake,
        uint256 index_user
    );

    constructor(EmpireToken _token) payable {
        // This push is needed so we avoid index 0 causing bug of index-1
        rewardTokenInstance = _token;
        stakeholders.push();
    }

    function stake() public payable {
        require(msg.value >= 0.1 ether, "you can't sent less than 0.1 ether");
        require(
            rewardTokenInstance.balanceOf(address(this)) > 100,
            "Stacking is close"
        );

        _stake(msg.value);
    }

    function _stake(uint256 _amount) internal {
        require(_amount > 0, "Nothing is not stakeable !");
        uint256 index = stakes[msg.sender];
        uint256 timestamp = block.timestamp;

        // if firstime add to the mapping of stakeholder
        if (index == 0) {
            index = _addStakeholder(msg.sender);
        }

        stakeholders[index].address_stakes.push(
            Stake(msg.sender, _amount, timestamp, 0)
        );
        emit Staked(msg.sender, _amount, index, timestamp);
    }

    function withdrawStake(uint256 amount) public payable {
        //uint256 stake_index = stakes[msg.sender];
        (uint256 amountETH, uint256 amountReward) = _withdrawStake(amount, 0);
        emit withdrawStakeEvent(msg.sender, amountReward, amountETH, 0);
        rewardTokenInstance.transfer(
            msg.sender,
            amountReward
        );

        payable(msg.sender).transfer(amountETH);
    }

    /**
     * @notice
     * withdrawStake takes in an amount and a index of the stake and will remove tokens from that stake
     * Notice index of the stake is the users stake counter, starting at 0 for the first stake
     * Will return the amount to MINT onto the acount
     * Will also calculateStakeReward and reset timer
     */

    function _withdrawStake(uint256 amount, uint256 index)
        internal
        returns (uint256, uint256)
    {
        // Grab user_index which is the index to use to grab the Stake[]
        uint256 user_index = stakes[msg.sender];
        Stake memory current_stake = stakeholders[user_index].address_stakes[
            index
        ];
        require(
            current_stake.amount >= amount,
            "Staking: Cannot withdraw more than you have staked"
        );

        // Calculate available Reward first before we start modifying data
        uint256 reward = calculateStakeReward(current_stake);
        // Remove by subtracting the money unstaked
        current_stake.amount = current_stake.amount - amount;
        // If stake is empty, 0, then remove it from the array of stakes
        if (current_stake.amount == 0) {
            delete stakeholders[user_index].address_stakes[index];
        } else {
            // If not empty then replace the value of it
            stakeholders[user_index]
                .address_stakes[index]
                .amount = current_stake.amount;
            // Reset timer of stake
            stakeholders[user_index].address_stakes[index].since = block
                .timestamp;
        }

        return (amount, reward);
    }

    function _addStakeholder(address staker) internal returns (uint256) {
        // Push a empty item to the Array to make space for our new stakeholder
        stakeholders.push();
        // Calculate the index of the last item in the array by Len-1
        uint256 userIndex = stakeholders.length - 1;
        // Assign the address to the new index
        stakeholders[userIndex].user = staker;
        // Add index to the stakeholders
        stakes[staker] = userIndex;
        return userIndex;
    }

    function calculateStakeReward(Stake memory _current_stake)
        internal
        view
        returns (uint256)
    {
        uint256 priceETH = 2700e18; // prix récupérer avec chainlink sur kovan getLatestPrice();
        uint256 priceEmpireToken = 10e18;
        uint256 amountEmpireToken =  priceETH / priceEmpireToken;
        
        
        // First calculate how long the stake has been active
        // Use current seconds since epoch - the seconds since epoch the stake was made
        // The output will be duration in SECONDS ,
        // We will reward the user 0.1% per Hour So thats 0.1% per 3600 seconds
        // the alghoritm is  seconds = block.timestamp - stake seconds (block.timestap - _stake.since)
        // hours = Seconds / 3600 (seconds /3600) 3600 is an variable in Solidity names hours
        // we then multiply each token by the hours staked , then divide by the rewardPerHour rate
        return
            ((((block.timestamp - _current_stake.since) / 1 hours) *
                _current_stake.amount) / 1000) * amountEmpireToken;
    }

    /**
     * @notice
     * hasStake is used to check if a account has stakes and the total amount along with all the seperate stakes
     */
    function hasStake(address _staker)
        public
        view
        returns (StakingSummary memory)
    {
        // totalStakeAmount is used to count total staked amount of the address
        uint256 totalStakeAmount;
        // Keep a summary in memory since we need to calculate this
        StakingSummary memory summary = StakingSummary(
            0,
            stakeholders[stakes[_staker]].address_stakes
        );
        // Itterate all stakes and grab amount of stakes
        for (uint256 s = 0; s < summary.stakes.length; s += 1) {
            uint256 availableReward = calculateStakeReward(summary.stakes[s]);
            summary.stakes[s].claimable = availableReward;
            totalStakeAmount = totalStakeAmount + summary.stakes[s].amount;
        }
        // Assign calculate amount to summary
        summary.total_amount = totalStakeAmount;
        return summary;
    }
}
