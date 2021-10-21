public with sharing class TreeScriptCall{
	@AuraEnabled
	public static Account getAccount(Id accountId){
		return [SELECT name, isAllowed__c
		        FROM Account
		        WHERE id = :accountId
		        limit 1];
	}

	//get all tries types
	@AuraEnabled(cacheable = true)
	public static List<TreeDecisions__c> getTrees(){
		return [SELECT Id, Name
		        FROM TreeDecisions__c];
	}

	// delete bulk of decisions nodes
	@AuraEnabled
	public static void deleteNodes(List<id> nodesIds){
		List<Decision__c> decisions = [SELECT id
		                               FROM Decision__c
		                               WHERE id in :nodesIds];
		delete decisions;
	}

	//set the parent node id
	@AuraEnabled
	public static void moveNodes(List<id> nodesIds, Id parentId){
		List<Decision__c> decisions = [SELECT id
		                               FROM Decision__c
		                               WHERE id in :nodesIds];
		for (Decision__c d : decisions){
			d.parentDecision__c = parentId;
		}
		update decisions;
	}

	//update the node orders
	@AuraEnabled
	public static void orderItems(Map<String, Integer> newOrders){
		List<Decision__c> newOrdersDecisions = new List<Decision__c>();
		for (String key : newOrders.keySet()){
			newOrdersDecisions.add(new Decision__c(Id = key, order__c = newOrders.get(key)));
		}
		update newOrdersDecisions;
	}

	//get all contents options
	@AuraEnabled
	public static List<Content__c> getContents(){
		return [SELECT Id,Name, Description__c, Label__c,ArticleId__c
		        FROM Content__c];
	}

	//get decisions by tree id
	@AuraEnabled
	public static TreeNode getDecisions(Id treeId){
		Map<id, List<id>> decisionMap = new Map<Id, List<Id>>();
		Map<id, Content__c> contents = new Map<id, Content__c>([SELECT Id, Description__c, Label__c, ArticleId__c, Name
		                                                        FROM Content__c]);
		Map<id, Decision__c> decisions = new Map<Id, Decision__c>([SELECT id, Name, parentDecision__c, Content__r.Description__c, Content__r.articleId__c, articleId__c, order__c, richText__c,Override_Content__c
		                                                           FROM Decision__c
		                                                           WHERE TreeDecisions__c = :treeId]);
		Id rootId;
		for (Decision__c d : decisions.values()){
			if (d.parentDecision__c == null){
				rootId = d.Id;
			}
			if (!decisionMap.containsKey(d.parentDecision__c)){
				decisionMap.put(d.parentDecision__c, new List<Id>());
			}
			decisionMap.get(d.parentDecision__c).add(d.Id);

		}
		TreeNode tr;
		if (rootId != null){
			tr = new TreeNode(decisions.get(rootId), contents);
			buildDecisionsTree(decisionMap, rootId, tr, decisions, contents);
		}
		return tr;
	}

	//get salesforce articles
	@AuraEnabled
	public static List<test__kav> getInfoArticles(){
		List<test__kav> articles = [Select Id, UrlName, info__c
		                            from test__kav];
		// Map<Id,String> articlesMap = new Map<Id,String>();
		// if (articles.size() > 0){
		//     for(test__kav tk: articles){
		//         articlesMap.put(tk.id, tk.info__c);
		//     }
		// } else{
		//     return null ;
		// }
		return articles;
	}

	// build the decisions tree
	private static void buildDecisionsTree(Map<id, List<id>> decisionMap, Id nodeId, TreeNode node, Map<Id, Decision__c> decisions, Map<Id, Content__c> contents){
		if (decisionMap.get(nodeId) == null || decisionMap.get(nodeId).size() == 0){
			return;
		} else{
			// for the first time-create the Root
			if (node == null){
				node = new TreeNode(decisions.get(nodeId), contents);
			}
			for (id childId : decisionMap.get(nodeId)){
				TreeNode child = new TreeNode(decisions.get(childId), contents);
				node.items.add(child);
				buildDecisionsTree(decisionMap, childId, child, decisions, contents);
			}
		}
	}

	//warpper class for Tree nodes(Decisions node)
	public class TreeNode{
		@AuraEnabled
		public String name{ get; set; }

		@AuraEnabled
		public String richText{ get; set; }

		@AuraEnabled
		public Integer level{ get; set; }

		@AuraEnabled
		public String label{ get; set; }

		@AuraEnabled
		public String type{ get; set; }

		@AuraEnabled
		public List<TreeNode> items{ get; set; }

		@AuraEnabled
		public Id nodeId{ get; set; }

		@AuraEnabled
		public Id parentId{ get; set; }

		@AuraEnabled
		public Id articleId{ get; set; }

		@AuraEnabled
		public Decimal order{ get; set; }

		@AuraEnabled
		public Boolean isContentOverride{ get; set; }

		public TreeNode(){
		}

		public TreeNode(Decision__c d, Map<Id, Content__c> contents){
			name = d.id;
			isContentOverride=d.Override_Content__c;
			items = new List<TreeNode>();
			
			if (d.Content__c != null){
				if (contents.containsKey(d.Content__c)){
					label = contents.get(d.Content__c).Label__c;
					if(d.Override_Content__c){
						articleId = d.articleId__c;
						 richText =d.richText__c;
					}
					else{
						articleId = contents.get(d.Content__c).ArticleId__c;
						richText = contents.get(d.Content__c).Description__c;
					}
				}
			}
			parentId = d.parentDecision__c;
			nodeId = d.Id;
			order = d.order__c;
			

			
		}
	}
}