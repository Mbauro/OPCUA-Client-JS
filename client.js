let opcua = require("node-opcua")
var async = require("async")
//Read from stdin
const readline = require('readline-sync');

const endpointUrl = "opc.tcp://desktop-d0967du:51210/UA/SampleServer";

const options = {
    clientName: "OPCUA JS Client",
    endpoint_must_exist: false
  };

const client = opcua.OPCUAClient.create(options)



  async function main() {
    try {
      // step 1 : connect to
      await client.connect(endpointUrl);
      console.log("Connection with server created!");
      // step 2 : createSession
      const session = await client.createSession();
      console.log("New session created!");

    
      // step 3 : browse
      var folders = [];
      var root= "RootFolder"
      navigator=root;
      prev = root;
      j = 0
      do{
            var choice = readline.question('Do you want to explore folders? y/n ');
            
            if(choice == "y"){
                try{
                  var browseResult = await session.browse(navigator);
                  //console.log("TRY",browseResult);
                }catch(err){
                  console.log("SONO NEL CATCH");
                  try{
                    var browseResult = await session.browse(navigator+"Folder");
                    console.log(err);
                  }catch(err){
                    console.log(navigator+"Folder non è una directory");
                    break;
                  }
                    //console.log("CATCH",browseResult);
                }
                  console.log("references of "+navigator+":");
                var i = 0;
                for (const reference of browseResult.references) {
                                        
                      folders.push(reference.browseName.toString());
                      console.log("   -> ",i, reference.browseName.toString());
                      i+=1;
                }
                if(folders.length==0){
                  console.log("Directory vuota!")
                }else{
                    
                direction = readline.question("Do you want return at parent directory? (y/n)");
                if(direction=="y"){
                  navigator=prev;
                  folders=[];
                }else{
                  prev=navigator;
                  choice1 = parseInt(readline.question("Put the number of the folder that you want to explore: "));
                  navigator=folders[choice1];
                  console.log("Stai scegliendo di navigare in ",navigator);
                  //console.log("Prima ",folders);
                  folders=[];
                  //console.log("Dopo ",folders);
                  //console.log(folders[choice1]);
                  //j+=1;
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
              }
            }
            break;
     }while(choice == "y")
    
      
  
      //Read a variable
      
      do{
        var choice = readline.question("Do you want to read? y/n ");
        if(choice == "y"){
          var maxAge = readline.question("Insert the max age ");
          var nameSpaceIndex = readline.question("Insert the namespace Index of the node that you want to read ");
          var nodeId = readline.question("Insert the node ID ");
          const nodeToRead = {
            //type NodeIdLike = string | NodeId | number;
            nodeId: "ns="+nameSpaceIndex+";i="+nodeId,
            attributeId: opcua.AttributeIds.Value
          };
          const dataValue = await session.read(nodeToRead, maxAge);
          console.log(dataValue.toString());
          //console.log(dataValue.value);
          //console.log(dataValue.statusCode.description);
          
        }else{break;}
        
      }while(choice == "y")
  /*
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