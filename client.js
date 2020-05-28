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
                  try{
                    var browseResult = await session.browse(navigator+"Folder");
                    
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
                  //
                }
              }
            }
            
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


      //WRITE
      do{
        choice = readline.question("Do you want to write a variable? y/n");
        if(choice == "y"){
          var nameSpaceIndex = readline.question("Insert the namespace Index of the node that you want to read --> ");
          var nodeId = readline.question("Insert the node ID --> ");
          var valueToWrite = readline.question("Insert the value to write --> ")

          const nodeToWrite = {
            //type NodeIdLike = string | NodeId | number;
            nodeId: "ns="+nameSpaceIndex+";i="+nodeId,
            attributeId: opcua.AttributeIds.Value,
            value:{
              sourceTimestamp: new Date(),
              statusCode: opcua.StatusCodes.Good,// <==== 
              value:{
                   dataType: opcua.DataType.Int32,
                   value: valueToWrite
              }
          }
          };
          await session.write(nodeToWrite)
        }
      }while(choice=="y")

  
      // Create a subscription
      do{
          choice = readline.question("Do you want to create a subscription? y/n ");
          if(choice == "y"){ 
            //Range of time in which the server check the value
            var requestedPublishingInterval = readline.question("Insert the requested publishing interval --> ");
            //Lifetime of the subscription. It must be multiple of the publish interval
            var requestedLifetimeCount = readline.question("Insert the requested lifetime count --> ");
            //If the server has no notifications pending for the period of time defined by 
            //(MaxKeepAliveCount * PublishingInterval), the server will send a keep alive message to the client.
            var requestedMaxKeepAliveCount = readline.question("Insert the requested Max keep alive count --> ");
            //The maximum number of notifications that the client wishes to receive in a single publish response. 
            var maxNotificationPerPublish = readline.question("Insert the Max notification per publish --> ");
            //If multiple subscriptions need to send notifications to the client, 
            //the server will send notifications to the subscription with the highest priority first. 
            var priority = readline.question("Insert the priority --> ");
            var publishEnable = true

            var subscription = opcua.ClientSubscription.create(session,{
              requestedPublishingInterval: requestedLifetimeCount,
              requestedLifetimeCount: requestedLifetimeCount,
              requestedMaxKeepAliveCount: requestedMaxKeepAliveCount,
              maxNotificationsPerPublish: maxNotificationPerPublish,
              publishingEnabled: publishEnable,
              priority: priority

            })
          
            subscription.on("started", function() {
              console.log("subscription started for 2 seconds - subscriptionId=",subscription.subscriptionId);
            })
              .on("keepalive", function() {console.log("keepalive");
            })
              .on("terminated", function() {console.log("terminated");
            });
            // install monitored item
            
            n = readline.question("Insert how many items you want to monitor");
            var monitoredItemList = []
            var monitor = []
            console.log(monitoredItemList.length)
            for(i = 0; i < n; i++){

              var nameSpaceIndex = readline.question("Insert the namespace Index of the node that you want to read ");
              var nodeId = readline.question("Insert the node ID ");

              const itemToMonitor = {
                nodeId: "ns="+nameSpaceIndex+";i="+nodeId,
                attributeId: opcua.AttributeIds.Value
              };
              const parameters = {
                samplingInterval: 5000,
                discardOldest: true,
                queueSize: 10
              };
              
              monitoredItemList.push(itemToMonitor);

              monitor[i] = opcua.ClientMonitoredItem.create(
                subscription,
                monitoredItemList[i],
                parameters,
                opcua.TimestampsToReturn.Both
              );
                
              monitor[i].on("changed", (dataValue) => {
                console.log(" value has changed : ", dataValue.value.toString());
              });
                
              
            }     

            async function timeout(ms) {
              return new Promise(resolve => setTimeout(resolve, ms));
            }
            await timeout(10000);
          

            console.log("now terminating subscription");
            await subscription.terminate();
        }


      }while(choice == "y")
      
      
      
      /*
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
