module.exports.TableMgr = require( './table_mgr.js' );
module.exports.Hulib = require( './hulib.js' );


module.exports.init = function()
{
	console.log("init table manager start.");
    this.TableMgr.init();
    console.log("init table manager end.");
};

module.exports.initTable = function()
{
    this.TableMgr.loadTable();
    this.TableMgr.loadFengTable();
};