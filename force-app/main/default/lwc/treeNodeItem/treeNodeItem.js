import { LightningElement, api, track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import SAMPLE_CSS from '@salesforce/resourceUrl/customStyle';
export default class TreeNodeItem extends LightningElement {
    @api node;
    @api htmlStr;
    @api hasPermission;
    @track isExpanded = false;
    @track options = [];
    @track articles = [];
    @track fromArticle;
    @track radioGroupValue;
    @track overrideContent;
    isShown
    selectedContent = { selectedValue: '' };
    selectedArticle = { selectedValue: '' };
    isNewSearch;
    formats = ['font', 'size', 'bold', 'italic', 'underline',
        'strike', 'list', 'indent', 'align', 'link',
        'image', 'clean', 'table', 'header', 'color', 'background', 'direction'];

    @api sourceOptions = [{ label: "בחירת מאמר", value: 'article' },
    { value: 'text', label: "טקסט חופשי" }];
    @api get newSearch() {
        return this.isNewSearch;
    }
    set newSearch(value) {
        this.isNewSearch = value;
    }
    @api get contentsOptions() {
        return this.options;
    }
    set contentsOptions(value) {
        if (value) {
            this.options = JSON.parse(JSON.stringify(value));
        }
    }
    @api get articlesOptions() {
        return this.articles;
    }
    set articlesOptions(value) {
        if (value) {
            this.articles = JSON.parse(JSON.stringify(value));
        }
    }
    connectedCallback(){
        this.overrideContent = this.node.isContentOverride;
    }
    handleOverride(event){
        this.overrideContent = event.target.checked;
    }
    handleChange(event) {
        const selectedOption = event.detail.value;
        this.fromArticle = selectedOption === 'article';
        this.radioGroupValue = selectedOption;
        this.radioButtonMissing = undefined;
    }
    dragOver(ev) {
        let offset = this.oldY - ev.pageY;
        if (offset < -10) {
            window.scrollBy(0,50);
        }
        if (offset > 10) {
            window.scrollBy(0,-50);
            // window.scrollBy({ top: -100, behavior: 'smooth' });
        }
        console.log(this.oldY - ev.pageY);
        this.oldY = ev.pageY;


        if (!this.node.new) {

            var c = this.template.querySelector('.drag-div');
            if (c) {
                c.classList.add('drag-hover');
            }
        }
        ev.preventDefault();
    }
    dragLeave(ev) {
        var c = this.template.querySelector('.drag-div');
        if (c) {
            c.classList.remove('drag-hover');
        }
    }
    drag(ev) {
        this.oldY = 0;
        ev.dataTransfer.setData("childNodeId", this.node.nodeId);
    }

    drop(ev) {
        var c = this.template.querySelector('.drag-div');
        if (c) {
            c.classList.remove('drag-hover');
        }
        ev.preventDefault();
        var childNodeId = ev.dataTransfer.getData("childNodeId");
        if (childNodeId == this.node.nodeId) return;
        const updateParent = new CustomEvent('updateparent', {
            detail: {
                nodeId: this.node.nodeId,
                childNodeId: childNodeId
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(updateParent);
        ev.stopPropagation();
    }

    expandNode(ev) {
        // let copy = this.copyNode(this.node);
        // copy.isExpanded = !copy.isExpanded;
        // this.node=copy;
        // const event =new CustomEvent('expanedevent',{
        //     detail:{
        //         nodeId:this.node.nodeId,
        //         isExpanded:copy.isExpanded
        //     },bubbles:true,composed:true
        // })
        // this.dispatchEvent(event);
        this.isExpanded = !this.isExpanded;
    }
    get isNotLeaf() {
        return this.node && this.node.items && this.node.items.length > 0;
    }
    get isLeaf() {
        return !this.isNotLeaf;
    }
    renderedCallback() {
        const div = this.template.querySelector('.divBorder');
        Promise.all([loadStyle(this, SAMPLE_CSS)]);
        if (div) {
            div.innerHTML = this.htmlStr;
        }
        if (this.node.new && !this.isNotFocus) {
            const input = this.template.querySelector('c-auto-complete-select');
            if (input) {
                input.focusInput();
                this.isNotFocus = true;
            }
            if(this.node.articleId){

                this.selectedArticle.selectedValue = this.articles.find(v=>v.value ===this.node.articleId)?.label;
            }
        }
        if (this.node) {
            this.isShown = true;
        }
        if (this.isNewSearch) {
            if (this.node.items.find(v => v.markable) != undefined) {
                this.isExpanded = true;
                // let copy = this.copyNode(this.node);
                // copy.isExpanded = true;
                // this.node=copy;
                this.isNewSearch = false;
            }
        }
    }
    setName(event) {
        this.inputValue = event.target.value;
    }
    enterHandler(event) {
        this.setNewNode(event);
    }
    removeDraft(event) {
        let copy = this.copyNode(this.node);
        copy.items.splice(-1);
        this.node = copy;
    }
    cancelHandler(event) {
        let copy = this.copyNode(this.node);
        copy.new = false;

        if (!copy.nodeId) {
            const removeDraft = new CustomEvent('draftevent', {
                detail: {
                },
            });
            this.dispatchEvent(removeDraft);
        }
        this.node = copy;
        event.stopPropagation();
    }
    orderUp(event) {
        this.orderEvent(-1);
        event.stopPropagation();
    }
    orderDown(event) {
        this.orderEvent(1);
        event.stopPropagation();
    }
    orderEvent(dir) {
        const orderEvent = new CustomEvent('orderevent', {
            detail: {
                node: this.node,
                dir: dir
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(orderEvent);
    }
    get isFirst() {
        return (this.node.isFirst ? 'disable-icon ' : '') + "slds-m-right_x-small";
    }
    get isLast() {
        return (this.node.isLast ? 'disable-icon ' : '') + "slds-m-right_x-small";
    }
    refreshOptions(event) {
        const typeOption = event.target.dataset["type"];
        const refreshOptions = new CustomEvent('refreshoptions', {
            detail: {
                type: typeOption,
            }, bubbles: true,
            composed: true
        })
        this.dispatchEvent(refreshOptions);
    }
    setNewNode(event) {
        // if (!this.radioGroupValue) {
        //     const radio = this.template.querySelector('lightning-radio-group');
        //     if (radio) {
        //         this.radioButtonMissing = 'בחר מקור לתיאור';
        //         radio.reportValidity();
        //     }
        //     return;
        // }
        const inputValue = this.template.querySelector('c-auto-complete-select');
        let value;
        if (inputValue) {
            value = inputValue.selectedItem;
        }
        const richText = this.template.querySelector('.rich-text-value');
        let copy = this.copyNode(this.node);
        if (richText && this.node) {
            copy.richText = richText.value;
        }
        copy.isContentOverride =this.overrideContent;
        this.node = copy;
        const editNode = new CustomEvent('editnode', {
            detail: {
                node: this.node,
                label: value ? value : this.node.label
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(editNode);
        event.stopPropagation();
    }
    copyNode(node) {
        return JSON.parse(JSON.stringify(node));
    }
    insertNode(event) {
        let copy = this.copyNode(this.node);
        //copy.isExpanded = true;
        this.isExpanded = true;
        copy.items.push({ new: true, label: 'חדש', name: 'New node', items: [], level: this.node.level + 1, parentId: this.node.nodeId, lastItem: this.node.items.slice(-1)[0] });
        this.node = copy;
        event.stopPropagation();
    }
    editNode(event) {
        let copy = this.copyNode(this.node);
        copy.new = true;
        this.node = copy;
        event.stopPropagation();
    }
    deleteNode(event) {
        const removeNode = new CustomEvent('removenode', {
            detail: {
                node: this.node,
                removeChilds: this.removeChilds
            },
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(removeNode)
        event.stopPropagation();
    }
    handleSelectionArticle(event) {
        debugger
        this.selectedArticle.selectedValue = event.detail.value;
        let copy = this.copyNode(this.node);
        copy.articleHtml = this.articles.find(v => v.value == event.detail.key)?.info;
        copy.articleId = this.articles.find(v => v.value == event.detail.key)?.value;
        this.node = copy;
    }
    handleSelection(event) {
        this.selectedContent.selectedValue = event.detail.value;
        let selectedValue = event.detail.key;
        let copy = this.copyNode(this.node);
        copy.label = this.selectedContent.selectedValue;
        copy.name = selectedValue;

        this.options.forEach(val => {
            if (val.value == event.detail.key) {
                val.isSelected = true;
                if(val.articleId){
                    copy.articleHtml = this.articles.find(v => v.value == event.detail.key)?.info;
                    copy.articleId = this.articles.find(v => v.value == event.detail.key)?.value;
                }
                if(val.description){
                    copy.richText =val.description;
                }
            } else {
                val.isSelected = false;
            }
        });

        copy.isSelected = true;
        this.node = copy;
    }
    get isDragable() {
        return this.node.parentId !== undefined && this.node.parentId !== null && !this.node.new;
    }
}