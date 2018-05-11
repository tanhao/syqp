module.exports.TableMgr = require( './table_mgr.js' );
module.exports.Hulib = require( './hulib.js' );
//用来判断是否成连子
module.exports.Hulib2 = require( './hulib2.js' );


module.exports.init = function()
{
	console.log("init table manager start.");
    this.TableMgr.init();
    console.log("init table manager end.");
};

module.exports.initTable = function()
{
    this.TableMgr.init();
    this.TableMgr.loadTable();
    this.TableMgr.loadFengTable();
    return this;
};