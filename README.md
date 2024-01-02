# CursusDB Observer for Node.JS

## About Node Observers
https://cursusdb.com/documentation#realtime-observers

## npm 
https://www.npmjs.com/package/cursusdb-observer-node


### Example use
``` 
import Observer from 'cursusdb-observer-node'

let ob = new Observer("yoursharedkey")

if (ob.sharedKey !== undefined) {
    // To change default host
    //ob.ChangeHost("1.2.3.4")

    // To change default port
    //ob.ChangePort(1234)
    
    // To upgrade listener to TLS instead of TCP
    //ob.UpgradeToSecureListener()


    ob.Start() // Start listening

    ob.events.on('event', (data) => {
        console.log(data);

        // Handle websocket stuff here

        //..
    });
}

```