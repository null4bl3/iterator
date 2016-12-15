// NODE JS MODULES
var express = require('express');
var app = express();
var mysql = require('mysql');
var electron = require('electron');
var remote = electron.remote;
var app = require('electron').remote;
var dialog = app.dialog;
var fs = require('fs');
var readline = require('readline');
var _ = require('underscore');
var remote = require('electron').remote;

// ANGULAR JS SETUP AND CONTROLLER
var APP = angular.module("APP", ['ngAnimate']).controller("MAIN", ['$scope', '$timeout', '$http', '$q', '$filter', function($scope, $timeout, $http, $q, $filter) {
	$scope.username = "root";
	$scope.password = "";
	$scope.database = "";
	$scope.port = 3306;
	$scope.database_list = [];
	$scope.table_list = [];
	$scope.field_list = [];
	$scope.file_field_list = [];
	$scope.data_list = [];
	$scope.data_list_deux = [];
	$scope.object_list = [];
	$scope.alert_message = {};
	$scope.credentials = true;
	$scope.connection_good = false;
	$scope.show_hide = "hide";
	$scope.db_good = false;
	$scope.inFocus = {};
	$scope.counter = 0;
	$scope.counterFile = 0;
	$scope.numberOfLines = 0;
	$scope.auto_inc = false;

// STATE VALUES

	$scope.connection = true;
	$scope.examine = false;
	$scope.insert = false;
	$scope.update = false;
	$scope.iterate = false;

	$scope.insertForm = {};
	$scope.lineInScope = "";
	$scope.allConnected = false;


	var connection = mysql.createConnection({
		host: "",
		user: "",
		password: "",
		port: 3306,
		database: ""
	});


	$scope.connect = function() {
		var defer = $q.defer();
		defer.resolve();
		defer.promise.then(function() {
			connection = mysql.createConnection({
				host: $scope.host,
				user: $scope.username,
				port: parseInt($scope.port),
				password: $scope.password,
			});
			connection.connect(function(err) {
				if (err) {
					if (err.code === "ECONNREFUSED") {
					} else {
						bad_alert("Error Connecting to Database", err.code);
						$scope.connection_good = false;
						$scope.$apply();
					}
				} else {
					good_alert("Connected to MySQL process", ' Thread id ' + connection.threadId);
					$scope.connection_good = true;
					$scope.test();
					$scope.$apply();
				}
			});
		});
	};

	$scope.test = function() {
		$scope.database_list = [];
		connection.query("SHOW DATABASES", function(err, results) {
			if (err) {
				console.log(err);
			} else {
				results.forEach(function(object) {
					$scope.database_list.push(object.Database);
				});
				$scope.$apply();
			}
		});
	};

	$scope.dbChange = function(database) {
		$scope.database = "";
		$scope.database = database;
		$scope.loadTables(database);
	};

	$scope.loadTables = function(database) {
		$scope.table_list = [];
		var defer = $q.defer();
		defer.promise.then(function() {
				connection.query("SHOW TABLES IN " + $scope.database, function(err, results) {
					if (err) {
						console.log(err);
						bad_alert("Error loading tables from Database", err.code);
						$scope.db_good = false;
						$scope.allConnected = false;
						$scope.$apply();
					} else {
						results.forEach(function(object) {
							var tmp = Object.keys(object);
							$scope.table_list.push(object[tmp[0]]);
						});
						$scope.db_good = true;
						$scope.$apply();
					}
				});
			});
		defer.resolve();
	};

	$scope.tblChange = function(table) {
		$scope.field_list = [];
		$scope.table = "";
		$scope.table = table;
		var defer = $q.defer();
		defer.promise.then(function() {
				connection = mysql.createConnection({
					host: $scope.host,
					user: $scope.username,
					password: $scope.password,
					database: $scope.database
				});
				connection.connect();
			})
			.then(function() {
				connection.query("DESCRIBE " + $scope.table, function(err, results) {
					if (err) {
						console.log(err);
						$scope.allConnected = false;
						bad_alert("Error loading table structure from Database", err.code);
						$scope.$apply();
					} else {
						$scope.file_field_list = [];
						results.forEach(function(object) {
							$scope.field_list.push(JSON.parse(JSON.stringify(object)));
							if (object.Type.indexOf("text") != -1 || object.Type.indexOf("char") != -1) {
								$scope.file_field_list.push(JSON.parse(JSON.stringify(object)));
							}
						});
						$scope.allConnected = true;
						$scope.db_good = true;
						$scope.$apply();
						$scope.getData();
					}
				});
			});
		defer.resolve();
	};

	$scope.totalLength = 0;

	$scope.getData = function() {
		$scope.data_list = [];
		var defer = $q.defer();
		defer.promise.then(function() {
			 connection.query("SELECT * FROM  " + $scope.table, function(err, results) {
					if (err) {
						bad_alert("Error loading data from Database table", err.code);
						$scope.$apply();
					} else {
						$scope.totalLength = results.length;
						$scope.counter = 0;
						results.forEach(function(object) {
							$scope.data_list.push(JSON.parse(JSON.stringify(object)));
							$scope.data_list_deux.push(JSON.parse(JSON.stringify(object)));
						});
						$scope.$apply();
					}
				});
			}).then(function(){
				$timeout(function(){
					$scope.inFocus = $scope.data_list[$scope.counter];
					if ($scope.connection) {
						$scope.handleTab(2);
					}
				}, 100);
			});
		defer.resolve();
	};





// HANDLE WHICH NAVIGATION TAB IS active

$scope.handleTab = function(which){
	switch (which) {
		case 1:
			// CONNECTION
			$('#connection').addClass('active');
			$('#examine').removeClass('active');
			$('#insert').removeClass('active');
			$('#update').removeClass('active');
			$('#iterate').removeClass('active');
			$scope.connection = true;
			$scope.examine = false;
			$scope.insert = false;
			$scope.update = false;
			$scope.iterate = false;
			break;
		case 2:
			// EXAMINE
			$('#connection').removeClass('active');
			$('#examine').addClass('active');
			$('#insert').removeClass('active');
			$('#update').removeClass('active');
			$('#iterate').removeClass('active');
			$scope.connection = false;
			$scope.examine = true;
			$scope.insert = false;
			$scope.update = false;
			$scope.iterate = false;
			if (!$scope.allConnected) {
				bad_alert("Not connected to a database", " You need to connect to a MySQL database in order to use this program. ");
			}
			break;
		case 3:
			// INSERT
			$('#connection').removeClass('active');
			$('#examine').removeClass('active');
			$('#insert').addClass('active');
			$('#update').removeClass('active');
			$('#iterate').removeClass('active');
			$scope.connection = false;
			$scope.examine = false;
			$scope.insert = true;
			$scope.update = false;
			$scope.iterate = false;
			if (!$scope.allConnected) {
				bad_alert("Not connected to a database", " You need to connect to a MySQL database in order to use this program. ");
			}
			break;
		case 4:
			// UPDATE
			$('#connection').removeClass('active');
			$('#examine').removeClass('active');
			$('#insert').removeClass('active');
			$('#update').addClass('active');
			$('#iterate').removeClass('active');
			$scope.connection = false;
			$scope.examine = false;
			$scope.insert = false;
			$scope.update = true;
			$scope.iterate = false;
			if (!$scope.allConnected) {
				bad_alert("Not connected to a database", " You need to connect to a MySQL database in order to use this program. ");
			}
			break;
		case 5:
			// ITERATE
			$('#connection').removeClass('active');
			$('#examine').removeClass('active');
			$('#insert').removeClass('active');
			$('#update').removeClass('active');
			$('#iterate').addClass('active');
			$scope.connection = false;
			$scope.examine = false;
			$scope.insert = false;
			$scope.update = false;
			$scope.iterate = true;
			if (!$scope.allConnected) {
				bad_alert("Not connected to a database", " You need to connect to a MySQL database in order to use this program. ");
			}
			break;
	}
};


// HANDLING THE INSERTION OF A NEW TABLE ROW

$scope.insertRow = function(){
	connection.query("INSERT INTO " + $scope.table + " SET ? ", $scope.insertForm, function(err, results){
		if (err) {
			console.log(err);
			bad_alert("Error inserting data into table " + $scope.table, err.code);
			$scope.$apply();
		} else {
			good_alert("Row inserted", "Row was inserted into table " + $scope.table + " with ID " + results.insertId);
			$scope.insertForm = {};
			$scope.$apply();
		}
	});
};

// WATCHING THE COUNTER VARIABLE TO USE FOR ITERATING THROUGH THE TABLE DATA

$scope.$watch('counter', function() {
	if ($scope.counter < 0) {
		$scope.counter = 0;
	} else {
		$scope.inFocus = $scope.data_list[$scope.counter];
	}
});

// FILTERING DATA ACCORDING TO PARAMETERS IN THE UPDATE TAB

$scope.filterBySearch = function(term){
	if (term === "") {
		$scope.inFocus = {};
	} else {
			$scope.inFocus = $filter('filter')($scope.data_list, { tmp : term })[0];
	}
};

// SELECTING A FILE TO ITERATE THROUGH

$scope.selectedFile = 'No file selected';

$scope.fileSelect = function(){
	dialog.showOpenDialog(function (fileName) {
       if (fileName === undefined) {
          console.log('"No file selected"');
       }else{
				 	$scope.selectedFile = fileName[0];
         	readFile(fileName[0]);
					$scope.$apply();
					getLine($scope.selectedFile, $scope.counterFile, function(err, line){
						$scope.lineInScope = line;
						$scope.$apply();
					});
       }
  });
};

// WATCHING THE COUNTER VARIABLE TO USE FOR ITERATING THROUGH THE DATA

$scope.$watch('counterFile', function() {
	if ($scope.counterFile < 0) {
		$scope.counterFile = 0;
	} else {
		getLine($scope.selectedFile, $scope.counterFile, function(err, line){
		$scope.lineInScope = line;
		$scope.$apply();
	});
}
});

// INSERT TEXT LINE FROM SELECTED FILE AS ROW IN DATABASES

$scope.insertLineAsRow = function(){
	console.log("INSERT INTO " + $scope.table + " SET " + $scope.fileField.Field + " = " + connection.escape($scope.lineInScope));
	connection.query("INSERT INTO " + $scope.table + " SET " + $scope.fileField.Field + " = " + connection.escape($scope.lineInScope), function(err, results){
		if (err) {
			console.log(err);
			alert(err);
		} else {
			good_alert("Line Inserted !");
			if ($scope.auto_inc) {
				$scope.counterFile++;
			}
			$scope.$apply();
			$scope.getData();
		}
	});
};

// ENDING THE CONNECTION

$scope.endConnection = function(){
	$scope.connection_good = false;
	$scope.connection = true;
	$scope.examine = false;
	$scope.insert = false;
	$scope.update = false;
	$scope.iterate = false;
	$scope.allConnected = false;
	$scope.database_list = [];
	$scope.database = "";
	$scope.table = "";
	$scope.table_list = [];
	bad_alert("Connection Closed ! ", ".");
	$scope.$apply();
	connection.destroy();
};


// HANDLING THE CHOICE OF USER OPTIONS TO DELETE OR UPDATE A TABLE ROW

$scope.idField = "";
$scope.setID = function(){
	$scope.idField = "";
	$scope.idField = $scope.iterate_table_identifier.Field;
};

// HANDLING THE CHOICE OF USER OPTIONS TO DELETE OR UPDATE A TABLE ROW

$scope.setIDForFile = function(){
	$scope.idFileField = "";
	$scope.idFileField = $scope.fileField.Field;
};

// DELETE A TABLE ROW

$scope.deleteARow = function(){
		connection.query("DELETE FROM " + $scope.table + " WHERE " + $scope.idField + " = " + $scope.inFocus[$scope.idField], function(err, results){
			if (err) {
				console.log(err);
				bad_alert("Error data from table " + $scope.table, err.code);
				$scope.$apply();
			} else {
				console.log(results);
				good_alert("Row was deleted from table " + $scope.table, "DELETE FROM " + $scope.table + " WHERE " + $scope.idField + " = " + $scope.inFocus[$scope.idField]);
				$scope.getData();
				$scope.$apply();
			}
		});
};

// UPDATE A TABLE ROW

$scope.updateRow = function(){
	var defer = $q.defer();
	defer.promise.then(function(){
		var tmpObj = _.omit($scope.inFocus, $scope.idField);
		var unknown = connection.escape($scope.inFocus[$scope.idField]);
		var query = connection.query("UPDATE "+ $scope.database + "." + $scope.table + " SET ? WHERE " + $scope.idField + "=? ", [tmpObj, unknown], function(err, results){
			console.log(query.sql);
			if (err) {
				console.log(err);
				bad_alert("Error updating values in table " + $scope.table, err.code);
				$scope.$apply();
			} else {
				console.log(results);
				$scope.getData();
				good_alert("The row was update ", "UPDATE "+ $scope.database + "." + $scope.table + " SET ? WHERE " + $scope.idField + "=? ", [tmpObj, unknown]);
				$scope.$apply();
			}
		});
	});
	defer.resolve();
};



// NODE FUNCTIONS FOR FILE HANDLING

function getLine(filename, lineNumber, callback) {
    var stream = fs.createReadStream(filename, {
      flags: 'r',
      encoding: 'utf-8',
      fd: null,
      mode: 0666,
      bufferSize: 64 * 1024
    });
    var fileData = '';
    stream.on('data', function(data){
      fileData += data;
      var lines = fileData.split("\n");
			$scope.numberOfLines = lines.length;
      if(lines.length >= +lineNumber){
        stream.destroy();
        callback(null, lines[+lineNumber]);
      }
    });
    stream.on('error', function(){
      callback('Error', null);
    });
    stream.on('end', function(){
      callback('File end reached without finding line', null);
    });

}


function readFile(filepath){
    fs.readFile(filepath, 'utf-8', function (err, data) {
          if(err){
            alert("Unable to open file. " + err.message);
            return;
          	} else {
						console.log(typeof data);
          }
    });
}


// -----------------------------------------------------------------------  //
//													CUSTOM FUNCTIONALITY
// -----------------------------------------------------------------------  //



// BAD ALERT

	var bad_alert = function(title, message) {
		$scope.alert_good = false;
		$scope.alert_message = {
			title: title,
			message: message
		};
		$scope.alert_bad = true;
		$timeout(function() {
			$scope.alert_message = "";
			$scope.alert_bad = false;
		}, 5000);
	};

// GOOD ALERT

	var good_alert = function(title, message) {
		$scope.alert_bad = false;
		$scope.alert_message = {
			title: title,
			message: message
		};
		$scope.alert_good = true;
		$timeout(function() {
			$scope.alert_message = "";
			$scope.alert_good = false;
		}, 5000);
	};

$scope.exitProgram = function(){
	var window = remote.getCurrentWindow();
   window.close();
};

$scope.about = function(){
	alert("ITERATOR - 2016. The simple MySQL file and table iterator. - null4bl3 --> https://github.com/null4bl3");
};

}]);
