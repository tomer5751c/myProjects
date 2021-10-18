import { LightningElement, wire, api } from 'lwc';
import { publish, MessageContext,createMessageContext } from 'lightning/messageService';
import messageChannel from '@salesforce/messageChannel/messageChannelNameTest__c';

export default class EventPublisher extends LightningElement {
    @wire(MessageContext)
    messageContext;
    @api recordId;
    // connectedCallback(){
    //     this.messageContext=createMessageContext();
    // }
    renderedCallback() {
        const payload = { value: this.recordId };
        try {
            publish(this.messageContext, messageChannel, payload);
        }
        catch (ex) {
            console.log(ex);
        }
    }

}