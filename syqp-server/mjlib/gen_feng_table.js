let mjlib = require( './mjlib.js' );

//如1-9万各一张，则key为111111111。
//如1万3张，9万2张，则key为300000002。

//癞子个数
let gui=3;
let Gen = module.exports

//根据是否有将、是否字牌分为4种表，每种表又根据赖子个数0-3分别建表，共12张表，具体如下：
let gui_tested = {};
let gui_jiang_tested = {};

Gen.check_add = function( cards, gui_num, jiang )  
{
    let key = 0;
    for( let i = 0; i < 7; i++ ) 
    {
        key = key * 10 + cards[ i ];
    }
    let m = null;
    if( !jiang ){
        m = gui_tested[ gui_num ];
    }else{
        m = gui_jiang_tested[ gui_num ];
    }
    let ok = m[ key ];
    if ( ok ){
        return false
    }
    m[ key ]=true;
    for(let i=0;i<7;i++){
        if(cards[i]>4){
            return true;
        } 
    }
    mjlib.TableMgr.add( key, gui_num, jiang, false );
    return true;
};

Gen.parse_table_sub = function( cards, num, jiang ) 
{
    for ( let i = 0; i < 7; i++ )
    {
        if ( cards[i] == 0 ) 
        {
             continue;
        }
        cards[i]--;
        if ( !this.check_add( cards, num, jiang ) ) 
        {
            cards[i]++;
            continue;
        }
        if ( num < gui ) 
        {
            this.parse_table_sub( cards, num+1, jiang );
        }
        cards[ i ]++;
    }
};

Gen.parse_table = function( cards, jiang ) 
{
    //不能添加就return;
    if (!this.check_add( cards, 0, jiang ) )
    {
        return;
    }
    //用癞子代替，第二个参数癞子个数
    this.parse_table_sub( cards, 1, jiang );
};

//不带将表生成
Gen.gen_no_jiang = function( cards, level, jiang ) 
{
    for ( let i = 0; i < 7; i++ )
    {
        if ( cards[ i ] > 3 ) 
        {
            continue;
        }
        cards[ i ] += 3;
        this.parse_table( cards, jiang );
        if ( level < 4 ) 
        {
            this.gen_no_jiang( cards, level + 1, jiang );
        }
        cards[i] -= 3;
    }
};

Gen.gen_table = function()
{
    let cards = [ 0,0,0,0,0,0,0];
    // 无将
    console.log("无将生成开始.");
    this.gen_no_jiang( cards, 1, false );
    console.log("无将生成结束.");
    // 有将
    console.log("有将表生成开始.");
    cards = [  0,0,0,0,0,0,0,0,0];
    for ( let i = 0; i < 7; i++ )
    {
        cards[ i ] = 2
        this.parse_table( cards, true );
        this.gen_no_jiang( cards, 1, true );
        cards[ i ] = 0;
    }
    console.log("有将表生成结束.");
    console.log("表数据存储开始.");
    mjlib.TableMgr.dumpFengTable()
    console.log("表数据存储结束.");
}

Gen.main = function()
{
    for ( let i = 0; i<=gui; i++ )
    {
        gui_tested[ i ] = {};
        gui_jiang_tested[ i ] = {};
    }
    mjlib.init();
    console.log("generate table table begin...");
    this.gen_table();
};

Gen.main();