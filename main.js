let opcua = require("node-opcua")
let async = require("async")
let clientJS = require("./opcua-client")
//Read from stdin
const readline = require('readline-sync');
const inquirer = require("inquirer");

const endpointUrl = "opc.tcp://desktop-prk86af:51210/UA/SampleServer";

const options = {
    clientName: "OPCUA JS Client",
    endpoint_must_exist: false
  };

const client = opcua.OPCUAClient.create(options);
let session;
let subscription = [];


async function menu(){

  let start = function(){
      inquirer.prompt([
      {
        type: "list",
        name: "start_menu",
        message: "What do you want to do?",
        choices: ["Create session","Read","Write","Browse","Make a subscription","Create monitored item","Terminate program"],
      }
    ]).then(answer => {


      if(answer["start_menu"] == "Create session"){
        let status = clientJS.createSession(endpointUrl,client);
        status.then((value)=> {
          session = value;
          start();
        });
      }
      
      else if(answer["start_menu"] == "Read"){
        
        let status = clientJS.readNode(opcua,session);
        status.then((value)=> {
          

          start();
        })
      }
      else if(answer["start_menu"] == "Write"){
        let status = clientJS.write(session,opcua);
        status.then((value) =>{
          start();
        }) 
      }
      else if(answer["start_menu"] == "Browse"){
        let status = clientJS.browse(session);
        status.then((value) => {
          if(value == "back"){
            start();
          }
          //start();
        })
        //start();
      }
      else if(answer["start_menu"] == "Make a subscription"){
        let status = clientJS.createSubscription(session,opcua);
        status.then((value) =>{
          subscription.push(value);
          
          start();
        })
      }
      else if(answer["start_menu"] == "Create monitored item"){
        let status = clientJS.monitorItem(opcua,subscription);
        status.then((value) =>{
          start();
        })
      }
      else if(answer["start_menu"] == "Terminate program"){
        process.exit();
      }
    })
  }
  await clientJS.createConnection(endpointUrl,client);
  start();
}
   
   //menu();
   menu();

  


  