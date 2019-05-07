// const converter = require("node-m3u8-to-mp4");
var m3u8ToMp4 = require("m3u8-to-mp4");
var converter = new m3u8ToMp4();

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
    data_db.query("Select * from video where g ='0' and  b='合集'").then(function (q) {
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
function fetchPageInfo(item,cb){``
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
    }else{
        path="output/"+item.b+"/"+item.c+"/"+item.d+".mp4"
        mkdir("output/"+item.b+"/"+item.c)
    }

    // converter(item.f,path).then(() => {
    //     data_db.query("update video set g ='1' where  g ='0'").then(function (q) {
    //         cb()
    //     });
    //
    // });
    //
     data_db.query("select count(1) num  from video where f='"+item.f+"'  and g ='0'").then(function (q) {
        //是否下载
        if(q[0][0].num>0){
            //更新为下载中
            data_db.query("update video set g ='2' where f='"+item.f+"' and g ='0'").then(function (q) {
                converter
                    .setInputFile(item.f)
                    .setOutputFile(path)
                    .start()
                    .then(() => {
                    //更新为已完成
                    data_db.query("update video set g ='1' where f='"+item.f+"' and g ='0'").then(function (q) {
                    cb()
                    });
                });

        });
        }else{
            cb()
        }

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

