const converter = require("node-m3u8-to-mp4");
const  mkdirp=require('mkdirp')
const  fs=require('fs')
//日志
const logger = require("./bin/logHelper").helper;
//流程控制
const async = require("async");
var Sequelize = require('sequelize');
const data_db= new Sequelize(
    "myurl",
    "root",
    "Root!!2018",{
        dialect:'mysql',
        host:'47.105.36.188',
        port:3306
    }
);
start()
function start() {
    //data for bin/data.json
    data_db.query("select * from video where g ='0'").then(function (q) {
        down(q[0])
    });
}
function down(list){
    //控制最大并发数为5，
    async.forEachLimit(list,1,function (item2, callback2) {
            setTimeout(function(){
                fetchPageInfo(item2, (err) => {callback2()});
            }, 2000);
        },function (err) {
            if (err) {
                logger.writeErr(err);
                cb(err);
            } else {
                cb();
            }
        }
    );
}
function fetchPageInfo(item,cb){
    var path=""
    if(item.b=="合集"){
        var title=item.d.split("__");
        if(typeof title=="object"&&title.length>1){
            path="output/"+item.b+"/"+item.c+"/"+title[0]+"/"+title[1]+".mp4"
            mkdir("output/"+item.b+"/"+item.c+"/"+title[0])
        }else{
            mkdir("output/"+item.b+"/"+item.c)
            path="output/"+item.b+"/"+item.c+"/"+title+".mp4"
        }
        converter(item.f,path).then(() => {
            cb()
        });
    }else{
        path="output/"+item.b+"/"+item.c+"/"+item.d+".mp4"
        mkdir("output/"+item.b+"/"+item.c)
    }
    converter(item.f,path).then(() => {
        cb()
    });

}

/**
 * 创建目录
 */
function mkdir(title) {

    console.log('准备创建目录：%s', title);
    if (fs.existsSync(title)) {
        console.log('目录：%s 已经存在'.error, title);

    }else {
        mkdirp(title, function (err) {
            console.log('title目录：%s 创建成功'.info, title);
        });
    }
}

