// ==UserScript==
// @name         wxstatics
// @namespace    https://mountainguan.tech/
// @version      0.1
// @description  基于微信web版接口实现的联系人简单信息统计插件
// @author       mountainguan
// @match        https://wx.qq.com/*
// @grant        GM_addStyle
// @require      http://echarts.baidu.com/gallery/vendors/echarts/echarts.min.js
// ==/UserScript==

GM_addStyle(".statusBtn { margin:10px ;position:absolute; right: 0px; top: 0px;-moz-box-shadow: 0px 0px 14px 0px #3dc21b;-webkit-box-shadow: 0px 0px 14px 0px #3dc21b;box-shadow: 0px 0px 14px 0px #3dc21b;background-color:#44c767;-moz-border-radius:28px;-webkit-border-radius:28px;border-radius:28px;border:1px solid #18ab29;display:inline-block;cursor:pointer;color:#ffffff;font-family:Arial;font-size:12px;padding:5px 31px;text-decoration:none;} .statusBtn:hover {background-color:#5cbf2a;} .statusBtn:active {top:1px;} ");
GM_addStyle(".charts-container{ z-index:2048;border:2px solid #d0d0d0;border-radius:25px;position:absolute; right: 0px; top: 0px;height: 80%;width: 88%; background-color:white;padding:5% } .charts-pos{margin-top:5% ;margin-right:1% ;}");

var global_data = "";

var statusbtn=$("<input type='button' id='statusBtn' value='联系人统计' class='statusBtn'>");
var container=$("<div class='charts-container charts-pos'><div id='container' style='height: 33%'></div><div id='container2' style='height: 33%'></div><div id='container3' style='height: 33%'></div></div>");
$("body").append(statusbtn);//初始化控件按钮
$("body").append(container);//初始化echart图表容器


(function() {
    'use strict';
    getData();
    if(global_data.length !== 0){
        setTimeout("location.reload();",10000);
    }
    $('#statusBtn').click(function(){
        generateSexChart(global_data);
        generateProvinceChart(global_data);
        generateCityChart(global_data);
        $('.charts-container').toggle();
    });
    $('.charts-container').hide();
})();


function getData() {
    var people = [];
    var province = [];
    var city = [];
    var sex = [];
    $.get("https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxgetcontact",function(data){
        data = JSON.parse(data);
        $.each(data.MemberList,function(){
            if( this.Sex != 0) { //性别为0的都是公众号或者自带的微信工具
                //people.push(this);
                var sexName;
                if(this.Sex == 1) {
                    sexName = "男";
                } else {
                    sexName = "女";
                }

                if(sex.hasOwnProperty(sexName)){
                    sex[sexName] += 1;
                } else {
                    sex[sexName] = 1;
                }

                if(!this.Province) this.Province = "空";
                if(province.hasOwnProperty(this.Province)){
                    province[this.Province] += 1;
                } else {
                    province[this.Province] = 1;
                }

                if(!this.City) this.City = "空";
                if(city.hasOwnProperty(this.City)){
                    city[this.City] += 1;
                } else {
                    city[this.City] = 1;
                }
            }
        });
        //console.log({"sex":sex,"province":province,"city":city});
        global_data = {"sex":sex,"province":province,"city":city};
        //console.log(data);
    });
}

function sortNumber(a,b) {
    return a.value - b.value;
}

function generateSexChart(data) {
    var contain = $("#container")[0];
    var myChart = echarts.init(contain);
    var app = {};

    var keys = [];
    var items = [];

    option = null;
    app.title = '微信好友男女比例统计';

    for (var key in data.sex) {
        items.push({name:key,value:data.sex[key]});
    }

    items = items.sort(sortNumber).reverse();//倒叙排列

    option = {
        title:{
            x:'center',
            y:'bottom',
            text:"微信好友男女比例统计",
        },
        backgroundColor: 'white',
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:items
        },
        series: [
            {
                name:'男女比例统计',
                type:'pie',
                selectedMode: 'single',
                radius: [0, '60%'],

                label: {
                    normal: {
                        position: 'inner'
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data:items
            }
        ]
    };
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
        setTimeout(function (){
            myChart.resize();
        },200);
    }
}

