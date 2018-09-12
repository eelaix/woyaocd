var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      navbarData: {
          type: Object,
          value: {},
          observer: function (newVal, oldVal) { }
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
      height: '',
      navbarData: {
          showCapsule: 1
      }
  },
    attached: function () {
        this.setData({
            height: app.globalData.height
        })
    },
  /**
   * 组件的方法列表
   */
  methods: {
    _navback() {
        wx.navigateBack()
    }
  }
})
