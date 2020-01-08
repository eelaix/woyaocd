var app = getApp();
var LatLon = require('./latlon');
var xnplugin = requirePlugin("xnplugin");
var scaleWRate = 0;
var scaleHRate = 0;
var mapCtx = false;
var regionchanging = false;
var routeapi = 'https://apis.map.qq.com/ws/direction/v1/';
var linecolors = ['#FF0000', '#00FF00', '#0000FF'];
var mylocationlat = 22.549357;  //首次设置后不再变化
var mylocationlng = 114.066187;
var firstlocated = false; //首次定位结束
var screenH = 375;

function compareVersion(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    var len = Math.max(v1.length, v2.length);
    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }
    for (var i = 0; i < len; i++) {
        var num1 = parseInt(v1[i]);
        var num2 = parseInt(v2[i]);
        if (num1 > num2) {
            return 1;
        } else if (num1 < num2) {
            return -1;
        }
    }
    return 0;
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        mapsubkey: 'OKUBZ-2XLH4-R4MU6-XBRKH-IWF4S-GQFS5',
        showsiteid: 0,
        markers: [],
        chargers: [],
        chargerfontsize: 12,
        mapScale: 16,
        feecard: 0,
        centerlat: 22.549357,
        centerlng: 114.066187,
        btypes: ['primary', 'default', 'warn'],
        showroute: 0, //0=不显示,1显示
        routetype: 0, //driving=0, walking=1, bicycling=2
        routetyps: ['driving', 'walking', 'bicycling'],
        routelb0: '驾车路线',
        routelb1: '步行路线',
        routelb2: '骑行路线',
        errormsg: false,
        polylines: []
    },

    loadchargers: function (leftlng, rightlng, botlat, toplat) {
        var that = this;
        var callback = function (chargers) {
            if (typeof(chargers)=='number'){
                var errmsg = '未知错误';
                if (chargers==0){
                    errmsg = '手机网络不通，请检查。';
                } else if (chargers==1){
                    errmsg = '异常请求，未通过微信访问。';
                } else if (chargers==2){
                    errmsg = '非法访问，无效的访问参数。';
                } else if (chargers<500){
                    errmsg = '访问错误，请稍后重试。'+chargers;
                } else {
                    errmsg = '网络不通，请退出微信重试。'+chargers;
                }
                that.setData({ errormsg: errmsg});
            }else{
                var lmarkers = that.data.markers;
                lmarkers.length = 0;
                if (chargers && chargers.length > 0) {
                    for (var i = 0; i < chargers.length; i++) {
                        var marker = {};
                        marker.id = chargers[i].siteid;
                        marker.latitude = chargers[i].lat;
                        marker.longitude = chargers[i].lng;
                        marker.width = 32 * scaleWRate;
                        marker.height = 47 * scaleWRate;
                        if (chargers[i].cnt < 2) {
                            marker.iconPath = '/image/mark1.png';
                        } else if (chargers[i].cnt > 9) {
                            marker.iconPath = '/image/markm.png';
                        } else {
                            marker.iconPath = '/image/mark' + chargers[i].cnt + '.png';
                        }
                        marker.callout = {
                            content: chargers[i].sitename,
                            padding: 5, borderRadius: 10,
                            color: '#fff',bgColor: '#00f',display: 'BYCLICK'
                        };
                        lmarkers.push(marker);
                    }
                }
                that.setData({ markers: lmarkers });
                regionchanging = false;
            }
        };
        var carbk = 0; //0=混合，1汽车，2单车
        xnplugin.getChargerMap(leftlng, rightlng, botlat, toplat, carbk, callback);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setNavigationBarTitle({ title: '我要充电(小牛充电)' })
        var that = this;
        var me = xnplugin.getVserInfo();
        if (me && me.openid && me.openid!='false' && me.openid!='undefined'){
            var callback = function(mdata){
                that.setData(mdata);
            };
            xnplugin.getmycharging(me.openid, callback);
        }
        mapCtx = wx.createMapContext('map');
        wx.getSetting({
            success: function (rset) {
                if (rset.authSetting['scope.userInfo'] == false) {
                    wx.showToast({ icon: 'none', title: '未授权微信登陆', duration: 10000 });
                }
                if (rset.authSetting['scope.userLocation'] == false) {
                    wx.showToast({ icon: 'none', title: '手机定位未启用', duration: 10000 });
                }
            }
        });
        that.mapinit();
    },

    mapinit: function(){
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                var sdkversion = res.SDKVersion;
                var vresult = compareVersion(sdkversion, '2.2.0');
                screenH = res.screenHeight;
                wx.getLocation({
                    type: 'gcj02',
                    success: function (res) {
                        mylocationlat = res.latitude;
                        mylocationlng = res.longitude;
                        that.setData({
                            centerlat: mylocationlat,
                            centerlng: mylocationlng
                        });
                    },
                    fail: function (e) {
                        xnplugin.saveoper('_appidx', '定位错,' + e.errMsg);
                        that.setData({
                            centerlat: 30.62553,
                            centerlng: 114.261526,
                            mapScale: 5
                        });
                        mylocationlat = 30.62553;
                        mylocationlng = 114.261526;
                        if (e && e.errMsg) {
                            var msg = e.errMsg;
                            if (msg.indexOf('fail') > 0) {
                                wx.showToast({ icon: 'none', title: '系统定位权限已禁止', duration: 10000 });
                            } else {
                                wx.showToast({ icon: 'none', title: '定位失败，请检查', duration: 10000 });
                            }
                        }
                    },
                    complete: function () {
                        that.setData({
                            errormsg: vresult == -1 ? '微信版本较低，部份功能受限' : false
                        });
                        firstlocated = true;
                        setTimeout(function () {
                            xnplugin.saveoper('_appidx', '访问程序首页,' + xnplugin.getPluginVersion());
                            mapCtx.moveToLocation();
                        }, 1000);
                    }
                });
            }
        });
    },

    backcenter: function (e) {
        //定位当前位置
        if (mapCtx) {
            this.setData({
                centerlat: mylocationlat,
                centerlng: mylocationlng
            });
            mapCtx.moveToLocation();
        }
    },
    scaleup: function (e) {
        var scale = this.data.mapScale + 1;
        if (scale>18){
            scale = 18;
        }
        this.setData({
            mapScale: scale
        });
    },
    scaledn: function (e) {
        var scale = this.data.mapScale - 1;
        if (scale < 5) {
            scale = 5;
        }
        this.setData({
            mapScale: scale
        });
    },
    scan: function (e) {
        var that = this;
        wx.scanCode({
            success: function (res) {
                if (wx.getLogManager) {
                    var loger = wx.getLogManager();
                    loger.debug('homescancode', res);
                }
                if (res && res.errMsg && res.errMsg.indexOf('ok') > 0) {
                    var path = res.path;
                    var result = res.result;
                    if (path) {
                        if (path.indexOf('xmain/biker') > -1 ||
                            path.indexOf('xmain/evcar') > -1 ||
                            path.indexOf('xmain/dccar') > -1) {
                            if (path.indexOf('/') > 0) {
                                path = '/' + path;
                            }
                            wx.navigateTo({ url: path });
                        } else {
                            wx.showToast({
                                title: '未知二维码'
                            });
                        }
                    } else if (result && result.indexOf('www.mosf.cn/a') > 0) {
                        var qcode = result.split('/');
                        if (qcode.length == 7) {
                            if (qcode[4] == '020'){
                                if (qcode[5] == 'ac') {
                                    wx.navigateTo({ url: '/xmain/evcar?scene=' + qcode[6] });
                                } else if (qcode[5] == 'bk') {
                                    wx.navigateTo({ url: '/xmain/biker?scene=' + qcode[6] });
                                } else {
                                    wx.navigateTo({ url: '/xmain/dccar?scene=' + qcode[6] });
                                }
                            } else {
                                wx.showToast({ icon: 'none', title: '应用不匹配，请用微信扫码' });
                            }
                        } else {
                            wx.showToast({
                                title: '无法识别'
                            });
                        }
                    } else if (result && result == '*') {
                        wx.showToast({ icon: 'none', title: '扫码姿势错，请用微信扫一扫' });
                    } else {
                        wx.showToast({ icon: 'none', title: '请用微信扫码' });
                    }
                } else {
                    wx.showToast({
                        title: '扫码失败'
                    });
                }
            }
        });
    },
    chbk: function (e) {
        if (this.data.bkid){
            wx.navigateTo({ url: 'biker?scene='+this.data.bkid });
        }else{
            wx.navigateTo({ url: 'biker' });
        }
    },
    chev: function (e) {
        if (this.data.acid) {
            wx.navigateTo({ url: 'evcar?scene='+this.data.acid });
        }else{
            wx.navigateTo({ url: 'evcar' });
        }
    },
    dcar: function (e) {
        if (this.data.dcid) {
            wx.navigateTo({ url: 'dccar?scene='+this.data.dcid });
        }else{
            wx.navigateTo({ url: 'dccar' });
        }
    },
    mpay: function (e) {
        wx.navigateTo({ url: 'recharge' });
    },
    gotofeecard: function(e) {
        wx.navigateTo({ url: 'feecard' });
    },
    regionchange: function (e) {
        //得到地图中心点的位置
        if (mapCtx && e && e.type == 'end' && firstlocated) {
            if (!regionchanging) {
                regionchanging = true;
                var that = this;
                mapCtx.getCenterLocation({
                    success: function(lo){
                        that.setData({ centerlat: lo.latitude, centerlng: lo.longitude});
                    }
                });
                mapCtx.getRegion({
                    success: function (res) {
                        var leftlng = res.southwest.longitude;
                        var botlat = res.southwest.latitude;
                        var rightlng = res.northeast.longitude;
                        var toplat = res.northeast.latitude;
                        that.loadchargers(leftlng, rightlng, botlat, toplat);
                    }
                });
            }
        }
    },
    markertap: function (e) {
        var that = this;
        var siteid = e.markerId;
        var callback = function(charges){
            if (typeof(charges)=='number'){
                var errmsg = '未知错误';
                if (charges==0){
                    errmsg = '手机网络不通，请检查。';
                } else if (charges==1){
                    errmsg = '异常请求，未通过微信访问。';
                } else if (charges==2){
                    errmsg = '非法访问，无效的访问参数。';
                } else if (charges<500){
                    errmsg = '访问错误，请稍后重试。'+charges;
                } else {
                    errmsg = '网络不通，请退出微信重试。'+charges;
                }
                that.setData({ errormsg: errmsg});
            }else{
                var chfontsize = 12;
                if (charges.length < 3){
                    chfontsize = 24;
                } else if (charges.length < 6) {
                    chfontsize = 20;
                } else if (charges.length < 9) {
                    chfontsize = 16;
                } else {
                    chfontsize = screenH / charges.length / 3;
                }
                if (charges.length<4){
                    that.setData({ showsiteid: siteid, chargers: charges, chargerfontsize: chfontsize, errormsg: false, showroute: 1 });
                    that.callrouter(4);
                }else{
                    that.setData({ showsiteid: siteid, chargers: charges, chargerfontsize: chfontsize, errormsg: false });
                }
            }
        };
        var oldchs = that.data.chargers;
        oldchs.length = 0;
        that.setData({ showsiteid: siteid, chargers: oldchs });
        xnplugin.getChargersInSite(siteid, callback);
    },
    callrouter: function(_routetype){
        var that = this;
        if (_routetype==4){
            that.setData({ routetype: 2 });
        }else{
            that.setData({ routetype: _routetype });
        }
        var thismarker = false;
        for (var i = 0; i < that.data.markers.length; i++) {
            if (that.data.markers[i].id == that.data.showsiteid) {
                thismarker = that.data.markers[i];
                break;
            }
        }
        if (thismarker) {
            var p1 = new LatLon(mylocationlat, mylocationlng);
            var p2 = new LatLon(thismarker.latitude, thismarker.longitude);
            var direct_distance = parseInt(p1.distanceTo(p2));
            if (direct_distance<20000){//直线距离小于20000米！
                var qryinfo =
                    '/?key=' + that.data.mapsubkey +
                    '&from=' + mylocationlat + ',' + mylocationlng +
                    '&to=' + thismarker.latitude + ',' + thismarker.longitude;
                var theapi = routeapi + that.data.routetyps[that.data.routetype] + qryinfo;
                wx.request({
                    url: theapi,
                    success: function (res) {
                        if (res && res.data && res.data.status == 0) {
                            if (res.data.result.routes && res.data.result.routes.length > 0) {
                                var defaultroute = res.data.result.routes[0];
                                var distance = defaultroute.distance;
                                if (distance < 900 && _routetype == 4) {
                                    var _routelb1 = '就在附近', _routelb2 = '距离'+distance+'米';
                                    that.setData({ routetype: -1, routelb1: _routelb1, routelb2: _routelb2 });
                                } else if (distance > 100000 && _routetype == 4) {
                                    that.setData({ routetype: -1, showroute: 0 });
                                } else {
                                    if (distance > 3000 && _routetype == 4) {
                                        that.callrouter(0);
                                    } else {
                                        distance = distance / 1000;
                                        if (distance<1){
                                            distance = parseInt(distance*1000) + '米';
                                        } else if (distance < 10 ){
                                            distance = distance.toFixed(1) + '公里';
                                        } else {
                                            distance = parseInt(distance) + '公里';
                                        }
                                        var _routelb0 = '驾车路线', _routelb1 = '步行路线', _routelb2 = '骑行路线';
                                        if (that.data.routetype==0){
                                            _routelb0 = distance;
                                        } else if (that.data.routetype==1){
                                            _routelb1 = distance;
                                        } else {
                                            _routelb2 = distance;
                                        }
                                        var polyline = defaultroute.polyline;
                                        var arrpoints = [];
                                        if (polyline.length > 1) {
                                            for (var i = 2; i < polyline.length; i++) {
                                                polyline[i] = polyline[i - 2] + polyline[i] / 1000000;
                                            }
                                            for (var i = 0; i < polyline.length; i += 2) {
                                                arrpoints.push({ latitude: polyline[i], longitude: polyline[i + 1] });
                                            }
                                        }
                                        var datapolyline = {};
                                        datapolyline.points = arrpoints;
                                        datapolyline.color = linecolors[that.data.routetype];
                                        datapolyline.width = 4;
                                        datapolyline.dottedLine = false;
                                        var datapolylines = [];
                                        datapolylines.push(datapolyline)
                                        that.setData({ polylines: datapolylines, showroute: 0 });
                                        setTimeout(function () {
                                            that.setData({
                                                showroute: 1,
                                                routelb0: _routelb0,
                                                routelb1: _routelb1,
                                                routelb2: _routelb2 });
                                            }, 100);
                                    }
                                }
                            }else{
                                that.setData({ routetype: -1, showroute: 0 });
                            }
                        }
                    }
                });
            } else {
                that.setData({ routetype: -1, showroute: 0 });
            }
        }
    },
    maptaped: function (e) {
       this.setData({ showsiteid: 0, showroute: 0, polylines: [] });
    },
    gocharger: function (e) {
        this.setData({ showsiteid: 0 });
        var id = parseInt(e.target.id);
        if (id<100100){
            wx.navigateTo({ url: 'biker?scene=' + id });
        }else if (id<900100000){
            wx.navigateTo({ url: 'evcar?scene=' + id });
        }else{
            wx.navigateTo({ url: 'dccar?scene=' + id });
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    routeplancar: function(e){
        this.callrouter(0);
    },
    routeplanwak: function (e) {
        this.callrouter(1);
    },
    routeplanbik: function (e) {
        this.callrouter(2);
    },
    routeplanbus: function (e) {
        this.callrouter(3);
    },

    onResize(res) {
        this.mapinit();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
