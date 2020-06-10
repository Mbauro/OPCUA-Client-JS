//Read from stdin
const readline = require('readline-sync');
const inquirer = require("inquirer");
const main = require('./main')




/*
  Defining costants  
*/
const DEFAULT_REQUEST_PUBLISH_INTERVAL = 1000;
const DEFAULT_PRIORITY = 1;
const DEFAULT_REQUESTED_MAX_KEEP_ALIVE_COUNT = 5;
const DEFAULT_REQUESTED_LIFETIME_COUNT = 40;
const DEFAULT_MAX_NOTIFICATION_PER_PUBLISH = 10;
const DEFAULT_SAMPLING_INTERVAL = 1000;
const DEFAULT_QUEUE_SIZE = 10;


module.exports = {

  discoveryEndpoint: async function(url,client,opcua){
    endpoint= await client.getEndpoints({endpointUrl:url});
    var dynamic_url= url.substring(url.indexOf("//")+2);
    dynamic_url=dynamic_url.substring(0,dynamic_url.indexOf(":"));
    
    console.log("PROVA: "+dynamic_url);
    console.log("***********************************************");
    console.log("Endpoint list");
    console.log("***********************************************");
    var endpoint_choice;
    for (i = 0; i < endpoint.length; i++) {
      console.log("------------------------------------------------");
      console.log('\x1b[33m%s\x1b[0m',"Endpoint number "+i+":");
      endpoint[i].endpointUrl=endpoint[i].endpointUrl.replace("localhost",dynamic_url)
      console.log('\x1b[36m%s\x1b[0m',"Endpoint url: ","\x1b[0m"+endpoint[i].endpointUrl);
      console.log('\x1b[36m%s\x1b[0m',"Security mode: ","\x1b[0m"+opcua.MessageSecurityMode[endpoint[i].securityMode]);
      console.log('\x1b[36m%s\x1b[0m',"Security policy: ","\x1b[0m"+endpoint[i].securityPolicyUri);
      console.log('\x1b[36m%s\x1b[0m',"Transport protocol: ","\x1b[0m"+endpoint[i].transportProfileUri);
      console.log('\x1b[36m%s\x1b[0m',"Security level: ","\x1b[0m"+endpoint[i].securityLevel+"\x1b[0m");
      
    }
    do{
      endpoint_choice=parseInt(readline.question("Select the number of the endpoint that you want to choose: "));
    }while(endpoint_choice>=endpoint.length)
    
    
    return endpoint[endpoint_choice];
  },

  createConnection: async function (endpointUrl, client) {
    console.log("URL " + endpointUrl);
    try {
      // step 1 : connect to
      await client.connect(endpointUrl);
      console.log("Connection with server created!");
      return 1;


    } catch (error) {
      await client.disconnect();
      console.log("\x1b[31m",""+error,"\x1b[0m");
      //console.log("Error: The connection cannot be established with server " + endpointUrl);
      console.log("Please try again...");
      return 0;
    }


  },

  createSession: async function (endpointUrl, client) {
    try {
      // step 2 : createSession
      const session = await client.createSession();
      console.log("New session created!");
      return session;
    } catch (err) {
      console.log("An error has occurred: ", err);
    }
  },

  readNode: async function (opcua, session) {


    var test = readline.keyInPause("Press any key to continue...");
    //console.log("SESSION "+session);
    if (session == undefined) {
      console.log("You must create a session!");
      return "back";
    }
    var maxAge = readline.question("Insert the max age ");
    var nameSpaceIndex = readline.question("Insert the namespace Index of the node that you want to read ");
    var nodeId = readline.question("Insert the node ID ");

    const nodeToRead = {
      //type NodeIdLike = string | NodeId | number;
      nodeId: "ns=" + nameSpaceIndex + ";i=" + nodeId,
      attributeId: opcua.AttributeIds.Value
    };
    const dataValue = await session.read(nodeToRead, maxAge);

    console.log("----------------------------------------------------");
    console.log("DataType: " + opcua.DataType[dataValue.value.dataType]);
    console.log("Value: " + dataValue.value.value);
    console.log("Status Code: " + dataValue.statusCode.name);
    console.log("Source Timestamp: " + dataValue.sourceTimestamp);
    console.log("Server Timestamp: " + dataValue.serverTimestamp);
    console.log("----------------------------------------------------");

    //console.log(opcua.DataType[1])
    //console.log(dataValue.value);
    //console.log(dataValue.statusCode.description);
  },

  write: async function (session, opcua) {

    if (session == undefined) {
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
      nodeId: "ns=" + nameSpaceIndex + ";i=" + nodeId,
      attributeId: opcua.AttributeIds.Value
    };
    let maxAge = 0;
    const dataValue = await session.read(nodeToRead, maxAge);
    let dataType = opcua.DataType[dataValue.value.dataType];

    const nodeToWrite = {
      //type NodeIdLike = string | NodeId | number;
      nodeId: "ns=" + nameSpaceIndex + ";i=" + nodeId,
      attributeId: opcua.AttributeIds.Value,
      value: {
        sourceTimestamp: new Date(),
        statusCode: opcua.StatusCodes.Good,
        value: {
          dataType: dataType,
          value: valueToWrite
        }
      }
    };
    await session.write(nodeToWrite)

  },

  createSubscription: async function (session, opcua) {
    if (session == undefined) {
      console.log("You must create a session!");
      return "back";
    }
    if (readline.keyInYN("Do you want to create a subscription?")) {

      //Range of time in which the server check the value
      var requestedPublishingInterval = readline.question("Insert the requested publishing interval (DEFAULT VALUE = " +
        DEFAULT_REQUEST_PUBLISH_INTERVAL + ") --> ");

      if (requestedPublishingInterval == "") {
        requestedPublishingInterval = DEFAULT_REQUEST_PUBLISH_INTERVAL;
      }

      //If the server has no notifications pending for the period of time defined by 
      //(MaxKeepAliveCount * PublishingInterval), the server will send a keep alive message to the client.
      var requestedMaxKeepAliveCount = readline.question("Insert the requested Max keep alive count (DEFAULT VALUE = " +
        DEFAULT_REQUESTED_MAX_KEEP_ALIVE_COUNT + ") --> ");
      if (requestedMaxKeepAliveCount == "") {
        requestedMaxKeepAliveCount = DEFAULT_REQUESTED_MAX_KEEP_ALIVE_COUNT;
      }

      //Lifetime of the subscription. It must be multiple of the publish interval

      var requestedLifetimeCount = readline.question("Insert the requested lifetime count" +
        "(it must be at least 3*requestedMaxKeepAliveCount)[DEFAULT VALUE = " +
        DEFAULT_REQUESTED_LIFETIME_COUNT + "] --> ");
      if (requestedLifetimeCount == "" || requestedMaxKeepAliveCount < 3 * requestedMaxKeepAliveCount) {
        requestedLifetimeCount = DEFAULT_REQUESTED_LIFETIME_COUNT;
      }



      //The maximum number of notifications that the client wishes to receive in a single publish response. 
      var maxNotificationPerPublish = readline.question("Insert the Max notification per publish (DEFAULT VALUE = " +
        DEFAULT_MAX_NOTIFICATION_PER_PUBLISH + ") --> ");
      if (maxNotificationPerPublish == "") {
        maxNotificationPerPublish = DEFAULT_MAX_NOTIFICATION_PER_PUBLISH;
      }
      //If multiple subscriptions need to send notifications to the client, 
      //the server will send notifications to the subscription with the highest priority first. 
      var priority = readline.question("Insert the priority (DEFAULT VALUE = " +
        DEFAULT_PRIORITY + ") --> ");
      if (priority == "") {
        priority == DEFAULT_PRIORITY;
      }
      var publishEnable = true

      var subscription = opcua.ClientSubscription.create(session, {
        requestedPublishingInterval: requestedLifetimeCount,
        requestedLifetimeCount: requestedLifetimeCount,
        requestedMaxKeepAliveCount: requestedMaxKeepAliveCount,
        maxNotificationsPerPublish: maxNotificationPerPublish,
        publishingEnabled: publishEnable,
        priority: priority

      })

      subscription.on("started", function () {
        console.log("\nSubscription started - subscriptionId=", subscription.subscriptionId);

      })
        .on("keepalive", function () {
        })
        .on("terminated", function () {
          console.log("Subscription terminated");
        });

      return subscription;
    }
  },

  deleteSub: async function (subscription) {
    if (subscription.length == 0) {
      console.log("No subsricption founded");
      return "back";
    } else {
      let subId = [];
      for (i = 0; i < subscription.length; i++) {
        subId.unshift(subscription[i].subscriptionId.toString());
      }
      let subIndex = readline.keyInSelect(subId, "Select a subscriprion that you want to delete");
      //subIndex+=1;
      
      if (subIndex == -1) {
        console.log("Back to menu........");
        return "back";
      } else {
        return subIndex;
      }

    }
  },

  monitorItem: async function (opcua, subscription) {

    
    //console.log(subscription);
    if (subscription.length == 0) {
      console.log("You don't have created any subscription, please create at least one subscription!");
      return "back";
    }
    //var monitor;
    let subId = [];
    for (i = 0; i < subscription.length; i++) {
      subId.push(subscription[i].subscriptionId.toString())
    }
    console.log("\n*************************************************************")
    console.log("Select the subscription from the subscription IDs shown below");
    console.log("*************************************************************")
    let subIndex = readline.keyInSelect(subId, "Choose a subscription id from the list");

    if (subIndex == -1) {
      return "back";
    }

    var nameSpaceIndex = readline.questionInt("Insert the namespace Index of the node that you want to read ");
    var nodeId = readline.questionInt("Insert the node ID ");

    let samplingInterval = readline.question("Insert the sampling interval (DEFAULT VALUE = " +
      DEFAULT_SAMPLING_INTERVAL + ") --> ");
    if (samplingInterval == "") {
      samplingInterval = DEFAULT_SAMPLING_INTERVAL;
    }
    let queueSize = readline.question("Insert the queue size (DEFAULT VALUE = " +
      DEFAULT_QUEUE_SIZE + ") --> ");
    if (queueSize == "") {
      queueSize = DEFAULT_QUEUE_SIZE;
    }

    const itemToMonitor = {
      nodeId: "ns=" + nameSpaceIndex + ";i=" + nodeId,
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
      console.log("----------------------------------------------------");
      console.log("DataType: " + opcua.DataType[dataValue.value.dataType]);
      console.log("Value: " + dataValue.value.value);

    });






    return new Promise(resolve => {
      var stdin = process.stdin;

      // without this, we would only get streams once enter is pressed
      stdin.setRawMode(true);

      // resume stdin in the parent process (node app won't quit all by itself
      // unless an error or process.exit() happens)
      stdin.resume();

      stdin.setEncoding('utf8');

      // on any data into stdin
      stdin.on('data', function (key) {
        // ctrl-c ( end of text )
        if (key === '\u0003') {

          process.stdout.clearLine();
          process.stdout.write("Terminating...");
          process.stdout.cursorTo(0);

          monitor.terminate();
          timeout = setTimeout(() => {
            
            console.clear();        
            resolve("back")

          }, 1000);
        }
        // write the key to stdout all normal like
        //process.stdout.write(key);
      });


    });


  },



  browse: async function (opcua, session) {
    // step 3 : browse
    var folders = [];
    var root = "RootFolder"
    var path = []

    try {
      var browseResult = await session.browse(root);
    } catch{
      console.error("Maybe you don't have created any session, please create a session!");
      return "back";
    }
    var i = 0;
    for (const reference of browseResult.references) {
      folders.push(reference.browseName.toString());
      i += 1;
    }
    //console.log(folders);
    folders.push("Insert the Node ID manually");
    folders.push("Return to principal menù");


    val = inquirer.prompt([
      {
        type: "list",
        name: "browse_menu",
        message: "Select the directory in which you want to navigate",
        choices: folders,
      }
    ]).then(async function parent(answer) {
      answer = answer["browse_menu"];

      if (answer == "Return to principal menù") {
        return ("back");
      }
      else if (answer == "Insert the Node ID manually") {
        readline.keyInPause("Press any key to continue...");
        nameSpaceIndex = readline.question("Insert the namespace Index --> ");
        nodeId = readline.question("Insert the node id --> ");
        try {
          var browseResult = await session.browse(opcua.makeNodeId(parseInt(nodeId), parseInt(nameSpaceIndex)));
          for (const reference of browseResult.references) {
            folders.push(reference.browseName.toString());
            console.log("--------------------------------------------");
            console.log("Namespace Index: " + reference.nodeId["namespace"]);
            console.log("Node ID: " + (reference.nodeId["value"]));
            console.log("Browse Name: " + reference.browseName.toString());
            console.log("Display Name: " + reference.displayName["text"].toString());
            console.log("Node Class: " + opcua.NodeClass[reference.nodeClass]);
            console.log("--------------------------------------------");
          }
        } catch (err) {
          console.log(err);
        }
        return ("first-level");
      }
      else {
        do {
          try {
            path.push(answer);
            var browseResult = await session.browse(answer);
          } catch{
            try {
              var browseResult = await session.browse(answer + "Folder");
            } catch{
              console.log(answer + " non è una directory");
              return "back";
            }
          }

          var i = 0;
          folders = [];
          for (const reference of browseResult.references) {
            folders.push(reference.browseName.toString());
            console.log("--------------------------------------------");
            console.log("Namespace Index: " + reference.nodeId["namespace"]);
            console.log("Node ID: " + (reference.nodeId["value"]));
            console.log("Browse Name: " + reference.browseName.toString());
            console.log("Display Name: " + reference.displayName["text"].toString());
            console.log("Node Class: " + opcua.NodeClass[reference.nodeClass]);
            console.log("--------------------------------------------");

            i += 1;
          }
          folders.push("Return to parent directory");
          console.log(i + " --> " + "Return to parent directory");
          i += 1;
          folders.push("Return to principal menù");
          console.log(i + " --> " + "Return to principal menù");
          try {
            answer = (readline.question("Please, enter you choice: "));
            //console.log("prova"+answer);
            check = answer;
            //console.log(check);
            answer = folders[answer];
            //console.log("PATH"+path);
            //console.log("Answer "+answer);

            if (answer == "Return to parent directory") {

              if (path.length == 1) {
                return "first-level";
              }
              answer = path.pop();
              answer = path.pop();
            }



          } catch{

          }
        } while (check != "q");
      }
      return "back";
    })

    return val;

  }



}