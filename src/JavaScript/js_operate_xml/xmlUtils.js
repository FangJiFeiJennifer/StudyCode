//Parse the XML string to XML DOM document
function loadXml (xmlString) {
  let xmlDoc = null;
  let domParser = null;
  // Determine the type of browser
  // window.DOMParser determine if it is not IE
  if(!window.DOMParser && window.ActiveXObject) {
    let xmlDomVersions = (['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM']);
    for(let i=0;i<xmlDomVersions.length;i++) {
      try {
        xmlDoc = new ActiveXObject(xmlDomVersions[i]);
        //close asynchoronous loading, ensure the parser not execute the script until the document full load.
        xmlDoc.async = false;
        //loadXML function to load the XML string
        xmlDoc.loadXML(xmlString);
        break;
      }catch(e) {
        console.warn("EXCEPTION" + e);
      }
    }
  }else if(window.DOMParser && document.implementation && document.implementation.createDocument) {
    //avaliable for Firefox, Mozilla, Opera browser etc.
    try{
      // DOMParser parser XML and return XML Document object
      domParser = new DOMParser();
      xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
    }catch(e) {
      console.warn("EXCEPTION" + e);
    }
  }else {
    return null;
  }
  return xmlDoc;
}
//Parse the XML file to XML DOM document
function loadXmlFile(filePath) {
  let xmlDoc = null;
  try{
    //Internet Explorer
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
  } catch(e) {
    try{
      //Firefox, Mozilla, Opera, etc.
      xmlDoc = document.implementation.createDocument("","",null);
    } catch(e) {
      console.log("Exception : " + e);
    }
  }
  try {
    xmlDoc.async = false;
    xmlDoc.load(filePath);
  } catch(e) {
    console.log("Exception : " + e);
  }
  return xmlDoc;
}

//Serialize a XML DOM to string
function serializeXml (xmldom) {
  if(typeof XMLSerializer != 'undefined') {
    return (new XMLSerializer()).serializeToString(xmldom);
  }else if( typeof xmldom.xml != 'undefined') {
    return xmldom.xml;
  }else {
    throw new Error("Could not serialize XML DOM.");
  }
}
//Serialize a XML DOM array to string
function analyzeXMLNodeToString (nodeList) {
  let xmlStringList = [];
  for(let i = 0; i < nodeList.length; i++) {
    xmlStringList.push(serializeXml(nodeList[i]));
  }
  return xmlStringList;
}
//Analyze a XML node to a JSON object
function analyzeXMLNodeAttrToArry(node,attrKeys = null) {
  if(assetNotEmpty(node)) {
    let attrArry = [];
    //Get specify attributes key and value
    if(assetNotEmpty(attrKeys)) {
      let attrNode = "";
      for(let i = 0; i < attrKeys.length; i++) {
        let attrObj = {};
        attrNode = node[0].getAttributeNode(attrKeys[i]);
        attrObj[attrNode.name] = attrNode.value;
        attrArry.push(attrObj);
      }
    }else {
      //Get all attributes key and value
      let attrs = node[0].attributes;
      for(let i = 0; i < attrs.length; i++) {
        let attrObj = {};
        attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
        attrArry.push(attrObj);
      }
    }
    return attrArry;
  }
}

function analyzeXMLNodeToObj(node,attrKeys = null) {
  if(assetNotEmpty(node) && node.children.length === 0) {
    //Get specify attributes key and value
    let attrObj = {};
    if(assetNotEmpty(attrKeys)) {
      let attrNode = "";
      for(let i = 0; i < attrKeys.length; i++) {
        attrNode = node.getAttributeNode(attrKeys[i]);
        attrObj[attrNode.name] = attrNode.value;
      }
      attrObj.textContent = node.textContent;
    }else {
      //Get all attributes key and value
      let attrs = node.attributes;
      for(let i = 0; i < attrs.length; i++) {
        attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
      }
      attrObj.textContent = node.textContent;
    }
    return attrObj;
  }else{
    throw new Error("It is not a separate XML node !");
  }
}

function assetNotEmpty(obj) {
  if(obj !== "" && typeof obj !== "undefined" && obj !== null) {
    return true;
  }else{
    return false;
  }
}

export {
  loadXml,
  loadXmlFile,
  serializeXml,
  analyzeXMLNodeToString,
  analyzeXMLNodeAttrToArry,
  analyzeXMLNodeToObj
};
