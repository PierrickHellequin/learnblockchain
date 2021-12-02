// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.10;
 
contract SimpleStorage {
   uint data; //Cette variable est intialisé avec une valeur précise
 
   function get() public view returns (uint) {
       return data;
   }
}