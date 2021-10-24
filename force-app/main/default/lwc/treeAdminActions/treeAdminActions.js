import { LightningElement,api } from 'lwc';

export default class TreeAdminActions extends LightningElement {
    @api isFirst;
    @api isLast;

    sendEvent(event){
        const nameEvent = event.target.dataset['event'];
        const newEvent = new CustomEvent(nameEvent,{});
        this.dispatchEvent(newEvent);
        event.stopPropagation();
    }
    // orderUp(event) {
    //     this.sendEvent('orderup');
    //     event.stopPropagation();
    // }
    // orderDown(event) {
    //     this.sendEvent('orderdown');
    //     event.stopPropagation();
    // }
    // editNode(event){
    //     this.sendEvent('editnode');
    //     event.stopPropagation();
    // }
    // insertNode(event){
    //     this.sendEvent('insertnode');
    //     event.stopPropagation();
    // }
    // deleteNode(event){
    //     this.sendEvent('deletenode');
    //     event.stopPropagation();
    // }
}