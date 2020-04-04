/* This script creates and broadcast multioutsame transaction
using data created with "createdAcc.js"

Author shefas */

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

const WHAT_FILE_TO_USE = "../data/acc0.json" //specify file which you created
const data = require(WHAT_FILE_TO_USE);

const NODE = "http://127.0.0.1:8125"; //if using testnet set to "http://127.0.0.1:6876"

const apiSettings = new ApiSettings(NODE, "burst");
const api = composeApi(apiSettings);

//Slot fees, more about Burst slot system: https://burstwiki.org/en/slot-based-transaction-fees/
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

const idList = data.reduce((t, e) => {
    t.push(getAccountIdFromPublicKey(e.publicKey));
    return t;
  }, []);
  
const AMOUNT = 10; //How much BURST you want to send to each acc  
const Amount = convertNumberToNQTString(AMOUNT);

const FEE = 8 //What fee you will use, starts from 0 
const FeeNQT = convertNumberToNQTString(Fee[FEE]);

/* You need to specify acc from which you pay fee and send amount */
const PUBKEY = '89c0ee14deebd8da679...' //this is only excample how it must look
const PRIVATEKEY = '6bf7df49c...' //this is only excample how it must look

/* To get your keys use cosole.log(generateMasterKeys("YourPassword"))*/
  
async function sendToAll(){
    try{
        const transId = await api.transaction.sendSameAmountToMultipleRecipients(
              Amount,
              FeeNQT,
              idList,
              PUBKEY, 
              PRIVATEKEY 
        );
        console.log(transId)
    }catch (e) {
          // e is of type HttpError (as part of @burstjs/http)
          console.error(`Whooops, something went wrong: ${e.message}`);
      }
  }
  
sendToAll();
  