"use strict";

const fs = require( 'fs' );

var TABLE = function()
{
    this.tbl = {};
};

TABLE.prototype.init = function()
{
    this.tbl = {};
};

TABLE.prototype.check = function( key )
{
    return this.tbl[ key ] ? true : false;
};


TABLE.prototype.size = function( )
{
    return Object.keys(this.tbl).length;
};

TABLE.prototype.add = function( key ) 
{
    this.tbl[ key ] = 1;
};

//创建牌型文件
TABLE.prototype.dump = function( name )
{
    if(!fs.existsSync('./tbl')){
        fs.mkdirSync('./tbl');
    }
    var fWrite = fs.createWriteStream(__dirname + '/tbl/' + name);  
    var  c=0;
    for(let  p  in  this.tbl){
        fWrite.write(p);
        fWrite.write('\n');
        c++;
    }
    fWrite.end();
    console.log("Dump File,FileName="+name+";length="+c);
};

//加载牌型
TABLE.prototype.load = function( name )
{
    if( !fs.existsSync( __dirname + '/tbl/' + name ) )
    {
        console.log( "文件"+name+"不存在" );
        return;
    }
    let  c=0;
    const d = fs.readFileSync( __dirname + '/tbl/' + name );
    const n = String( d ).split( '\n' );
    for( let i = 0; i < n.length; i ++ )
    {
        if( n[ i ] )
        {
            this.tbl[ n[ i ] ] = 1;
            c++;
        }
    }
};


module.exports = TABLE;