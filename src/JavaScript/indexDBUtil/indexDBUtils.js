window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};
// This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

if (!window.indexedDB) {
  window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}
function assetNotEmpty(obj) {
  if(obj !== "" && typeof obj !== "undefined" && obj !== null) {
    return true;
  }else{
    return false;
  }
}
let store = null;
let db = null;
let request = null;
function addDataToIndexDB (dbName,dbVersion,storeName,keyPath,indexArry,data) {
  // open database
  request = window.indexedDB.open(dbName, dbVersion);
  request.onupgradeneeded = function(event) {
    console.log(event.oldVersion);
    db = request.result;
    if (db.objectStoreNames.contains(storeName)) {
      db.deleteObjectStore(storeName);
    }
    store = db.createObjectStore(storeName, {keyPath: keyPath});
    if(assetNotEmpty(indexArry) && indexArry.length > 0) {
      for(let i = 0; i < indexArry.length; i++) {
        store.createIndex(indexArry[i].indexKey, indexArry[i].indexKey,{unique: indexArry[i].unique});
      }
    }
    for (let i = 0; i < data.length; i++) {
      store.add(data[i]);
    }
  };
  request.onerror = function(event) {
    alert("Database error: " + event.target.error);
  };
}

function getDataFromDB(dbName,dbVersion,storeName) {
  request = window.indexedDB.open(dbName, dbVersion);
  request.onsuccess = function(event) {
    db = request.result;
    store = db.transaction(storeName).objectStore(storeName).get("00:19:37").onsuccess = function(event) {
      console.log(event.target.result.name);
    };
  };
}


export {
  addDataToIndexDB,
  getDataFromDB
};
