/* This script creates valid Burst accounts master keys.
Master keys are generated from password, later from these
keys you can do all operations. These acc are not writen to 
blockchain until you do the first transaction

Author shefas*/

const { composeApi, ApiSettings } = require("@burstjs/core");
const {
  PassPhraseGenerator,
  generateMasterKeys  
} = require("@burstjs/crypto");
const fs = require("fs"); //Node module for writing data to file system
const NODE = "http://127.0.0.1:6876" //use local burst node, can be mainet
const DIRECTORY = "../data/acc"; //There you want to save files
const APPENDIX = 0; // every file must be with unique name, change it so files will be not overwriten

const apiSettings = new ApiSettings(NODE, "burst");
const api = composeApi(apiSettings);


const pasw = new PassPhraseGenerator();

function createAcc(files, acc) {
    for (let j = 0; j < files; j++) {
      let answer = [];
      for (let i = 0; i < acc; i++) {
        let twelweWords = pasw.generate().reduce((t, e) => t.concat(e));
        let masterKeys = generateMasterKeys(twelweWords);
        answer.push(masterKeys);
      }
      fs.writeFile(DIRECTORY+(APPENDIX + j) +".json", JSON.stringify(answer), err => {
        if (err) throw err; //'utf8'
        console.log("The file has been saved!");
      });
    }
  }
  
  createAcc(8, 128);
  /* First argument: count of files 
     Second argument: count of accounts keys generated.
     In example 128, because multioutsame transaction can hold maximum 128 recipiants*/