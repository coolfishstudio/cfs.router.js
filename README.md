# cfs.router.js
轮子系列之 前端单页路由  
这是之前写的一个小组件 是前端单页面无刷新切换内容的一个前端路由
这是基于html5的  
等有时间再写一个首页进行展示  

###使用方式
```
//创建一个监管实例
var _router = new cfs.router();
//监听地址
_router.set('/', function () {
    _router.title('主页');
    console.log('123123');
});
_router.set(['/blog', '/p/:id'], function () {
    _router.title('博文列表页');
});
//未匹配到的url规则
_router.rest(function () {
    console.log(404);
});
//监听页面地址发生变化
_router.on('change',function (url) {
  console.log(url);
});
_router.push('index');// ==> 修改地址
_router.refresh();// ==> 无刷页面切换
```