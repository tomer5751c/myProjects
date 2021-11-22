import { LightningElement, track, wire,api } from 'lwc';
import getDecisions from '@salesforce/apex/TreeScriptCall.getDecisions';
import deleteNodes from '@salesforce/apex/TreeScriptCall.deleteNodes';
import moveNodes from '@salesforce/apex/TreeScriptCall.moveNodes';
import setOrderItems from '@salesforce/apex/TreeScriptCall.orderItems';
import getTrees from '@salesforce/apex/TreeScriptCall.getTrees';
import getContents from '@salesforce/apex/TreeScriptCall.getContents';
import getInfoArticles from '@salesforce/apex/TreeScriptCall.getInfoArticles';
import { createRecord, deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { decisionFields, DECISION_OBJECT, contentFields, CONTENT_OBJECT } from './callScriptHelper'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import hasPermission from '@salesforce/customPermission/showAdminActions';
import { customLabels } from 'c/customLabelsHelper';

export default class CallScript extends LightningElement {

    @api get treesIds(){
        return this._trees ? this._trees :[];
    };
    set treesIds(value){
        if(typeof(value)=='string'){
            this._trees = value.replace('[','').replace(']','').split(',');
        }
    }
    @track treesOptions = [];
    @track root = {};
    @track items = [];
    @track selectedTree;
    @track showModal = false;
    @track removeChilds = false;
    @track optionalBranches;
    @track loading;
    onlyOneTree = false;
    mapping;
    mapId = {};
    index = 0;
    removedNode;
    selectedBranch;
    adminPermission =hasPermission;
    labels = customLabels;

    @wire(getTrees,{treesIds:'$treesIds'}) getTrees({ data, error }) {
        if (data) {
            let options = [];
            console.log(data);
            data.forEach(elem => {
                options.push({ label: elem.Name, value: elem.Id });
            });
            this.treesOptions = options;
            if(this.onlyOneTree=(this.treesIds.length ===1)){
                this.selectTree({detail:{value:this.treesIds[0]}})
            }
        }
        if (error) {
            console.log(error);
        }
    }

    deleteOptionClick(event) {
        if (this.removedNode) {
            this.deleteDecision(this.removedNode.nodeId);
        }
        if (this.selectedBranch || this.removeChilds)
            this.closeModal();
    }
    cancelOptionClick(event) {
        this.closeModal();
    }
    removeAllChilds(event) {
        this.removeChilds = event.target.checked;
    }
    closeModal(event) {
        this.showModal = false;
        this.removedNode = undefined;
        this.clearValues();
    }
    searchNodes(event){
        this.markNodes(this.root,event.target.value);
        this.newSearch =true;
    }
    
    markNodes(node,value){
        if(!node){
            return;
        }
        else{
                node.markable=node.label.indexOf(value)>=0 && value.length >1;
            for (let child of node.items) {
                this.markNodes(child,value);
            }
        }
    }
    getSubNodes(node) {
       var result=[];
       if(node.items!=null && node.items.length >0){
            for(let child of node.items){
                result.push(node.nodeId,...this.getSubNodes(child));
            }
       }
       else{
           return [node.nodeId];
       }
       return result;
    }
    openModal() {
        this.showModal = true;
        this.clearValues();
    }
    clearValues() {
        this.removeChilds = false;
        this.selectedBranch = undefined;
    }
    setOptions(values) {
        this.options = values.map(v => {
            var option = { label: v, value: v };
            return option;
        })
    }
    selectTree(event) {
        this.selectedTree = event.detail.value;
        this.setDecisionsTree();
    }

    createContent(contentLabel,description,article,isContentOverride,source) {
        const fields = {};
        fields[contentFields.LABEL_FIELD.fieldApiName] = contentLabel;
        if(!isContentOverride){
            fields[contentFields.DESCRIPTION_FIELD.fieldApiName] = description;
            fields[contentFields.CONTENTARTICLEID_FIELD.fieldApiName] = article;
            fields[contentFields.CONTENT_SOURCE_FIELD.fieldApiName] = source;
        }

        const recordInput = { apiName: CONTENT_OBJECT.objectApiName, fields };
        return createRecord(recordInput);

    }
    createDecision(body, parentId, contentId, lastItem,articleId,isContentOverride,source) {
        const fields = {};
        this.loading = true;
        fields[decisionFields.TREEID_FIELD.fieldApiName] = this.selectedTree;
        fields[decisionFields.PARENT_DECISION_FIELD.fieldApiName] = parentId;
        fields[decisionFields.CONTENT_FIELD.fieldApiName] = contentId;
        fields[decisionFields.SOURCE_FIELD.fieldApiName] = source;
        if(isContentOverride){
            fields[decisionFields.RICHTEXT_FIELD.fieldApiName] = body;
            if(articleId){
                fields[decisionFields.ARTICLEID_FIELD.fieldApiName] = articleId;
            }
        }
        fields[decisionFields.OVERRIDE_CONTENT_FIELD.fieldApiName] = isContentOverride;
        fields[decisionFields.ORDER_FIELD.fieldApiName] = lastItem ? lastItem.order + 1 : 1;

        const recordInput = { apiName: DECISION_OBJECT.objectApiName, fields };
        createRecord(recordInput).then(res => {
            console.log(res);
            this.setDecisionsTree();
            this.loading = false;
        }).catch(err => {
            console.log(err);
            this.loading = false;
        })
    }
    updateDecision(fields) {
        this.loading = true;
        const recordInput = { fields };
        updateRecord(recordInput).then(res => {
            console.log(res);
            this.setDecisionsTree();
            this.loading = false;
        }).catch(err => {
            console.log(err);
            this.loading = false;
        })
    }
    updateContent(fields) {
        this.loading = true;
        const recordInput = { fields };
        updateRecord(recordInput).then(res => {
            console.log(res);
            this.loading = false;
        }).catch(err => {
            console.log(err);
            this.loading = false;
        })
    }
    changeOrder(event) {
        let node = event.detail.node;
        let dir = event.detail.dir;
        let parentNode = this.findNode(this.root, node.parentId);
        if (parentNode) {
            let nodeIndex = parentNode.items.findIndex(v => v.nodeId == (node.nodeId));
            if (nodeIndex >= 0) {
                let swapNode = parentNode.items[nodeIndex + dir];
                let newOrders = {};
                newOrders[node.nodeId] = swapNode.order;
                newOrders[swapNode.nodeId] = node.order;
                this.loading = true;
                setOrderItems({ newOrders: newOrders }).then(res => {
                    console.log(res);
                    this.setDecisionsTree();
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                })
            }
        }

    }
    deleteDecision(D_id) {
        this.loading = true;
        let find = this.findNode(this.root, D_id);
        if (this.removeChilds == true) {
            let nodes = this.getSubNodes(find);
            nodes.push(D_id);
            deleteNodes({ nodesIds: nodes }).then(res => {
                console.log(res);
                this.closeModal();
                this.setDecisionsTree();
            }).catch(err => {
                this.closeModal();
                console.log(err);
                this.loading = false;
            })
        }
        else {
            if (!this.selectedBranch && find.items.length>0) {
                this.showNotification('מחיקת צומת', 'יש לבחור ענף אחר אליו יעברו הצמתים', 'info');
                return;
            }

            if (find) {
                let branchIds = find.items.map(v => v.nodeId);
                moveNodes({ nodesIds: branchIds, parentId: this.selectedBranch }).then(res => {
                    deleteRecord(D_id).then(res => {
                        console.log(res);
                        this.setDecisionsTree();
                        this.closeModal();
                    }).catch(err => {
                        console.log(err);
                    })
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                    this.closeModal();
                })
            }


        }

    }
    handleSelect(event) {
        console.log('handleSelect :', event.detail.name);
        this.selectedBranch = event.detail.name;
    }
    removeNodesEvent(event) {
        this.removedNode = event.detail.node;
        this.setNodeDisabled(this.removedNode.nodeId);
        this.openModal();
    }
    setNodeDisabled(nodeId) {
        this.branches = this.items;
        let find = this.findNode(this.branches[0], nodeId);
        if (find) {
            find.disabled = true;
        }
    }
    findNode(node, nodeId) {
        let res;
        if (node) {
            if (node.nodeId == nodeId) {
                return node;
            }
            else {
                for (let child of node.items) {
                    res = res || this.findNode(child, nodeId);
                }
            }
        }
        return res;
    }
    checkDuplication(label,description,article,isContentOverride,source) {
        let options = this.contentsOptions.filter(v => v.label === label);
        const fields={};
        return new Promise((resolve, reject) => {
            if (options.length > 0) {
                if(options[0].description !=description && description?.length >0){
                    fields[contentFields.DESCRIPTION_FIELD.fieldApiName] = description;
                }
                if(options[0].articleId !=article && article?.length >0){
                    fields[contentFields.CONTENTARTICLEID_FIELD.fieldApiName] = article;
                }
                if(Object.keys(fields).length >0){
                    fields[contentFields.CONTENTID.fieldApiName] = options[0].value;
                    fields[contentFields.CONTENT_SOURCE_FIELD.fieldApiName] = source;
                    if(!isContentOverride){
                        this.updateContent(fields); 
                    }
                }
                resolve(options[0].value);
            }
            else {
                this.loading = true;
                this.createContent(label,description,article,isContentOverride,source).then(res => {
                    console.log(res);
                    this.setContents();
                    this.loading = false;
                    resolve(res.id);
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                    reject(err);
                })
            }
        })
    }
    editParentEvent(event) {
        const parentId = event.detail.nodeId;
        const childId = event.detail.childNodeId;
        const fields = {};
        fields[decisionFields.DECISIONID_FIELD.fieldApiName] = childId;
        fields[decisionFields.PARENT_DECISION_FIELD.fieldApiName] = parentId;
        if(parentId != undefined && childId !='undefined'){

            this.updateDecision(fields);
        } 
    }
    editNodeEvent(event) {
        const n = event.detail.node;
        const label = event.detail.label;
        const source =event.detail.source;
        const fields = {};

        this.checkDuplication(label,n.richText,n.articleId,n.isContentOverride,source).then(id => {
            if (!n.nodeId) {
                this.createDecision(n.richText ? n.richText :label, n.parentId, id, n.lastItem,n.articleId,n.isContentOverride,source);
            }
            else {
                if(n.isContentOverride){
                    fields[decisionFields.RICHTEXT_FIELD.fieldApiName] = n.richText ? n.richText :label;
                    if(n.articleId){
                        fields[decisionFields.ARTICLEID_FIELD.fieldApiName] = n.articleId;
                    }
                }
                fields[decisionFields.DECISIONID_FIELD.fieldApiName] = n.nodeId;
                fields[decisionFields.OVERRIDE_CONTENT_FIELD.fieldApiName] = n.isContentOverride;
                fields[decisionFields.CONTENT_FIELD.fieldApiName] = id;
                fields[decisionFields.SOURCE_FIELD.fieldApiName] = source;
                this.updateDecision(fields);
            }
        }).catch(err => {
            console.log(err);
        })
    }

    setDecisionsTree() {
        this.loading = true;
        // this.root ={};
        // this.items =[];
        getDecisions({ treeId: this.selectedTree }).then(nodes => {
            if (nodes) {
                console.log(nodes);
                this.items = [nodes];
                if(this.items?.length >0){
                    this.addLevel(this.items[0], 1);
                    this.root = this.items[0];
                    this.root.isFirst = this.root.isLast = true;
                    this.loading = false;
                }
            }else{
                this.loading = false;
            }
            

        }).catch(err => {
            console.log(err);
            this.loading = false;
        })
        this.setContents();
    }
    getArticles= ()=>{
        getInfoArticles().then(res => {
            this.articlesOptions = res.map(v => {
                var option = { label: v.UrlName, value: v.UrlName,id:v.Id,info:v.info__c,isSelected:false };
                return option;
            })
            this.articlesMap ={}
            for(var art of this.articlesOptions){
                if(!this.articlesMap[art.value]){
                    this.articlesMap[art.value]=art;
                }
            }
        }).catch(err => {
            console.log(err);
        })
    }
    connectedCallback() {
        this.loadingWrapper(this.getArticles);
    }
    setContents =()=> {
        getContents().then(res => {
            this.contentsOptions = res.map(v => {
                var option = { articleId:v.ArticleId__c,description:v.Descripton__c,label: v.Label__c, value: v.Id,name:v.Label__c,isSelected:false };
                return option;
            })
        }).catch(ex => {
            console.log(ex);
        })
    }
    // expandAll(event){
    //     this.setProp(this.root,true);
    // }
    // collapseAll(event){
    //     this.setProp(this.root,false);
    // }
    // setExpanded(event)
    // {
    //     const nodeId = event.detail.nodeId;
    //     const isExpanded=event.detail.isExpanded;
    //     let node = this.findNode(this.root,nodeId);
    //     node.isExpanded =isExpanded;
    // }
    setProp(node,value){
        if(!node){
            return;
        }
        else{
                node.isExpanded =value;
            for (let child of node.items) {
                this.setProp(child,value);
            }
        }
    }
    loadingWrapper(callback){
        this.loading = true;
        new Promise((reslove,reject)=>{
            try{
                callback();
                reslove();
            }catch{
                reject();
            };
        }).then(v=>{
            this.loading = false;
        }).catch(er=>{
            this.loading = false;
        })
    }
    refreshOptions(event){
        const type=event.detail.type;
        if(type=="article"){
            this.loadingWrapper(this.getArticles);
        }
        else if(type=="content"){
            this.setContents();
        }
    }
    addLevel(node, level) {
        node.level = level;
        if(node.articleId){
            node.articleHtml = this.articlesMap[node.articleId]?.info;
        }
        else{
            if(node?.richText===node?.label)
                node.richText="";
        }
        node.id = this.index++;
        if (!this.mapId[node.id]) {
            this.mapId[node.id] = node;
        }
        if (!node.items || node.items.length == 0) {
            return;
        }
        else {
            node.items.sort((a, b) => {
                return a.order - b.order;
            })
            node.items[0].isFirst = true;
            node.items[node.items.length - 1].isLast = true;
            for (var child of node.items) {
                this.addLevel(child, level + 1);
            }
        }
    }
    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
    get isNotEmpty(){
        return this.root && Object.keys(this.root) ?.length !==0 ;
    }
}