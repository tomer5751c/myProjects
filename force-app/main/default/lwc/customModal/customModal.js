import { LightningElement,api } from 'lwc';

export default class CustomModal extends LightningElement {
    @api title;
    @api showCloseButton;
    @api bodyMessage;
    @api showFooter;
    @api okOptionLabel;
    @api cancelOptionLabel;
    clickBtn(event){
        const option = event.detail.valuel;
        this.sendEvent(`${option}option`);
    }
    sendEvent(eventName, details) {
        const newEvent = CustomEvent(eventName, details);
        this.dispatchEvent(newEvent);
    }

}