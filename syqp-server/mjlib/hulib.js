
let HuLib = module.exports;
let TableMgr = require( './table_mgr.js' );

//1-9万，1-9条，1-9筒，7个风，一共34种
const MAX_CARD = 34;
const BAI_BANG_INDEX=33;
// let ProbabilityItem = { };
let Probability = { };

function _init()
{
    //需要初始化多个对象
    Probability = { array_num : 0, m_num : [ 0, 0, 0, 0 ], m : [] };
    //万，条，筒，风4个种类
    for( let i = 0; i < 4; i ++ )
    {
        Probability.m[ i ] = [];
        //牌型情况，没鬼，1个鬼，2个鬼，3个鬼
        for( let j = 0; j < 4; j ++ )
        {
            var  item = { jiang : false, gui_num : 0 };
            Probability.m[ i ].push( item );
        }
    }
}
                                                                                                                                                                                                                                           
HuLib.get_hu_info = function( cards, cur_card,gui_1)
{
    _init();

    //返回当前数组的副本
    let tmp_cards = cards.concat();
    if ( cur_card != MAX_CARD )
    {
        tmp_cards[ cur_card ] += 1;
    }

    let gui_num = 0;
    if( gui_1 != MAX_CARD )
    {
        gui_num += tmp_cards[ gui_1 ];
        tmp_cards[ gui_1 ] = 0;
    }

    /*
    let count=0;
    tmp_cards.forEach(card =>{count += card;});
    if(count+gui_num==14){
        //7対
        if(this.check_7dui(tmp_cards,gui_num)){
            return true;
        }
        //13幺
        if(this.check_13yao(tmp_cards,gui_num)){
            return true;
        }
    }

    */
    //松阳麻将特别规则，如果不是13幺，白板可以代替财神的牌
    tmp_cards[ gui_1 ] = tmp_cards[ BAI_BANG_INDEX ];
    if(gui_1!=BAI_BANG_INDEX){
        tmp_cards[BAI_BANG_INDEX]=0;
    }
    

    if (!this._split( tmp_cards, gui_num, Probability ) )
    {
        return false;
    }
    //console.log(JSON.stringify(Probability));
    return this.check_probability( Probability, gui_num );
};

HuLib.check_7dui = function( cards, gui_num )
{
    let need = 0;
    for( let i = 0; i < 34; i++ )
    {
        if ( cards[ i ] % 2 != 0 )
        {
            need += 1;
        }
    }
    return need > gui_num ? false : true;
};

HuLib.check_13yao = function( cards, gui_num )
{

    let need = 0;
    for( let i = 0; i < 34; i++ )
    {
        if ( cards[ i ] > 1 )
        {
            return false;
        }
    }

    function check_13yao_sub(cards){
        let offset=cards.findIndex(val=>val>0);
        for(let i=offset+1;i<cards.length;i++){
            if(cards[i]>0){
                if(i-offset<=2){
                    return false;
                }
                offset=i;
            }
        }
        return true;
    }

    if(!check_13yao_sub(cards.slice(0,9))){
        return false;
    }
    if(!check_13yao_sub(cards.slice(9,18))){
        return false;
    }
    if(!check_13yao_sub(cards.slice(18,27))){
        return false;
    }
    return true;
};


HuLib.check_probability = function( ptbl, gui_num )
{
    // 全是鬼牌
    if( ptbl.array_num == 0 )
    {
        return gui_num >= 2;
    }
    // 只有一种花色的牌的鬼牌
    if ( ptbl.array_num == 1 )
    { 
        return true;
    }
    // 尝试组合花色，能组合则胡
    for ( let i = 0; i < ptbl.m_num[ 0 ]; i++ )
    {
        let item = ptbl.m[0][i];
        let jiang = item.jiang;
        let gui = gui_num - item.gui_num;
        if ( this.check_probability_sub( ptbl, jiang, gui, 1, ptbl.array_num ) )
        {
            return true;
        }
    }

    return false;
};

HuLib.check_probability_sub = function( ptbl, jiang, gui_num, level, max_level )
{
    for ( let i = 0; i < ptbl.m_num[ level ]; i++ )
    {
        let item = ptbl.m[ level ][ i ];
        if ( jiang && item.jiang )
        {
            continue;
        }
        if ( gui_num < item.gui_num )
        {
            continue;
        }
        if ( level < max_level - 1 )
        {
            if ( this.check_probability_sub( ptbl, jiang || item.jiang, gui_num - item.gui_num, level + 1, ptbl.array_num ) )
            {
                return true;
            }
            continue;
        }
        //如果没有将，并且剩余的鬼小于2个，就不能胡，（一般麻将正常应该剩余的鬼再好等于2个才能胡，不然肯定是老千）
        if ( !jiang && !item.jiang && item.gui_num + 2 > gui_num )
        {
            continue;
        }
        return true;
    }
    return  false;
};

HuLib._split = function( cards, gui_num, ptbl )
{
    if ( !this._split_color( cards, gui_num, 0, 0, 8, true, ptbl ) )
    {
        return false;
    }
    if ( !this._split_color( cards, gui_num, 1, 9, 17, true, ptbl ) )
    {
        return false;
    }
    if ( !this._split_color(cards, gui_num, 2, 18, 26, true, ptbl ) )
    {
        return false;
    }
    if ( !this._split_color(cards, gui_num, 3, 27, 33, false, ptbl ) )
    {
        return false;
    }
    return true;
}

HuLib._split_color = function( cards, gui_num, color, min, max, chi, ptbl )
{

    let key = 0;
    let num = 0;
    for( let i = min; i <= max; i++ )
    {
        key = key * 10 + cards[ i ];
        num = num + cards[ i ];
    }
    if ( num === 0 )
    {
        return true;
    }
    if (!this.list_probability( color, gui_num, num, key, chi, ptbl ) )
    {
        return false;
    }
    return true;
};

HuLib.list_probability = function( color, gui_num, num, key, chi, ptbl )
{
    let find = false
    let anum = ptbl.array_num;

    for ( let i = 0; i <= gui_num; i++ )
    {
        let jiang = false;
        let yu = ( num + i ) % 3;
        if ( yu == 1 )
        {
            continue;
        }
        else if( yu == 2 )
        {
            jiang = true;
        }
        if ( find || TableMgr.check( key, i, jiang, chi ) )
        {
            let item = ptbl.m[ anum ][ ptbl.m_num[ anum ] ];
            ptbl.m_num[ anum ]++;
            item.jiang = jiang;
            item.gui_num = i;
            find = true
        }
    }


    if( ptbl.m_num[ anum ] <= 0 )
    {
        return false;
    }

    ptbl.array_num++;


    return true;
};
