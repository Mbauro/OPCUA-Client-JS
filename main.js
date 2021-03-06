let opcua = require("node-opcua")
let async = require("async")
let clientJS = require("./opcua-client")
//Read from stdin
const readline = require('readline-sync');
const inquirer = require("inquirer");
let endpointUrl = null;


const options = {
  clientName: "OPCUA JS Client",
  endpoint_must_exist: false,
  connectionStrategy: {
    maxRetry: 1
  }
};

const client = opcua.OPCUAClient.create(options);
let session;
let subscription = [];
let check_session=0;

let new_client = null;
async function menu() {

  if (endpointUrl == null) {
    //endpointUrl = readline.question("Insert the Server URL that you want to connect --> ");

    let check = 0;
    do {
      endpointUrl = readline.question("Insert the Server URL that you want to connect --> ");
      check = await clientJS.createConnection(endpointUrl, client);
    }while (check == 0);
      choosen_endpoint = await clientJS.discoveryEndpoint(endpointUrl,client,opcua);
      await client.disconnect();
      console.log("Security mode: "+choosen_endpoint.securityMode);
      console.log("Policy: "+[choosen_endpoint.securityPolicyUri]);
      new_client = opcua.OPCUAClient.create({
        clientName: "OPCUAL JS Client",
        endpoint_must_exist: false,
        securityPolicy:choosen_endpoint.securityPolicyUri,
        securityMode:choosen_endpoint.securityMode,
        
        connectionStrategy: {

          maxRetry: 1
        }
      })
      check=0;
      check=await clientJS.createConnection(choosen_endpoint.endpointUrl, new_client);
      while(check==0){
        console.log("Please, select a supported endpoint: ");
        await clientJS.createConnection(endpointUrl, client);
        choosen_endpoint = await clientJS.discoveryEndpoint(endpointUrl,client,opcua);
        check=await clientJS.createConnection(choosen_endpoint.endpointUrl, new_client);
      }
    
    
    start();
  }
}

let start = function () {
  
  inquirer.prompt([
    {
      type: "list",
      name: "start_menu",
      message: "What do you want to do?",
      choices: ["Create session", "Read", "Write", "Browse", "Create a subscription", "Delete an existing subscription",
        "Create monitored item", "Terminate program"],
    }
  ]).then(answer => {


    if (answer["start_menu"] == "Create session") {
      check_session+=1;
      if(check_session==1){
        let status = clientJS.createSession(choosen_endpoint, new_client);
        status.then((value) => {
          session = value;
          start();
        });
      }else{
        console.log("Session has been already created!!!!");
        start();
      }
    }

    else if (answer["start_menu"] == "Read") {

      let status = clientJS.readNode(opcua, session);
      status.then((value) => {


        start();
      })
    }
    else if (answer["start_menu"] == "Write") {
      let status = clientJS.write(session, opcua);
      status.then((value) => {
        start();
      })
    }

    else if (answer["start_menu"] == "Delete an existing subscription") {
      let status = clientJS.deleteSub(subscription);
      status.then((value) => {
        if (value == "back") {
          start();
        } else {
          
          subscription.pop(value);
          
          start();
        }
      })
    }

    else if (answer["start_menu"] == "Browse") {

      let tmp = function () {
        var status = clientJS.browse(opcua, session);
        status.then((value) => {
          if (value == "back") {
            start();
          }
          if (value == "first-level") {
            tmp();
          }

        })
        //start();
      }
      tmp();
    }
    else if (answer["start_menu"] == "Create a subscription") {
      let status = clientJS.createSubscription(session, opcua);
      status.then((value) => {
        if (value == "back") {

        } else {
          subscription.push(value);
        }
        start();
      })
    }
    else if (answer["start_menu"] == "Create monitored item") {
      let status = clientJS.monitorItem(opcua, subscription);
      status.then((value) => {
        if (value == "back") {
          start();
        }
      })
    }
    else if (answer["start_menu"] == "Terminate program") {
      process.exit();
    }
  })
}

menu();





