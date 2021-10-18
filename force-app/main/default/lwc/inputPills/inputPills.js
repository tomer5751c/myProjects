import { LightningElement,track } from 'lwc';

export default class InputPills extends LightningElement {
    @track pills=[];
    index=0;
    keyPress(event){ 
        if(event.keyCode==13){
            let arr=this.pills;
            arr.push({label:`Pill ${++this.index}`})
            this.pills=arr;
        }
    }
    handleRemove(event){
        const index=event.detail.index;
        this.pills.splice(index,1);
    }
}