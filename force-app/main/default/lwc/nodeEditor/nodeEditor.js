import { LightningElement,api } from 'lwc';

export default class NodeEditor extends LightningElement {
    @api node;
    @api options;
    @api articles;
}