/* This script takes from data file random Burst acc keys and
sends random amount to random Burst acc from same file.

Author shefas*/

const { composeApi, ApiSettings } = require("@burstjs/core");
const {
  PassPhraseGenerator,
  generateMasterKeys,
  getAccountIdFromPublicKey
} = require("@burstjs/crypto");

const {
  convertNumberToNQTString,
  convertNQTStringToNumber
} = require("@burstjs/util");

const NODE = "http://127.0.0.1:8125"; //if using testnet set to "http://127.0.0.1:6876"

const apiSettings = new ApiSettings(NODE, "burst");
const api = composeApi(apiSettings);

const axios = require("axios");

const data0 = require("../data/acc0.json"); //your data file created with createAcc.js

const data = [ data0 ]; //add data files to this array

const Fee = [
  0.00735,
  0.0147,
  0.02205,
  0.0294,
  0.03675,
  0.0441,
  0.05145,
  0.0588,
  0.06615,
  0.0735,
  0.08085,
  0.0882,
  0.09555
];

let height = 711420; //block height, can be set to 0
let counter = 0;
const COUNTOSEND = 8; //how many do transactions in one block
const TOTALFILES = 0; //-1, counts from 0
const ADDRESSESINFILE = 127; //-1, counts from 0
const DEADLINE = 60; //minutes after which transactions will be removed from mempool 

function getRandInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandAddress() {
  return data[getRandInt(0, TOTALFILES)][getRandInt(0, ADDRESSESINFILE)];
}

async function currentBlock() {
  try {
    //console.log("Getting block height..");
    const blockHeight = await axios.get(
      NODE + "/burst?requestType=getMiningInfo"
    );
   // console.log("Block height:", blockHeight.data.height);
    sendTransactions(blockHeight.data.height);
  } catch (e) {
    //e is of type HttpError (as part of @burstjs/http)
    console.error(`Whooops, something went wrong: ${e.message}`);
  }
}

async function sendTransactions(heightNow) {
  if (height !== heightNow) {
    try {
      for (let i = 0; i < COUNTOSEND; i++) {
        let balanceBurst = 0;
        let sender;
        let recipiant = getRandAddress();  

        while (balanceBurst < 2) { //does acc have balance
          sender = getRandAddress();
          balance = await api.account.getAccountBalance(
            getAccountIdFromPublicKey(sender.publicKey)
          );
          balanceBurst = convertNQTStringToNumber(balance.balanceNQT);
        }
        
        const transId = await api.transaction.sendAmountToSingleRecipient({
            amountPlanck: convertNumberToNQTString(
              getRandInt(1, Math.floor(balanceBurst)-1)
            ),
            feePlanck: convertNumberToNQTString(Fee[i]),
            recipientId: getAccountIdFromPublicKey(recipiant.publicKey),
            recipientPublicKey: recipiant.publicKey,
            senderPublicKey: sender.publicKey,
            senderPrivateKey: sender.signPrivateKey,
            deadline: DEADLINE
          });
          
          //console.log(transId);
          counter++;
          console.log("Total sended trans: "+ counter +" Block: "+ heightNow)
      }
    } catch (e) {
      //e is of type HttpError (as part of @burstjs/http)
      console.error(`Whooops, something went wrong: ${e.message}`);
    }
    height = heightNow;
  }
}

setInterval(()=>currentBlock(), 10000) //miliseconds , 10000 == 10s

