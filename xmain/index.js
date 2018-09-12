var app = getApp();
var xnplugin = requirePlugin("xnplugin");
var scaleWRate = 0;
var scaleHRate = 0;
var defaultW = 375;
var defaultH = 603;
var mapCtx = false;
var regionchanging = false;

function compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    var len = Math.max(v1.length, v2.length)
    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }
    for (var i = 0; i < len; i++) {
        var num1 = parseInt(v1[i])
        var num2 = parseInt(v2[i])
        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }
    return 0
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        height: app.globalData.height * 2 + 20,
        cp0: {},
        cp1: {},
        cp2: {},
        showsiteid: 0,
        markers: [],
        chargers: [],
        mapScale: 16,
        centerlat: 34.283272,//永远都不要变
        centerlng: 108.969303,
        screenW: 375,
        screenH: 603,
        oldversion: false,
        btypes: ['primary', 'default', 'warn'],
        plugin_userInfo: false
},

    loadchargers: function (leftlng, rightlng, toplat, botlat) {
        var that = this;
        var callback = function (chargers) {
            var lmarkers = [];
            if (chargers && chargers.length > 0) {
                for (var i = 0; i < chargers.length; i++) {
                    var marker = {};
                    marker.id = chargers[i].siteid;
                    marker.latitude = chargers[i].lat;
                    marker.longitude = chargers[i].lng;
                    marker.width = 32 * scaleWRate;
                    marker.height = 47 * scaleWRate;
                    if (chargers[i].cnt<2){
                        marker.iconPath = '/image/mark1.png';
                    } else if (chargers[i].cnt > 9 ) {
                        marker.iconPath = '/image/markm.png';
                    } else {
                        marker.iconPath = '/image/mark' + chargers[i].cnt + '.png';
                    }
                    lmarkers.push(marker);
                }
            }
            that.setData({
                markers: lmarkers
            });
            regionchanging = false;
        };
        var carbk = 0; //0=混合，1汽车，2单车
        xnplugin.getChargerMap(leftlng, rightlng, toplat, botlat, carbk, callback);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                var sdkversion = res.SDKVersion;
                var vresult = compareVersion(sdkversion, '2.1.0');
                var scw = res.windowWidth;
                var sch = res.windowHeight;
                scaleWRate = scw / defaultW;
                scaleHRate = sch / defaultH;
                wx.getLocation({
                    type: 'gcj02',
                    success: function (res) {
                        var lat = res.latitude;
                        var lng = res.longitude;
                        var tmpcp0 = {
                                left: 10 * scaleWRate,
                                top: (603-210) * scaleHRate
                        };
                        var tmpcp1 = {
                            left: 10 * scaleWRate,
                            top: (603-160) * scaleHRate
                        };
                        var tmpcp2 = {
                            left: 10 * scaleWRate,
                            top: (603-110) * scaleHRate
                        };
                        var uInfo = xnplugin.getVserInfo();
                        that.setData({
                            screenW: scw,
                            screenH: sch,
                            centerlat: lat,
                            centerlng: lng,
                            cp0: tmpcp0,
                            cp1: tmpcp1,
                            cp2: tmpcp2,
                            oldversion: vresult == -1,
                            plugin_userInfo: uInfo
                        });
                    }
                });
            }
        });
    },

    backcenter: function (e) {
        //定位当前位置
        if (mapCtx) {
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
        if (scale < 8) {
            scale = 8;
        }
        this.setData({
            mapScale: scale
        });
    },
    scan: function (e) {
        var that = this;
        wx.scanCode({
            success: function (res) {
                console.log(res);
                if (res && res.errMsg && res.errMsg.indexOf('ok') > 0) {
                    var path = res.path;
                    if (path) {
                        if (path.indexOf('pages/biker') > -1 ||
                            path.indexOf('pages/evcar') > -1 ||
                            path.indexOf('pages/dccar') > -1) {
                            if (path.indexOf('/') > 0) {
                                path = '/' + path;
                            }
                            wx.navigateTo({ url: path });
                        } else {
                            wx.showToast({
                                title: '未知二维码'
                            });
                        }
                    } else {
                        wx.showToast({
                            title: '无法识别'
                        });
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
        wx.navigateTo({ url: 'biker' });
    },
    chev: function (e) {
        wx.navigateTo({ url: 'evcar' });
    },
    dcar: function (e) {
        wx.navigateTo({ url: 'dccar' });
    },
    mpay: function (e) {
        wx.navigateTo({ url: 'recharge' });
    },
    regionchange: function (e) {
        //得到地图中心点的位置
        if (mapCtx && e && e.type == 'end') {
            if (!regionchanging) {
                regionchanging = true;
                var that = this;
                mapCtx.getRegion({
                    success: function (res) {
                        var leftlng = res.southwest.longitude;
                        var botlat = res.southwest.latitude;
                        var rightlng = res.northeast.longitude;
                        var toplat = res.northeast.latitude;
                        that.loadchargers(leftlng, rightlng, toplat, botlat);
                    }
                });
            }
        }
    },
    markertap: function (e) {
        var that = this;
        var siteid = e.markerId;
        var callback = function(charges){
            that.setData({ showsiteid: siteid, chargers: charges });
        };
        var oldchs = that.data.chargers;
        oldchs.length = 0;
        that.setData({ showsiteid: siteid, chargers: oldchs });
        xnplugin.getChargersInSite(siteid, callback);
    },
    maptaped: function (e) {
        this.setData({ showsiteid: 0 });
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
        mapCtx = wx.createMapContext('map');
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

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})