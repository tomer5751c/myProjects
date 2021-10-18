import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    createMessageContext
} from 'lightning/messageService';
import messageChannel from "@salesforce/messageChannel/messageChannelNameTest__c";

var subscription = null;
const context = createMessageContext();

/**
   * @callback handleMessageCallback
   */
/**
 * Subscribe to the channel to receive events  
 * callback parameter - a callback function that handles the received message

 * @param {handleMessageCallback} callBack 
 */
const subscribeToChannel = (self,callBack) => {
    if (subscription == null) {
        subscription = subscribe(
            context,
            messageChannel,
            (message) => {callBack.call(self,message);},
            { scope: APPLICATION_SCOPE }
        );
    }
};

export { subscribeToChannel }