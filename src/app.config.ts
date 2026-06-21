export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/scan/index',
    'pages/recycle/index',
    'pages/mine/index',
    'pages/booking-detail/index',
    'pages/dispute/index',
    'pages/box-detail/index',
    'pages/deposit/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '低温箱管家',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f7fa'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#1677ff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/scan/index',
        text: '扫码'
      },
      {
        pagePath: 'pages/recycle/index',
        text: '回收'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
