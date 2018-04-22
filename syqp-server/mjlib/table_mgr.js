"use strict";

let Table = require( './table.js' );

let TableMgr = module.exports;

TableMgr.m_tbl = {};
TableMgr.m_jiang_tbl = {};
TableMgr.m_feng_tbl = {};
TableMgr.m_feng_jiang_tbl = {};

TableMgr.init = function()
{
    for ( let i =0; i < 4; i++ )
    {
        this.m_tbl[ i ] = new Table();
        this.m_tbl[ i ].init();
    }

    for ( let i =0; i < 4; i++ )
    {
        this.m_jiang_tbl[ i ] = new Table();
        this.m_jiang_tbl[ i ].init();
    }

    for ( let i =0; i < 4; i++ )
    {
        this.m_feng_tbl[ i ] = new Table();
        this.m_feng_tbl[ i ].init();
    }

    for ( let i =0; i < 4; i++ )
    {
        this.m_feng_jiang_tbl[ i ] = new Table();
        this.m_feng_jiang_tbl[ i ].init();
    }
};

TableMgr.getTable = function( gui_num, jiang, chi )
{

    let tbl = null;
    if ( chi ) 
    {
        if ( jiang ) 
        {
            tbl = this.m_jiang_tbl[ gui_num ];
        }else{
             tbl = this.m_tbl[ gui_num ];
        }
    } 
    else 
    {
      
        if ( jiang ) 
        {
            tbl = this.m_feng_jiang_tbl[ gui_num ];
        }else{
            tbl = this.m_feng_tbl[ gui_num ];
        }
    }
    return tbl;
};

TableMgr.add = function( key, gui_num, jiang, chi) 
{
    let tbl = this.getTable( gui_num, jiang, chi );
    if( tbl )
    {
        tbl.add( key );
    }
};

TableMgr.check = function( key, gui_num, jiang, chi ) 
{
    let tbl = this.getTable( gui_num, jiang, chi );

    if( !tbl ) return false;
    
    return tbl.check( key );
};

TableMgr.loadTable = function()
{
    for( let i = 0; i < 4; i ++ )
    {
        let name = "table_%d.tbl".replace( '%d', i );
        this.m_tbl[ i ].load( name );
       // console.log("加载文件["+name+"]Size="+this.m_tbl[i].length);
    }

    for( let i = 0; i < 4; i ++ )
    {
        let name = "jiang_table_%d.tbl".replace( '%d', i );
        this.m_jiang_tbl[ i ].load( name );
        //console.log("加载文件["+name+"]Size="+this.m_tbl[i].length);
    }
};

TableMgr.dumpTable = function() 
{
    for ( let i = 0; i < 4; i++ )
    {
        let name = "table_%d.tbl".replace( '%d', i );
        this.m_tbl[ i ].dump( name );
    }
    for ( let i = 0; i < 4; i++ )
    {
        let name = "jiang_table_%d.tbl".replace( '%d', i );
        this.m_jiang_tbl[ i ].dump( name );
    }
};

TableMgr.loadFengTable=function()
{
    for(let i=0; i< 4; i++){
        let name = "feng_table_%d.tbl".replace( '%d', i );
        this.m_feng_tbl[i].load(name);
    }
     for ( let i = 0; i < 4; i++ )
    {
        let name = "feng_jiang_table_%d.tbl".replace( '%d', i );
        this.m_feng_jiang_tbl[ i ].load( name );
    }
}

TableMgr.dumpFengTable = function() 
{
    for ( let i = 0; i < 4; i++ )
    {
        let name = "feng_table_%d.tbl".replace( '%d', i );
        this.m_feng_tbl[ i ].dump( name );
    }
    for ( let i = 0; i < 4; i++ )
    {
        let name = "feng_jiang_table_%d.tbl".replace( '%d', i );
        this.m_feng_jiang_tbl[ i ].dump( name );
    }
};