function generateCityChart(data) {
    var contain = $("#container3")[0];
    var myChart = echarts.init(contain);
    var app = {};

    var keys = [];
    var items = [];
    var tops10 = [];
    var tops = [];

    option = null;
    app.title = '微信好友所在城市统计';

    for (var key in data.city) {
        items.push({name:key,value:data.city[key]});
    }

    items = items.sort(sortNumber).reverse();//倒叙排列
    console.log(items);

    for (var index in items) {
        if(index < 3) {
            tops.push(items[index]);
        }
        if(index < 10) {
            keys.push(items[index].name);
            tops10.push(items[index]);
        }
    }

    option = {
        title:{
            x:'center',
            y:'bottom',
            text:"微信好友城市统计",
        },
        backgroundColor: 'white',
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:keys
        },
        series: [
            {
                name:'城市统计',
                type:'pie',
                selectedMode: 'single',
                radius: [0, '30%'],

                label: {
                    normal: {
                        position: 'inner'
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data:tops
            },
            {
                name:'城市统计',
                type:'pie',
                radius: ['40%', '55%'],
                label: {
                    normal: {
                        formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                        backgroundColor: '#eee',
                        borderColor: '#aaa',
                        borderWidth: 1,
                        borderRadius: 4,
                        rich: {
                            a: {
                                color: '#999',
                                lineHeight: 22,
                                align: 'center'
                            },
                            hr: {
                                borderColor: '#aaa',
                                width: '100%',
                                borderWidth: 0.5,
                                height: 0
                            },
                            b: {
                                fontSize: 16,
                                lineHeight: 33
                            },
                            per: {
                                color: '#eee',
                                backgroundColor: '#334455',
                                padding: [2, 4],
                                borderRadius: 2
                            }
                        }
                    }
                },
                data:tops10
            }
        ]
    };
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
        setTimeout(function (){
            myChart.resize();
        },200);
    }
}

function generateProvinceChart(data) {
    var contain = $("#container2")[0];
    var myChart = echarts.init(contain);
    var app = {};

    var keys = [];
    var items = [];
    var tops10 = [];
    var tops = [];

    option = null;
    app.title = '微信好友省份统计';

    for (var key in data.province) {
        items.push({name:key,value:data.province[key]});
    }

    items = items.sort(sortNumber).reverse();//倒叙排列
    console.log(items);

    for (var index in items) {
        if(index < 3) {
            tops.push(items[index]);
        }
        if(index < 10) {
            keys.push(items[index].name);
            tops10.push(items[index]);
        }
    }

    option = {
        title:{
            x:'center',
            y:'bottom',
            text:"微信好友省份统计",
        },
        backgroundColor: 'white',
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            x: 'left',
            data:keys
        },
        series: [
            {
                name:'省份统计',
                type:'pie',
                selectedMode: 'single',
                radius: [0, '30%'],

                label: {
                    normal: {
                        position: 'inner'
                    }
                },
                labelLine: {
                    normal: {
                        show: false
                    }
                },
                data:tops
            },
            {
                name:'省份统计',
                type:'pie',
                radius: ['40%', '55%'],
                label: {
                    normal: {
                        formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                        backgroundColor: '#eee',
                        borderColor: '#aaa',
                        borderWidth: 1,
                        borderRadius: 4,
                        rich: {
                            a: {
                                color: '#999',
                                lineHeight: 22,
                                align: 'center'
                            },
                            hr: {
                                borderColor: '#aaa',
                                width: '100%',
                                borderWidth: 0.5,
                                height: 0
                            },
                            b: {
                                fontSize: 16,
                                lineHeight: 33
                            },
                            per: {
                                color: '#eee',
                                backgroundColor: '#334455',
                                padding: [2, 4],
                                borderRadius: 2
                            }
                        }
                    }
                },
                data:tops10
            }
        ]
    };
    if (option && typeof option === "object") {
        myChart.setOption(option, true);
        setTimeout(function (){
            myChart.resize();
        },200);
    }
}
