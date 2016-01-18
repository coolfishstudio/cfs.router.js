/**
 * 组件－前端路由
 */
(function (global, fn) {
    if(global.define){
        //提供CommonJS规范的接口
        define(fn);
    }else{
        //提供window.UI的接口
        global.cfs = global.cfs || {};
        global.cfs.router = fn();
    }
})(window, function () {
    var LOCATION = window.location;
    /**
     * 工具类
     */
    var utils = {
        //精确的获取类型
        getParamType: function (param) {
            return ((_t = typeof(param)) === 'object' ? 
                Object.prototype.toString.call(param).slice(8, -1) : _t).toLowerCase();
        },
        //判断是否是非空字符
        isNotEmptyString: function (string) {
            return (utils.getParamType(string) === 'string' && string.length);
        },
        //格式化path
        pathParser: function (path) {
            //去掉首尾空格
            path = path.replace(/^\/*|\/*$/g, '');
            //分割路径
            var result = path.split(/\//);
            if (result.length === 1 && result[0] === '') {
                result = [];
            }
            return result;
        },
        //格式化search
        searchParser: function (search) {
            var result = {},
                items = [],
                _keyValue = [];
            if (search) {
                items = search.split('&');
                for (var i = 0, length = items.length; i < length; i++) {
                    if (!items[i]) {
                        continue;
                    }
                    _keyValue = items[i].split('=');
                    result[_keyValue[0]] = (typeof _keyValue[1] === 'undefined' ? '' : _keyValue[1]);
                }
            }
            return result;
        },
        //根据url在_maps获取对应的内容
        findPathInMaps: function (url, maps) {
            var _target = null,
                _path = [],
                _tryMatch = false,
                _matchValue = {};
            //遍历maps
            for (var _key in maps) {
                _path = utils.pathParser(_key);
                //比对输入url长度与maps当前节点长度是否一致
                if (_path.length !== url.length) {
                    continue;
                }
                _target = maps[_key];
                //遍历maps当前url节点
                for (var i = 0, length = _path.length; i < length; i++) {
                    //比对输入url与maps对应url是否一致
                    if (_path[i] !== url[i]) {
                        //检测当前节点是否为变量
                        _tryMatch = _path[i].match(/\:(.+)/);
                        if (_tryMatch) {
                            _matchValue[_tryMatch[1]] = _path[i];
                        } else {
                            //既不一致，也不是变量 废弃
                            _target = null;
                            _matchValue = {};
                            break;
                        }
                    }  
                }
                //如果已经匹配出来的话
                if (_target) {
                    break;
                }
            }
            return _target ? {
                target: _target,
                data: _matchValue
            } : null;
        }
    };
    /**
     * 事件触发器
     */
    function EMIT (eventName, args) {
        //若无该事件 结束运行
        if (!this.events[eventName]) {
            return false;
        }
        for (var i = 0, length = this.events[eventName].length; i < length; i++) {
            this.events[eventName][i].apply(this, args);
        }
    }
    /**
     * router 构造函数
     */
    function router (param) {
        //强制使用 new 方法
        if (!(this instanceof router)) {
            return new router(param);
        }
        if( !window.history || !window.history.pushState){
            throw Error('not support pushState');
        }
        this._maps = {};//路由存放位置
        this.param = param || {};
        this.events = {};
        this._rest = null;//没有匹配的路由
    }
    router.prototype = {
        //添加
        set: function (url, callback) {
            var routerNames = [],
                type = utils.getParamType(url);
            if (type === 'string') {
                routerNames = [url];
            } else if (type === 'array') {
                routerNames = url;
            }

            for (var i = 0, total = routerNames.length; i < total; i++) {
                this._maps[routerNames[i]] = {
                    render: typeof(callback) === 'function' ? callback : null  
                };
            }
            return this;
        },
        //设置页面标题
        title: function (title) {
            document.title = title;
        },
        rest: function (callback) {
            if (utils.getParamType(callback) === 'function') {
                this._rest = callback;
            }
            return this;
        },
        on: function (eventName, callback) {
            if (!this.events[eventName]) {
                this.events[eventName] = [];
            }
            this.events[eventName].push(callback);
            return this;
        },
        push: function (url) {
            window.history.pushState({
                url: url
            }, '', url);
        },
        refresh: function (url) {
            var _url = url ? url : LOCATION.pathname + LOCATION.search + LOCATION.hash,
                _urlSplit = utils.isNotEmptyString(_url) ? _url.split('?') : ['', ''],
                _path = utils.pathParser(_urlSplit[0].split('#')[0]),
                _search = utils.searchParser(_urlSplit[1]),
                result = utils.findPathInMaps(_path, this._maps),
                data;

            console.log('>>', result);

            //触发视图刷新事件
            EMIT.call(this, 'beforeRefresh', [_path, _search]);
            if (result) {
                data = result.data;
                console.log(result.target);
                //执行set方法设置的回调
                result.target['render'].call(this, data, _path, _search);
            } else {
                this._rest && this._rest.call(this, _path, _search);
            }
            //触发视图刷新事件
            EMIT.call(this, 'refresh', [_path, _search]);
        }
    };
    return router;
});