let opcua = require("node-opcua")
var async = require("async")
//Read from stdin
const readline = require('readline-sync');

const endpointUrl = "opc.tcp://desktop-prk86af:51210/UA/SampleServer";
const options = {
    clientName: "OPCUA JS Client",
    endpoint_must_exist: false
  };

const client = opcua.OPCUAClient.create(options)



  async function main() {
    try {
      // step 1 : connect to
      await client.connect(endpointUrl);
      console.log("connected !");
      // step 2 : createSession
      const session = await client.createSession();
      console.log("session created !");


      // step 3 : browse
      var folders = ["RootFolder"];
      j = 0
      do{
            var choice = readline.question('Do you want to explore folders? y/n ');
            if(choice == "y"){
                var browseResult = await session.browse(folders[j]);
                console.log("references of RootFolder :");
                var i = 0;
                for (const reference of browseResult.references) {
                    i+=1;
                    folders.push(reference.browseName.toString()+"Folder");
                    console.log("   -> ",i, reference.browseName.toString());
                    
                    }
                
                choice1 = parseInt(readline.question("Put the number of the folder that you want to explore..."));
                console.log(folders[choice1]);
                j+=1;
                /*
                console.log(folders[choice]);
                browseResult = await session.browse(folders[choice]);
                i = 0;
                for (const reference of browseResult.references) {
                    folders.push(reference.browseName.toString()+"Folder");
                    console.log("   -> ",i, reference.browseName.toString());
                    i+=1;
                }
                */
            }
     }while(choice == "y")
    
      
   /*
      // step 4 : read a variable with readVariableValue
      _"read a variable with readVariableValue"
  
      // step 4' : read a variable with read
      _"read a variable with read"
  
      // step 5: install a subscription and install a monitored item for 10 seconds
      _"install a subscription"
  
      // step 6: finding the nodeId of a node by Browse name
      _"finding the nodeId of a node by Browse name"
  
      // close session
      _"closing session"
  
      // disconnecting
      _"disconnecting"
      */
    } catch(err) {
      console.log("An error has occured : ",err);
    }
  }
  main();
/*
const options = {
    clientName: "OPC_UA Client"
}

const client = opcua.OPCUAClient.create(options)

const serverURL = "http://desktop-prk86af:51211/UA/SampleServer";

client.connect(serverURL);
console.log("Connected");

//Create session
const session = client.createSession();
console.log("session created !"); */