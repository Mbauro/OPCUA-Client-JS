//Read from stdin
const readline = require('readline-sync'); 
const inquirer = require("inquirer");
const main = require('./main')


/*
  Defining costants  
*/
const DEFAULT_REQUEST_PUBLISH_INTERVAL = 1000;
const DEFAULT_PRIORITY = 0;
const DEFAULT_REQUESTED_MAX_KEEP_ALIVE_COUNT = 5;
const DEFAULT_REQUESTED_LIFETIME_COUNT = 40;
const DEFAULT_MAX_NOTIFICATION_PER_PUBLISH = 0;
const DEFAULT_PUBLISH_ENABLE = 0;
const DEFAULT_SAMPLING_INTERVAL = 1000;

module.exports = {

    createConnection: async function(endpointUrl,client){
        try {
            // step 1 : connect to
            await client.connect(endpointUrl);
            console.log("Connection with server created!");
        } catch (error) {
            console.log("An error has occurred: ",error);
        }
    },

    createSession: async function(endpointUrl,client){
        try{
            // step 2 : createSession
            const session = await client.createSession();
            console.log("New session created!");
            return session;
        }catch(err){
            console.log("An error has occurred: ",err);
        }
    },

    readNode: async function(opcua,session){
        
        
        var test = readline.keyInPause("Press any key to continue...");
        //console.log("SESSION "+session);
        if(session==undefined){
          console.log("You must create a session!");
          return "back";
        }
        var maxAge = readline.question("Insert the max age ");
        var nameSpaceIndex = readline.question("Insert the namespace Index of the node that you want to read ");
        var nodeId = readline.question("Insert the node ID ");
        
        const nodeToRead = {
            //type NodeIdLike = string | NodeId | number;
            nodeId: "ns="+nameSpaceIndex+";i="+nodeId,
            attributeId: opcua.AttributeIds.Value
        };
        const dataValue = await session.read(nodeToRead, maxAge);
        
        console.log("----------------------------------------------------");
        console.log("DataType: "+opcua.DataType[dataValue.value.dataType]);
        console.log("Value: "+ dataValue.value.value);
        console.log("Status Code: "+dataValue.statusCode.name);
        console.log("Source Timestamp: "+dataValue.sourceTimestamp);
        console.log("Server Timestamp: "+dataValue.serverTimestamp);
        console.log("----------------------------------------------------");
       
        //console.log(opcua.DataType[1])
        //console.log(dataValue.value);
        //console.log(dataValue.statusCode.description);
    },
    
    write: async function(session,opcua){

      if(session==undefined){
        console.log("You must create a session!");
        return "back";
      }
      var test = readline.keyInPause("Press any key to continue...");
      var nameSpaceIndex = readline.question("Insert the namespace Index of the node that you want to read --> ");
      var nodeId = readline.question("Insert the node ID --> ");
      let valueToWrite = readline.question("Insert the value to write --> ")

      //Read the datatype from the node
      const nodeToRead = {
          //type NodeIdLike = string | NodeId | number;
          nodeId: "ns="+nameSpaceIndex+";i="+nodeId,
          attributeId: opcua.AttributeIds.Value
      };
      let maxAge = 0;
      const dataValue = await session.read(nodeToRead, maxAge);
      let dataType = opcua.DataType[dataValue.value.dataType];

      const nodeToWrite = {
          //type NodeIdLike = string | NodeId | number;
          nodeId: "ns="+nameSpaceIndex+";i="+nodeId,
          attributeId: opcua.AttributeIds.Value,
          value:{
          sourceTimestamp: new Date(),
          statusCode: opcua.StatusCodes.Good,
          value:{
                  dataType: dataType,
                  value: valueToWrite
          }
          }
      };
      await session.write(nodeToWrite)

  },

    createSubscription: async function(session,opcua){
        if(session==undefined){
          console.log("You must create a session!");
          return "back";
        }
        if(readline.keyInYN("Do you want to create a subscription?")){
            
                //Range of time in which the server check the value
                var requestedPublishingInterval = readline.questionInt("Insert the requested publishing interval --> ");
                if(requestedPublishingInterval == 0){
                    requestedPublishingInterval = DEFAULT_REQUEST_PUBLISH_INTERVAL;
                }

                //If the server has no notifications pending for the period of time defined by 
                //(MaxKeepAliveCount * PublishingInterval), the server will send a keep alive message to the client.
                var requestedMaxKeepAliveCount = readline.question("Insert the requested Max keep alive count --> ");

                //Lifetime of the subscription. It must be multiple of the publish interval
                do{
                    var requestedLifetimeCount = readline.questionInt("Insert the requested lifetime count" + 
                     "(it must be at least 3*requestedMaxKeepAliveCount) --> ");
                    if(requestedLifetimeCount == 0){
                        requestedLifetimeCount = DEFAULT_REQUESTED_LIFETIME_COUNT;
                    }
                }while(requestedLifetimeCount < 3*requestedMaxKeepAliveCount);

                
                //The maximum number of notifications that the client wishes to receive in a single publish response. 
                var maxNotificationPerPublish = readline.questionInt("Insert the Max notification per publish --> ");
                if(maxNotificationPerPublish == 0){
                    maxNotificationPerPublish = DEFAULT_MAX_NOTIFICATION_PER_PUBLISH;
                }
                //If multiple subscriptions need to send notifications to the client, 
                //the server will send notifications to the subscription with the highest priority first. 
                var priority = readline.questionInt("Insert the priority --> ");
                if(priority == 0){
                    priority == DEFAULT_PRIORITY;
                }
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
                    console.log("\nSubscription started - subscriptionId=",subscription.subscriptionId);
                    
                })
                .on("keepalive", function() {
                })
                .on("terminated", function() {console.log("Subscription terminated");
                });
                
                return subscription;
    }
  },

    monitorItem: async function(opcua,subscription){
            //console.log(subscription);
            if(subscription.length==0){
              console.log("You don't have created any subscription, please create at least one subscription!");
              return "back";
            }
            var monitor;
            let subId = [];
            for(i = 0; i < subscription.length; i++){
                subId.push(subscription[i].subscriptionId.toString())
            }
            let subIndex = readline.keyInSelect(subId,"Select a subscriprion ID before to continue");
            

              var nameSpaceIndex = readline.questionInt("Insert the namespace Index of the node that you want to read ");
              var nodeId = readline.questionInt("Insert the node ID ");

              let samplingInterval = readline.questionInt("Insert the sampling interval"+ 
              "(press 0 if you want default value: "+DEFAULT_SAMPLING_INTERVAL+"ms "+"---> ");
              let queueSize = readline.questionInt("Insert the queue size ---> ");

              const itemToMonitor = {
                nodeId: "ns="+nameSpaceIndex+";i="+nodeId,
                attributeId: opcua.AttributeIds.Value
              };
              const parameters = {
                samplingInterval: samplingInterval,
                discardOldest: true,
                queueSize: queueSize
              };
              

              monitor = opcua.ClientMonitoredItem.create(
                subscription[subIndex],
                itemToMonitor,
                parameters,
                opcua.TimestampsToReturn.Both
              );
                
              monitor.on("changed", (dataValue) => {
                console.log(" value has changed : ", dataValue.value.toString());
              });
                
              
            

            async function timeout(ms) {
              return new Promise(resolve => setTimeout(resolve, ms));
            }
            await timeout(10000);
          

            console.log("now terminating subscription");
            await subscription[subIndex].terminate();
            await subscription.pop(subIndex);
    },

    

    browse: async function(session){
      // step 3 : browse
      var folders = [];
      var root= "RootFolder"
      var path=[]
      
      try{
        var browseResult = await session.browse(root);
      }catch{
        console.error("Maybe you don't have created any session, please create a session!");
        return "back";
      }
      var i = 0;
      for (const reference of browseResult.references) {
        folders.push(reference.browseName.toString());
        i+=1;
      }
      //console.log(folders);
      folders.push("Return to principal menù");

      val = inquirer.prompt([
          {
            type: "list",
            name: "browse_menu",
            message: "Select the directory in which you want to navigate",
            choices: folders,
          }
      ]).then(async function parent(answer){
          answer = answer["browse_menu"];
          
          if(answer == "Return to principal menù"){
              return("back");
          }
          do{  
            try{
              path.push(answer);
              var browseResult=await session.browse(answer);
            }catch{
              try{
                var browseResult=await session.browse(answer+"Folder");
              }catch{
                console.log(answer+" non è una directory");
                return "back";
              }
            }
            var i = 0;
            folders=[];
      for (const reference of browseResult.references) {
        folders.push(reference.browseName.toString());
        console.log(i+" --> "+reference.browseName.toString());
        i+=1;
      }
      folders.push("Return to parent directory");
      console.log(i+" --> "+"Return to parent directory");
      i+=1;
      folders.push("Return to principal menù");
      console.log(i+" --> "+"Return to principal menù");
      try{
        answer = (readline.question("Please, enter you choice: "));
        //console.log("prova"+answer);
        check=answer;
        //console.log(check);
        answer=folders[answer];
        //console.log("PATH"+path);
        //console.log("Answer "+answer);
        
        if(answer=="Return to parent directory"){
         
          if(path.length == 1){
            return "first-level";  
          }
          answer=path.pop();
          answer=path.pop();
        }
        
        
      }catch{
        
      }
    }while(check!="q");      
    
    return "back";
      })
      
      return val;
      
    }



}