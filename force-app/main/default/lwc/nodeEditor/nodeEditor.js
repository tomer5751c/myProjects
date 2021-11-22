import { LightningElement, api, track } from 'lwc';
import { customLabels } from 'c/customLabelsHelper';
export default class NodeEditor extends LightningElement {
    @api node;
    @api isDragable;

    @track overrideContent;
    @track sourceOptions = [{ label: customLabels.ArticleSelection, value: 'article' },
    { value: 'text', label: customLabels.FreeText }];
    @track radioGroupValue;
    @track isArticleSource;

    @api get contentsOptions() {
        return this.selectedContent.values;
    }
    set contentsOptions(value) {
        if (value) {
            this.selectedContent.values = JSON.parse(JSON.stringify(value));
        }
    }
    @api get articlesOptions() {
        return this.selectedArticle.values;
    }
    set articlesOptions(value) {
        if (value) {
            this.selectedArticle.values = JSON.parse(JSON.stringify(value));
        }
    }

    selectedContent = { selectedValue: '', name: 'Select Content', label: customLabels.Content, values: [], dataEvent: 'contentselected' };
    selectedArticle = { iconName:"utility:account",selectedValue: '',name: 'Select Article', label:customLabels.Article, values: [], dataEvent: 'articleselected'};
    formats = ['font', 'size', 'bold', 'italic', 'underline',
        'strike', 'list', 'indent', 'align', 'link',
        'image', 'clean', 'table', 'header', 'color', 'background', 'direction'];
    labels = customLabels;
    connectedCallback() {
        this.overrideContent = this.node.isContentOverride;
        this.radioGroupValue = this.node.source?.toLowerCase();
        this.isArticleSource = this.node.source?.toLowerCase() == 'article';
    }
    renderedCallback() {
        if (this.node.new && !this.isNotFocus) {
            const input = this.template.querySelector('c-auto-complete-select');
            if (input) {
                input.focusInput();
                this.isNotFocus = true;
            }
            if (this.node.articleId) {
                this.selectedArticle.selectedValue = this.articlesOptions.find(v => v.value === this.node.articleId)?.label;
            }
        }
        if (!this.node.new) {
            this.overrideContent = this.node.isContentOverride;
            this.radioGroupValue = this.node.source?.toLowerCase();
            this.isArticleSource = this.node.source?.toLowerCase() == 'article';
        }
    }
    handleChange(event) {
        const selectedOption = event.detail.value;
        this.isArticleSource = selectedOption === 'article';
        this.radioGroupValue = selectedOption;
        this.radioButtonMissing = undefined;
    }

    sendEvent(eventName, details) {
        const newEvent = CustomEvent(eventName, details);
        this.dispatchEvent(newEvent);
    }
    handleSelection(event) {
        const nameEvent = event.target.dataset['event'];
        const details = {
            detail: {
                key: event.detail.key,
                value: event.detail.value
            }
        }
        this.sendEvent(nameEvent, details);
        event.stopPropagation();
    }
    cancelHandler(event) {
        this.sendEvent('cancelevent');
        event.stopPropagation();
    }
    enterHandler(event) {
        this.setNewNode(event);
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
    connectedCallback() {
        this.overrideContent = this.node.isContentOverride;
    }
    handleOverride(event) {
        this.overrideContent = event.target.checked;
    }
    setNewNode(event) {
        const inputValue = this.template.querySelector('c-auto-complete-select');
        const richText = this.template.querySelector('.rich-text-value');
        const details = {
            detail: {
                richText: richText?.value,
                label: inputValue ? inputValue?.selectedItem : this.node.label,
                isContentOverride: this.overrideContent == true,
                source : this.radioGroupValue
            }
        };
        this.sendEvent('newnodeevent', details)
        event.stopPropagation();
    }
    
}