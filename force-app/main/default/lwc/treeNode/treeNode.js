import { LightningElement,api,track } from 'lwc';

export default class TreeNode extends LightningElement {
    @api name;
    @api items;
    @track isExpanded=false;
    expandItem(event){
        this.isExpanded=!this.isExpanded;
    }
}