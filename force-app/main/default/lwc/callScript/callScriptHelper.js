// Decision Object
import RICHTEXT_FIELD from '@salesforce/schema/Decision__c.richText__c';
import ARTICLEID_FIELD from '@salesforce/schema/Decision__c.articleId__c';
import PARENT_DECISION_FIELD from '@salesforce/schema/Decision__c.parentDecision__c';
import DECISIONID_FIELD from '@salesforce/schema/Decision__c.Id';
import CONTENT_FIELD from '@salesforce/schema/Decision__c.Content__c';
import ORDER_FIELD from '@salesforce/schema/Decision__c.Order__c';
import TREEID_FIELD from '@salesforce/schema/Decision__c.TreeDecisions__c';
import OVERRIDE_CONTENT_FIELD from '@salesforce/schema/Decision__c.Override_Content__c';
import SOURCE_FIELD from '@salesforce/schema/Decision__c.Source__c';

import DECISION_OBJECT from '@salesforce/schema/Decision__c';

//Content Object
import DESCRIPTION_FIELD from '@salesforce/schema/Content__c.Description__c';
import CONTENTARTICLEID_FIELD from '@salesforce/schema/Content__c.ArticleId__c';
import LABEL_FIELD from '@salesforce/schema/Content__c.Label__c';
import CONTENTID from '@salesforce/schema/Content__c.Id';
import CONTENT_OBJECT from '@salesforce/schema/Content__c';
import CONTENT_SOURCE_FIELD from '@salesforce/schema/Content__c.Source__c';


const decisionFields={
    DECISIONID_FIELD,
    RICHTEXT_FIELD,
    ARTICLEID_FIELD,
    PARENT_DECISION_FIELD,
    TREEID_FIELD,CONTENT_FIELD,ORDER_FIELD,OVERRIDE_CONTENT_FIELD,SOURCE_FIELD
}
const contentFields={
    DESCRIPTION_FIELD,
    CONTENTARTICLEID_FIELD,
    LABEL_FIELD,CONTENTID,CONTENT_SOURCE_FIELD
}
export { decisionFields,contentFields,DECISION_OBJECT,CONTENT_OBJECT };