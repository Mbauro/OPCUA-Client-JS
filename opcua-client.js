//Read from stdin
const readline = require('readline-sync'); 
const inquirer = require("inquirer");
const main = require('./main')

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
    },

    browse: async function(session){
      // step 3 : browse
      var folders = [];
      var root= "RootFolder"
      var path=[]
      

      var browseResult = await session.browse(root);
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
              
              /*if(folders.length==0){
                console.log("Directory vuota!")
              }
              folders.push("Back to menu");
          */
      })
      //console.log("kkkkkkkkkkkkkkkkkkkkkkkk");
    
        /*var i = 0;
        // for (const reference of browseResult.references) {
                                
        //         folders.push(reference.browseName.toString());
        //         console.log("   -> ",i, reference.browseName.toString());
        //         i+=1;
        // }
        
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
      */
      return val;
      
    /*
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
     */
    }



}