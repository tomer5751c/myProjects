import { LightningElement, api, track } from 'lwc';

export default class AutoCompleteSelect extends LightningElement {

    @api pills=[];
    @api label;
    @api name;
    @api required;
    @api isMultiSelect=false;
    @api iconName;
    @api moreDetails;
    @api
    get isDisabled() {
        return this.disabled;
    }
    set isDisabled(bool) {
        this.disabled = bool;
    }

    @api
    get selectedItem() {
        return this.selectedItemValue;
    }
    set selectedItem(value) {
        this.selectedItemValue = value;
    }

    @api
    get values() {
        return this.allValues;
    }
    set values(values) {
        this.allValues = values;
        this.filteredValues = this.values;
    }
    @api
    get errorMsg() {
        return this.errMessage;
    }
    set errorMsg(errMsg) {
        console.log(`######### Set error message to  ${this.name} - ${errMsg}`);
        this.errMessage = errMsg;
        this.isError = errMsg == undefined || errMsg == '' ? false : true;
    }

    // @api
    // disableInput(){
    //     this.disabled = true;
    //     this.isError = false;  
    //     this.selectedItemValue = '';
    //     this.template.querySelector('input').setAttribute('disabled');
    // }
    // @api
    // enableInput(){
    //     console.log(`######### IssueReportingAutoSelect enableInput ${this.name} - ${this.values.length}`);
    //     this.filteredValues = this.values;
    //     this.disabled = false;
    //     this.template.querySelector('input').removeAttribute('disabled');
    // }

    @api
    closeOptionsDialog() {
        this.template.querySelector('.slds-dropdown-trigger').classList.remove('slds-is-open');
        this.template.querySelector('.slds-dropdown-trigger').setAttribute('aria-expanded', false);
        this.checkInputValue();
    }

    @track allValues;
    @track filteredValues;
    @track selectedItemValue;
    @track placeholderValue;
    @track disabled;
    @track errMessage;
    @track isError = false;
    @track infoMessage;
    @track isInfo = false;
    autocompleteValue;
    init = false;

    connectedCallback() {
        this.selectedItemValue = this.selectedItem;
        this.filteredValues = this.values;
        this.placeholderValue = `בחר ${this.label}`
        this.disabled = this.isDisabled;
        this.isError = this.errMessage == undefined || this.errMessage == '' ? false : true;
    }
    @api 
    getInputValue(){
        return this.autocompleteValue;
    }
    @api 
    focusInput(){
        this.template.querySelector('input').focus();
    }
    inblur() {
        if (this.template.querySelector('.slds-dropdown-trigger').classList.contains('slds-is-open')){

            this.blurTimeout = setTimeout(() => {
                this.closeOptionsDialog();
            }, 125);
        }
    }
    keyDown(event){
        if(event.key=="Escape"){
            const eventEnter = new CustomEvent('cancel',{detail:{

            }});
            this.dispatchEvent(eventEnter);
            event.stopPropagation();
        }
    }
    keyPress(event) {
        if (event.keyCode == 13) {
            const eventEnter = new CustomEvent('enter',{detail:{

            }});
            this.dispatchEvent(eventEnter);
        }
    }
    renderedCallback() {
        if (!this.init) {
            this.init = true;
            // Promise.all([
            //     loadStyle(this, ux_src + "/ServiceStyle_IssueCreation.css"),
            // ]).then(()=> console.log("header container: style loaded") ); 
        }
        //this.disabled = this.isDisabled;
        console.log(`######### IssueReportingAutoSelect renderedCallback ${this.name}`);
        this.allValues = this.values;
        if (this.disabled) {
            this.template.querySelector('input').setAttribute('disabled');
        } else {
            this.template.querySelector('input').removeAttribute('disabled');
        }
    }
    checkInputValue() {
        if(this.isMultiSelect) return;
        const wasError=this.isError;
        if(this.values.filter(v=>v.isSelected).length>0){
            this.isError=this.values.find(v => v.isSelected).label !== this.selectedItemValue;
        }
            if(this.isError){
                //this.errorMsg=unauthorizedValue;
                this.selectedItemValue='';
                this.autocompleteValue='';
                //clone value for reset isSelected Field
                let cloneValues=JSON.parse(JSON.stringify(this.allValues));
                cloneValues.forEach(v=>v.isSelected=false);
                this.filteredValues = cloneValues;
                this.filteredValues = this.filteredValues.filter(item => item.label.toLowerCase().includes(this.autocompleteValue.toLowerCase()));
            }
            else{
                this.errMessage='';
                this.filteredValues = this.allValues;
            }
            const e = new CustomEvent('errorchange', {
                detail: {
                    name: this.name,
                    error: this.errorMsg
                }
            });
            if(this.wasError!=this.isError)
                this.dispatchEvent(e);
    }
    openCloseOptions() {
        if (this.template.querySelector('.slds-dropdown-trigger').classList.contains('slds-is-open')) {
            this.closeOptionsDialog();
            console.log('close' + this.name);
        } else {
            this.openOptionsDialog();
        }
    }
    handleRemove(event){
        const index=event.detail.index;
        event.preventDefault();
        const eventToDispatch = new CustomEvent('removetags', {
            detail: {
                name: this.name,
                index:index
            },
        });
        this.dispatchEvent(eventToDispatch);
    }
    selectOption(event) {
        event.preventDefault();
        this.selectedItemName = event.detail.value;
        this.selectedItemValue = event.detail.value;
        const eventToDispatch = new CustomEvent('selected', {
            composed: true,
            bubbles: true,
            cancelable: true,
            detail: {
                key: event.detail.key,
                value: event.detail.value,
                name: this.name
            },
        });
        this.dispatchEvent(eventToDispatch);
        if(!this.isMultiSelect)
            this.closeOptionsDialog();
    }

    openOptionsDialog() {
        this.template.querySelector('.slds-dropdown-trigger').classList.add('slds-is-open');
        this.template.querySelector('.slds-dropdown-trigger').setAttribute('aria-expanded', true);
    }

    handleChange(event) {
        this.selectedItemValue = event.target.value;
        this.autocompleteValue = event.target.value;
        this.filteredValues = this.allValues;
        this.filteredValues = this.filteredValues.filter(item => item.label?.includes(this.autocompleteValue));
        this.openOptionsDialog();
    }

}