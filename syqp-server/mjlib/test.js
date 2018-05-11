let mjlib = require( './mjlib.js' ).initTable();




function test_one_success() {
    //定义34中牌型
    var cards = [
        3, 0, 0, 3, 0, 0, 0, 0, 0, 
        3, 0, 0, 3, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0,
    ];
    console.log("测试能胡的牌型");
    if (mjlib.Hulib.get_hu_info(cards, 34,33) ){
        console.log("测试通过：胡牌")
    } else {
        console.log("测试失败：能胡的牌型判断为不能胡牌")
    }
}

function test_n3() {
    //定义34中牌型
    var cards = [
        3, 0, 0, 3, 0, 0, 0, 0, 0, 
        3, 0, 0, 3, 0, 0, 0, 0, 0,
        0, 0, 1, 0, 1, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 1,
    ];
    // print_cards(cards)
    if (mjlib.Hulib2.is3N(cards, 34,34) ){
        console.log("N3")
    } else {
        console.log("NOT N3")
    }
}

let time1=Date.now();
test_n3();
let time2=Date.now();
console.log("Time:"+(time2-time1)+'ms');