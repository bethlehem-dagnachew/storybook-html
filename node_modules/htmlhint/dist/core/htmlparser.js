"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HTMLParser = (function () {
    function HTMLParser() {
        this._listeners = {};
        this._mapCdataTags = this.makeMap('script,style');
        this._arrBlocks = [];
        this.lastEvent = null;
    }
    HTMLParser.prototype.makeMap = function (str) {
        var obj = {};
        var items = str.split(',');
        for (var i = 0; i < items.length; i++) {
            obj[items[i]] = true;
        }
        return obj;
    };
    HTMLParser.prototype.parse = function (html) {
        var _this = this;
        var mapCdataTags = this._mapCdataTags;
        var regTag = /<(?:\/([^\s>]+)\s*|!--([\s\S]*?)--|!([^>]*?)|([\w\-:]+)((?:\s+[^\s"'>\/=\x00-\x0F\x7F\x80-\x9F]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]*))?)*?)\s*(\/?))>/g;
        var regAttr = /\s*([^\s"'>\/=\x00-\x0F\x7F\x80-\x9F]+)(?:\s*=\s*(?:(")([^"]*)"|(')([^']*)'|([^\s"'>]*)))?/g;
        var regLine = /\r?\n/g;
        var match;
        var matchIndex;
        var lastIndex = 0;
        var tagName;
        var arrAttrs;
        var tagCDATA = null;
        var attrsCDATA;
        var arrCDATA = [];
        var lastCDATAIndex = 0;
        var text;
        var lastLineIndex = 0;
        var line = 1;
        var arrBlocks = this._arrBlocks;
        this.fire('start', {
            pos: 0,
            line: 1,
            col: 1,
        });
        var isMapCdataTagsRequired = function () {
            var attrType = arrAttrs.find(function (attr) { return attr.name === 'type'; }) || {
                value: '',
            };
            return (mapCdataTags[tagName] &&
                attrType.value.indexOf('text/ng-template') === -1);
        };
        var saveBlock = function (type, raw, pos, data) {
            var col = pos - lastLineIndex + 1;
            if (data === undefined) {
                data = {};
            }
            data.raw = raw;
            data.pos = pos;
            data.line = line;
            data.col = col;
            arrBlocks.push(data);
            _this.fire(type, data);
            var lineMatch;
            while ((lineMatch = regLine.exec(raw))) {
                line++;
                lastLineIndex = pos + regLine.lastIndex;
            }
        };
        while ((match = regTag.exec(html))) {
            matchIndex = match.index;
            if (matchIndex > lastIndex) {
                text = html.substring(lastIndex, matchIndex);
                if (tagCDATA) {
                    arrCDATA.push(text);
                }
                else {
                    saveBlock('text', text, lastIndex);
                }
            }
            lastIndex = regTag.lastIndex;
            if ((tagName = match[1])) {
                if (tagCDATA && tagName === tagCDATA) {
                    text = arrCDATA.join('');
                    saveBlock('cdata', text, lastCDATAIndex, {
                        tagName: tagCDATA,
                        attrs: attrsCDATA,
                    });
                    tagCDATA = null;
                    attrsCDATA = undefined;
                    arrCDATA = [];
                }
                if (!tagCDATA) {
                    saveBlock('tagend', match[0], matchIndex, {
                        tagName: tagName,
                    });
                    continue;
                }
            }
            if (tagCDATA) {
                arrCDATA.push(match[0]);
            }
            else {
                if ((tagName = match[4])) {
                    arrAttrs = [];
                    var attrs = match[5];
                    var attrMatch = void 0;
                    var attrMatchCount = 0;
                    while ((attrMatch = regAttr.exec(attrs))) {
                        var name_1 = attrMatch[1];
                        var quote = attrMatch[2]
                            ? attrMatch[2]
                            : attrMatch[4]
                                ? attrMatch[4]
                                : '';
                        var value = attrMatch[3]
                            ? attrMatch[3]
                            : attrMatch[5]
                                ? attrMatch[5]
                                : attrMatch[6]
                                    ? attrMatch[6]
                                    : '';
                        arrAttrs.push({
                            name: name_1,
                            value: value,
                            quote: quote,
                            index: attrMatch.index,
                            raw: attrMatch[0],
                        });
                        attrMatchCount += attrMatch[0].length;
                    }
                    if (attrMatchCount === attrs.length) {
                        saveBlock('tagstart', match[0], matchIndex, {
                            tagName: tagName,
                            attrs: arrAttrs,
                            close: match[6],
                        });
                        if (isMapCdataTagsRequired()) {
                            tagCDATA = tagName;
                            attrsCDATA = arrAttrs.concat();
                            arrCDATA = [];
                            lastCDATAIndex = lastIndex;
                        }
                    }
                    else {
                        saveBlock('text', match[0], matchIndex);
                    }
                }
                else if (match[2] || match[3]) {
                    saveBlock('comment', match[0], matchIndex, {
                        content: match[2] || match[3],
                        long: match[2] ? true : false,
                    });
                }
            }
        }
        if (html.length > lastIndex) {
            text = html.substring(lastIndex, html.length);
            saveBlock('text', text, lastIndex);
        }
        this.fire('end', {
            pos: lastIndex,
            line: line,
            col: html.length - lastLineIndex + 1,
        });
    };
    HTMLParser.prototype.addListener = function (types, listener) {
        var _listeners = this._listeners;
        var arrTypes = types.split(/[,\s]/);
        var type;
        for (var i = 0, l = arrTypes.length; i < l; i++) {
            type = arrTypes[i];
            if (_listeners[type] === undefined) {
                _listeners[type] = [];
            }
            _listeners[type].push(listener);
        }
    };
    HTMLParser.prototype.fire = function (type, data) {
        if (data === undefined) {
            data = {};
        }
        data.type = type;
        var listeners = [];
        var listenersType = this._listeners[type];
        var listenersAll = this._listeners['all'];
        if (listenersType !== undefined) {
            listeners = listeners.concat(listenersType);
        }
        if (listenersAll !== undefined) {
            listeners = listeners.concat(listenersAll);
        }
        var lastEvent = this.lastEvent;
        if (lastEvent !== null) {
            delete lastEvent['lastEvent'];
            data.lastEvent = lastEvent;
        }
        this.lastEvent = data;
        for (var i = 0, l = listeners.length; i < l; i++) {
            listeners[i].call(this, data);
        }
    };
    HTMLParser.prototype.removeListener = function (type, listener) {
        var listenersType = this._listeners[type];
        if (listenersType !== undefined) {
            for (var i = 0, l = listenersType.length; i < l; i++) {
                if (listenersType[i] === listener) {
                    listenersType.splice(i, 1);
                    break;
                }
            }
        }
    };
    HTMLParser.prototype.fixPos = function (event, index) {
        var text = event.raw.substr(0, index);
        var arrLines = text.split(/\r?\n/);
        var lineCount = arrLines.length - 1;
        var line = event.line;
        var col;
        if (lineCount > 0) {
            line += lineCount;
            col = arrLines[lineCount].length + 1;
        }
        else {
            col = event.col + index;
        }
        return {
            line: line,
            col: col,
        };
    };
    HTMLParser.prototype.getMapAttrs = function (arrAttrs) {
        var mapAttrs = {};
        var attr;
        for (var i = 0, l = arrAttrs.length; i < l; i++) {
            attr = arrAttrs[i];
            mapAttrs[attr.name] = attr.value;
        }
        return mapAttrs;
    };
    return HTMLParser;
}());
exports.default = HTMLParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbHBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL2h0bWxwYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUF3QkE7SUFPRTtRQUNFLElBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUNqRCxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQTtRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtJQUN2QixDQUFDO0lBRU0sNEJBQU8sR0FBZCxVQUNFLEdBQVc7UUFJWCxJQUFNLEdBQUcsR0FBK0IsRUFBRSxDQUFBO1FBQzFDLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFNUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDckMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTtTQUNyQjtRQUVELE9BQU8sR0FBRyxDQUFBO0lBQ1osQ0FBQztJQUVNLDBCQUFLLEdBQVosVUFBYSxJQUFZO1FBQXpCLGlCQStLQztRQTlLQyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFBO1FBR3ZDLElBQU0sTUFBTSxHQUFHLDBKQUEwSixDQUFBO1FBRXpLLElBQU0sT0FBTyxHQUFHLDZGQUE2RixDQUFBO1FBQzdHLElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQTtRQUV4QixJQUFJLEtBQTZCLENBQUE7UUFDakMsSUFBSSxVQUFrQixDQUFBO1FBQ3RCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQTtRQUNqQixJQUFJLE9BQWUsQ0FBQTtRQUNuQixJQUFJLFFBQWdCLENBQUE7UUFDcEIsSUFB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