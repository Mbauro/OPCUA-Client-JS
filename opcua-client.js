module.exports = {
    createSession: async function(endpointUrl,client){
        try{
            // step 1 : connect to
            await client.connect(endpointUrl);
            console.log("Connection with server created!");
            // step 2 : createSession
            const session = await client.createSession();
            console.log("New session created!");
        }catch(err){
            console.log("An error has occurred: ",err);
        }
    }
}