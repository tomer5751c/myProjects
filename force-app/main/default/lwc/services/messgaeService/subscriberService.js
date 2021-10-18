import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    createMessageContext
} from 'lightning/messageService';
import messageChannel from "@salesforce/messageChannel/messageChannelNameTest__c";

subscription = null;
context = createMessageContext();

/**
   * @callback handleMessageCallback
   */
/**
 * Subscribe to the channel to receive events  
 * callback parameter - a callback function that handles the received message

 * @param {handleMessageCallback} callBack 
 */
const subscribeToChannel = (callBack) => {
    if (subscription == null) {
        subscription = subscribe(
            context,
            channel,
            (message) => callBack,
            { scope: APPLICATION_SCOPE }
        );
    }

};
export { subscribeToChannel }