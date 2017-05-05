var node = {
		"id": 50001,
		"name": "User",
		"status": 0,
		"description": "test",
		"createdBy": "huali",
		"lastModifier": "huali",
		"creationDate": 1492581384000,
		"lastModifedDate": 1492581384000,
		"adapter": null,
		"children": [{
				"id": 50002,
				"name": "Account",
				"status": 0,
				"description": "test",
				"createdBy": "huali",
				"lastModifier": "huali",
				"creationDate": 1492582117000,
				"lastModifedDate": 1492582117000,
				"adapter": null,
				"children": [{
						"id": 50003,
						"name": "Issue",
						"status": 0,
						"description": "test",
						"createdBy": "huali",
						"lastModifier": "huali",
						"creationDate": 1492581896000,
						"lastModifedDate": 1492581896000,
						"adapter": null,
						"children": [{
								"id": 50007,
								"name": "closeDate",
								"status": 0,
								"description": "test",
								"createdBy": "huali",
								"lastModifier": "huali",
								"creationDate": 1492581845000,
								"lastModifedDate": 1492581845000,
								"adapter": null,
								"children": [],
								"type": "Date",
								"multiple": false
							}, {
								"id": 50004,
								"name": "id",
								"status": 0,
								"description": "test",
								"createdBy": "huali",
								"lastModifier": "huali",
								"creationDate": 1492581896000,
								"lastModifedDate": 1493113550000,
								"adapter": null,
								"children": [{
										"id": 5000000026,
										"name": "testEdit",
										"status": 0,
										"description": "test",
										"createdBy": "Daniel",
										"lastModifier": "Daniel",
										"creationDate": 1493358267000,
										"lastModifedDate": 1493878062000,
										"adapter": null,
										"children": [],
										"type": "Object",
										"multiple": true
									}
								],
								"type": "Number",
								"multiple": true
							}, {
								"id": 50006,
								"name": "openDate",
								"status": 0,
								"description": "openDate means openDate",
								"createdBy": "huali",
								"lastModifier": "huali",
								"creationDate": 1492581897000,
								"lastModifedDate": 1493111434000,
								"adapter": null,
								"children": [],
								"type": "Date",
								"multiple": true
							}, {
								"id": 50005,
								"name": "status",
								"status": 0,
								"description": "test",
								"createdBy": "huali",
								"lastModifier": "huali",
								"creationDate": 1492581896000,
								"lastModifedDate": 1492581896000,
								"adapter": null,
								"children": [{
										"id": 5000000025,
										"name": "test",
										"status": 0,
										"description": "test",
										"createdBy": "Daniel",
										"lastModifier": "Daniel",
										"creationDate": 1493278066000,
										"lastModifedDate": 1493278066000,
										"adapter": null,
										"children": [],
										"type": "test",
										"multiple": false
									}
								],
								"type": "String",
								"multiple": false
							}
						],
						"type": "Custom_Object",
						"multiple": true
					}
				],
				"type": "Custom_Object",
				"multiple": false
			}, {
				"id": 5000000027,
				"name": "Account2",
				"status": 0,
				"description": "Account2",
				"createdBy": "Daniel",
				"lastModifier": "Daniel",
				"creationDate": 1493865912000,
				"lastModifedDate": 1493865912000,
				"adapter": null,
				"children": [{
						"id": 5000000028,
						"name": "Issue2",
						"status": 0,
						"description": "Issue2",
						"createdBy": "Daniel",
						"lastModifier": "Daniel",
						"creationDate": 1493865931000,
						"lastModifedDate": 1493865931000,
						"adapter": null,
						"children": [{
								"id": 5000000029,
								"name": "Status",
								"status": 0,
								"description": "Status",
								"createdBy": "Daniel",
								"lastModifier": "Daniel",
								"creationDate": 1493865956000,
								"lastModifedDate": 1493865956000,
								"adapter": null,
								"children": [],
								"type": "Number",
								"multiple": false
							}
						],
						"type": "Object",
						"multiple": false
					}
				],
				"type": "Object",
				"multiple": false
			}
		],
		"type": "Custom_Object",
		"multiple": false
	}
function _metaRecursion(node){

	var children = node.children;
	if(children==null || children.length == 0){
		var name = node.name;
		var type = node.type;
		var tmp = {};
		tmp[name] = type;
		return tmp;
	}

	var result= {};
	var merge = {};
	for(var i = 0; i < children.length; i++) {
		var child = children[i];
		var o = this._metaRecursion(child);
		merge = Object.assign(merge,o);
	}
	result[node.name] = merge;
	return result;
	
}

function test() {
	console.log(_metaRecursion(node));
}