let mjlib = require( './mjlib.js' );


function init(){
    mjlib.init();
    mjlib.TableMgr.loadTable();
    mjlib.TableMgr.loadFengTable();
}

init();

function test_one_success() {
    //定义34中牌型
    var cards = [
        1, 0, 0, 1, 0, 0, 1, 0, 0, 
        1, 0, 0, 1, 0, 0, 0, 1, 0,
        1, 0, 0, 1, 0, 0, 0, 0, 1,
        0, 1, 0, 1, 1, 1, 1,
    ];

    //筒  万 条 
    //混儿  1张 2筒
    console.log("测试能胡的牌型");
    // print_cards(cards)
    if (mjlib.Hulib.get_hu_info(cards, 34, 34) ){
        console.log("测试通过：胡牌")
    } else {
        console.log("测试失败：能胡的牌型判断为不能胡牌")
    }
}

let time1=Date.now();
test_one_success();
let time2=Date.now();
console.log("Time:"+(time2-time1)+'ms');