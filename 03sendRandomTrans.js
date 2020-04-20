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
   735000,  1470000,  2205000,  2940000,  3675000,  4410000,
   5145000,  5880000,  6615000,  7350000,  8085000,  8820000,
   9555000, 10290000, 11025000, 11760000, 12495000, 13230000,
  13965000, 14700000, 15435000, 16170000, 16905000, 17640000,
  18375000, 19110000, 19845000, 20580000, 21315000, 22050000,
  22785000, 23520000, 24255000, 24990000, 25725000, 26460000,
  27195000, 27930000, 28665000, 29400000, 30135000, 30870000,
  31605000, 32340000, 33075000, 33810000, 34545000, 35280000,
  36015000, 36750000, 37485000, 38220000, 38955000, 39690000,
  40425000, 41160000, 41895000, 42630000, 43365000, 44100000,
  44835000, 45570000, 46305000, 47040000, 47775000, 48510000,
  49245000, 49980000, 50715000, 51450000, 52185000, 52920000,
  53655000, 54390000, 55125000, 55860000, 56595000, 57330000,
  58065000, 58800000, 59535000, 60270000, 61005000, 61740000,
  62475000, 63210000, 63945000, 64680000, 65415000, 66150000,
  66885000, 67620000, 68355000, 69090000, 69825000, 70560000,
  71295000, 72030000, 72765000, 73500000
];

let height = 711420; //block height, can be set to 0
let counter = 0;
const COUNTOSEND = 8; //how many do transactions in one block, max 100
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
            feePlanck: Fee[i],
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

