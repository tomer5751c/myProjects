import { LightningElement,track,wire } from 'lwc';
import getAccount from '@salesforce/apex/TreeScriptCall.getAccount';
import { subscribeToChannel } from './messgaeService/subscriberService';
// import {
//     subscribe,
//     unsubscribe,
//     APPLICATION_SCOPE,
//     createMessageContext
// } from 'lightning/messageService';
// import messageChannel from "@salesforce/messageChannel/messageChannelNameTest__c";

export default class PlatformEventTest extends LightningElement {

    @track accountName;
    @track isAllowed;
    @track lastTime;
    // channelName="/u/test";
    // context = createMessageContext();
    // subscription=null;
    getAccount(accountId){
        getAccount({accountId:accountId}).then(res=>{
            this.accountName = res.Name;
            this.isAllowed =   res.isAllowed__c;
            this.lastTime =    new Date();
        }).catch(ex=>{
            console.log(ex);
        })
    }
    // handleSubscribe() {
    //     var self=this;
    //     // Callback invoked whenever a new event message is received
    //     const messageCallback = function(response) {
    //         console.log('New message received: ', JSON.stringify(response));
    //         if(response && response.data && response.data.payload){
    //             let accountId= response.data.payload.accountId__c;
    //             // self.accountName = response.data.payload.name__c;
    //             // self.isAllowed =   response.data.payload.allowed__c;
    //             // self.lastTime =    new Date();
    //             self.getAccount(accountId);
    //         }
    //         // Response contains the payload of the new message received
    //     };
    //     subscribe(this.channelName, -1, messageCallback).then(response => {
    //         // Response contains the subscription information on subscribe call
    //         console.log('Subscription request sent to: ', JSON.stringify(response.channel));
    //         this.accountName ='tets';
    //     });
    // }
    connectedCallback(){
       subscribeToChannel(this,this.handleMessage);
    }
    // subscribeMessageService(){
    //     this.subscription=subscribe(
    //         this.context,
    //         messageChannel,
    //         (message) => this.handleMessage(message),
    //         { scope: APPLICATION_SCOPE }
    //     );
    // }
    handleMessage(response){
        if(response){
            let accountId= response.value;
            this.getAccount(accountId);
        }
    }
}