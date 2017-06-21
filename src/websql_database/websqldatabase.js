let DBNAME = "UCMDB";
let db = null;
const DB_SIZE = 200 * 1024 * 1024; //200MB
const DESCRIPTION = 'UCMDB Discovery log';
const VERSION = '1.0';

let TABLES = [
  {
    "name" : "Log_data",
    "ddl"  : "(id unique, timeStamp TEXT, severity TEXT, content TEXT)"
  }
];

function initiDatabase () {
  db = window.openDatabase(DBNAME,VERSION,DESCRIPTION,DB_SIZE);
  for (let i = 0; i< TABLES.length; i++) {
    createTable (TABLES[i].name,TABLES[i].ddl,null,null);
  }
}

function createTable(tableName,fieldsText,callBackMethod,callBackParam) {
  db.transaction(function(tx) {
    var query = "CREATE TABLE IF NOT EXISTS "+ tableName + fieldsText;
    tx.executeSql(query,[],function() {
      if(callBackMethod != null && callBackParam != null) {
        callBackMethod(callBackParam);
      }else if(callBackMethod != null) {
        callBackMethod();
      }
    },function(tx,results) {
      console.error("ERROR : " + results);
    });
  });
}

function addDataToTable (tableName,columnName,columnValue,callBackMethod,callBackParam) {
  var columnNames = columnName.split("~");
  var part_num = 0;
  var columnNamesString = "";
  if(columnNames.length != 1) {
    while (part_num < columnNames.length) {
      if(part_num == (columnNames.length - 1)) {
        columnNamesString = columnNamesString + columnNames[part_num];
      }else {
        columnNamesString = columnNamesString + columnNames[part_num] + ",";
      }
      part_num += 1;
    }
  }else {
    columnNamesString = columnName;
  }
  var columnValues = columnValue.split("~");
  part_num = 0;
  var columnValuesString = "'";
  if(columnValues.length != 1) {
    while (part_num < columnValues.length) {
      if(part_num == (columnValues.length - 1)) {
        columnValuesString = columnValuesString + columnValues[part_num] + "'";
      }else {
        columnValuesString = columnValuesString + columnValues[part_num] + ",";
      }
      part_num += 1;
    }
  }

  db.transaction(function(tx) {
    var insetQuery = "INSERT INTO " + tableName + "(" + columnNamesString + ") VALUES(" + columnValuesString + ")";
    tx.executeSql(insetQuery,[],function() {
      if(callBackMethod != null && callBackParam != null) {
        callBackMethod(callBackParam);
      }else if(callBackMethod != null) {
        callBackMethod();
      }
    },function(tx,results) {
      console.error("ERROR : " + results);
    });
  });
}

function addDataToTableInBatch (tableName,arry,callBackMethod,callBackParam) {
  var queryArr = [];
  for (let i = 0; i < arry.length; i++) {
    var record = arry[i];
    var columnName = record.columnName;
    var columnValue = record.columnValue;
    var columnNames = columnName.split("~");
    var part_num = 0;
    var columnNamesString = "";
    if(columnNames.length != 1) {
      while (part_num < columnNames.length) {
        if(part_num == (columnNames.length - 1)) {
          columnNamesString = columnNamesString + columnNames[part_num];
        }else {
          columnNamesString = columnNamesString + columnNames[part_num] + ",";
        }
        part_num += 1;
      }
    }else {
      columnNamesString = columnName;
    }

    var columnValues = columnValue.split("~");
    part_num = 0;
    var columnValuesString = "'";
    if(columnValues.length != 1) {
      while (part_num < columnValues.length) {
        if(part_num == (columnValues.length - 1)) {
          columnValuesString = columnValuesString + columnValues[part_num] + "'";
        }else {
          columnValuesString = columnValuesString + columnValues[part_num] + ",";
        }
        part_num += 1;
      }
    }
    queryArr.push({
      "columnName" : columnNamesString,
      "columnValue" : columnValuesString
    });
  }

  db.transaction(function(tx) {
    var recordsFinished = 0;
    for(let i = 0; i < queryArr.length; i++) {
      var item = queryArr[i];
      var columnNameString = item.columnName;
      var columnValueString = item.columnValue;
      var insetQuery = "INSERT INTO " + tableName + "(" + columnNameString + ") VALUES(" + columnValueString + ")";
      tx.executeSql(insetQuery,[],function() {
        recordsFinished++;
        if(recordsFinished == queryArr.length) {
          if(callBackMethod != null && callBackParam != null) {
            callBackMethod(callBackParam);
          }else if(callBackMethod != null) {
            callBackMethod();
          }
        }
      },function(tx,results) {
        console.error("ERROR : " + results);
      });
    }
  });
}
export {
  initiDatabase,
  createTable,
  addDataToTable,
  addDataToTableInBatch
};

