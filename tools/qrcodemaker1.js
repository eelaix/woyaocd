/**
 * 这是用来生成C型小程序码(放射型，无限量)的工具程序
 * 生成工具前，小程序必需先上线，腾讯生成工具会检查page是否有效
 * 程序使用方法：
 * 将tools目录移至其他文件夹（因为不是小程序的一部份）
 * 先安装node, 通过终端(DOS)进入该文件夹并运行：
 * npm install --legacy-bundling
 * node qrcodemaker1.js
 * node qrcodemaker2.js
 * B型二维码，{'path':'xmain/evcar?chgid=100120','width':430} 参数名可变，统一取名为chgid
 * C型二维码，{'scene':'162','page':'xmain/biker','width':430} 参数名字只能为scene
 *
 * 生成的图片文件给到小牛公司，我公司会将二维码与设备一同组装出厂出货。
 */
const fs = require('fs');
const request = require('request');
const wxappid = '';       //你的微信小程序APPID
const wxappsecret = '';   //你的微信小程序APPSECRET
const pc_pathbk = 'D://'; //输出图片的保存位置
var pc_thechargerid = 100;  //要生成的二维码起始编号
var pc_lastchargerid = 102; //要生成的二维码结束编号
const wxapi_qrcreate = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=';
const wxapi_credial = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=';
var pc_postbody = {'scene':'0','page':'xmain/biker','width':430};
var pc_options = { url: '', body: pc_postbody, method: 'POST', json: true, headers: { 'content-type': 'application/json' } };
var pc_downloadqrcode = function () {
    var credialurl = wxapi_credial + wxappid + '&secret=' + wxappsecret;
    request(credialurl, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            var jsonbody = JSON.parse(data);
            var token = jsonbody.access_token;
            pc_options.url = wxapi_qrcreate + token;
            pc_downloadimage();
        }
    });
};
var pc_downloadimage = function () {
    pc_postbody.scene = pc_thechargerid + '';
    pc_options.body = pc_postbody;
    var imgfile = pc_pathbk + pc_thechargerid + '.jpg';
    console.log('正在生成二维码：', imgfile);
    request(pc_options).pipe(fs.createWriteStream(imgfile))
        .on('close', function () {
            pc_thechargerid = pc_thechargerid + 1;
            if (pc_thechargerid < pc_lastchargerid) {
                pc_downloadimage();
            }
        });
};
pc_downloadqrcode();