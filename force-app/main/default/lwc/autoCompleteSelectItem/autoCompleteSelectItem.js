import { LightningElement, api } from 'lwc';

export default class autoCompleteSelectItem extends LightningElement {

    @api isSelected;
    @api name;
    @api label;
    @api value;
    @api iconName;
    @api moreDetails;
    selectedItemName;
    selectedItemValue

    selectOption(){
        this.selectedItemName = this.template.querySelector('.slds-truncate').title;
        this.selectedItemValue = this.template.querySelector('.slds-truncate').textContent;
        const eventToDispatch = new CustomEvent('select', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                key: this.selectedItemName,
                value: this.selectedItemValue,
                itemValue:this.value
            },
        });
        this.dispatchEvent(eventToDispatch);
    }

}