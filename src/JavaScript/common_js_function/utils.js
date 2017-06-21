/**
 * Created by jennifer on 2/28/17.
 */

function jsonSyntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function formatDate(time, format) {
    var t = new Date(time);
    // var tf = function (i) { return (i < 10 ? '0' : '') + i };
    return format.replace(/yyyy|MM|dd|HH|mm|ss/g, function (a) {
        switch (a) {
            case 'yyyy':
                return t.getFullYear();
            case 'MM':
                return t.getMonth() + 1;
            case 'mm':
                return t.getMinutes();
            case 'dd':
                return t.getDate();
            case 'HH':
                return t.getHours();
            case 'ss':
                return t.getSeconds();
                // return tf(t.getSeconds());
        }
    })
}

String.prototype.parseURL = function(){
    var url =this.toString()
    var a = document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
        hash: a.hash.replace('#', ''),
        path: a.pathname.replace(/^([^\/])/, '/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
        segments: a.pathname.replace(/^\//, '').split('/'),
        params: (function() {
            var ret = {};
            var seg = a.search.replace(/^\?/, '').split('&').filter(function(v,i){
                if (v!==''&&v.indexOf('=')) {
                    return true;
                }
            });
            seg.forEach( function(element, index) {
                var idx = element.indexOf('=');
                var key = element.substring(0, idx);
                var val = element.substring(idx+1);
                ret[key] = val;
            });
            return ret;
        })()
    };
};

exports.jsonSyntaxHighlight=jsonSyntaxHighlight;
exports.formatDate = formatDate;