//node editor
import preview from '@salesforce/label/c.Preview';
import editNode from '@salesforce/label/c.EditNode';
import addNode from '@salesforce/label/c.AddNode';
import sourceToogle from '@salesforce/label/c.SourceToogle';
import chooseDescription from '@salesforce/label/c.RadioChooseDescription';
import articlePreview from '@salesforce/label/c.ArticlePreview';
import enterText from '@salesforce/label/c.EnterText';
import SelectArticle from '@salesforce/label/c.SelectArticle';
import ArticleSelection from '@salesforce/label/c.ArticleSelection';
import Article from '@salesforce/label/c.Article';
import Content from '@salesforce/label/c.Content';
import Select from '@salesforce/label/c.Select';

import FreeText from '@salesforce/label/c.FreeText';


//call script
import treeTitle from '@salesforce/label/c.TreeTitle';
import chooseTree from '@salesforce/label/c.ChooseTree';
import searchByKeywords from '@salesforce/label/c.SearchByKeywords';
import ContentAvailable from '@salesforce/label/c.ContentAvailable';
import newLabel from '@salesforce/label/c.NewLable';


//delete modal
import DeleteBranches from '@salesforce/label/c.DeleteBranches';
import DeleteNodeWarning from '@salesforce/label/c.DeleteNodeWarning';
import DeleteNode from '@salesforce/label/c.DeleteNode';





const customLabels={
    preview,
    editNode,
    addNode,
    sourceToogle,
    chooseDescription,
    articlePreview,
    enterText,SelectArticle,ArticleSelection,FreeText,Article,Content,

    treeTitle,
    chooseTree,
    searchByKeywords,
    ContentAvailable,newLabel,

    DeleteBranches,DeleteNodeWarning,DeleteNode,Select

}
export {customLabels};