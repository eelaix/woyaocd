/**
 * 这是用来生成C型小程序码(普通型，限量10万)的工具程序
 * 使用工具前，小程序必需先上线，腾讯生成工具会检查page是否有效
 * 程序使用方法：
 * 将tools目录移至其他文件夹（因为不是小程序的一部份）
 * 先安装node, 通过终端(DOS)进入该文件夹并运行：
 * npm install --legacy-bundling
 * node qrcodemaker1.js
 * B型二维码，{'scene':'162','page':'xmain/biker','width':430} 参数名字只能为scene
 * node qrcodemaker2.js
 * C型二维码，{'path':'xmain/evcar?chgid=100120','width':430} 参数名可变，统一取名为chgid
 *
 * 生成的图片文件给到小牛公司，我公司会将二维码与设备一同组装出厂出货。
 * 重要提示：生成二维码以后请在充电小程序电桩详情页（充电页）点击右上解扫码按钮扫码一次。
 */
const fs = require('fs');
const request = require('request');
const wxappid = '';       //你的微信小程序APPID
const wxappsecret = '';   //你的微信小程序APPSECRET
const savepath = 'D://';  //输出图片的保存位置
var thechargerid = 100120;  //要生成的二维码起始编号
var lastchargerid = 100123; //要生成的二维码结束编号
const wxapi_qrcreate = 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=';
const wxapi_credial = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=';
var postbody = {'path':'xmain/evcar?chgid=100120','width':430};
var options = { url: '', body: postbody, method: 'POST', json: true, headers: { 'content-type': 'application/json' } };
var downloadqrcode = function () {
    var credialurl = wxapi_credial + wxappid + '&secret=' + wxappsecret;
    request(credialurl, function (error, response, data) {
        if (!error && response.statusCode == 200) {
            var jsonbody = JSON.parse(data);
            var token = jsonbody.access_token;
            options.url = wxapi_qrcreate + token;
            downloadimage();
        }
    });
};
var downloadimage = function () {
    postbody.path = 'xmain/evcar?chgid=' + thechargerid;
    options.body = postbody;
    var imgfile = savepath + thechargerid + '.jpg';
    console.log('正在生成二维码：', imgfile);
    request(options).pipe(fs.createWriteStream(imgfile))
        .on('close', function () {
            thechargerid = thechargerid + 1;
            if (thechargerid < lastchargerid) {
                downloadimage();
            }
        });
};
downloadqrcode();