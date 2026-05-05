(function () {
  /**
   * 国际化文案
   */
  var intl = {};
  intl.en = {
    保存: 'Save',
    退出: 'Exit',
    取消: 'Cancel',
    保存到本地: 'Save to the local',
    数据加载异常: 'Abnormal data loading',
    我知道了: 'Got it',
    '网络异常，请先保存到本地，稍后重试':
      'Abnormal network! Please save it to the local and try again later',
    '粘贴的网络图片可能最终无法保存成功，建议先将图片下载到本地，再推拽到编辑区':
      'Paste from internet is not supported',
  };
  intl.zh = {
    保存: '保存',
    退出: '退出',
    取消: '取消',
    保存到本地: '保存到本地',
    数据加载异常: '数据加载异常',
    我知道了: '我知道了',
    '网络异常，请先保存到本地，稍后重试': '网络异常，请先保存到本地，稍后重试',
    '粘贴的网络图片可能最终无法保存成功，建议先将图片下载到本地，再推拽到编辑区':
      '粘贴的网络图片可能最终无法保存成功，建议先将图片下载到本地，再推拽到编辑区',
  };
  if (location.href.indexOf('lang=en') !== -1) {
    intl.t = intl.en;
  } else {
    intl.t = intl.zh;
  }
  /**
   * UI 方法
   */
  var loadingDOM = null;
  var spinner = null;
  var loadingStyle =
    'z-index:3000;position:fixed;left:0;top:0;height:100%;width:100%;background:rgba(255,255,255,0.3);display:flex;flex-flow:column;justify-content:center;align-items:center;user-select:none;color:rgb(0,0,0,0.8)';
  var hideStyle = 'display:none;';
  var spinnerBaseStyle =
    'transition: all 100000s linear; height: 25px; width: 25px; background:url(https://static.yximgs.com/udata/pkg/IS-DOCS/spinner.png); background-size: contain;';
  var spinnerAdd = spinnerBaseStyle + 'transform: rotate(14000000deg);';

  if (typeof window !== 'undefined') {
    // 说明是在 浏览器中
    loadingDOM = document.createElement('div');
    spinner = document.createElement('div');
    text = document.createElement('div');
    text.innerHTML = '';
    loadingDOM.appendChild(spinner);
    loadingDOM.appendChild(text);
    spinner.setAttribute('style', spinnerBaseStyle);
    loadingDOM.setAttribute('style', hideStyle);
    document.documentElement.appendChild(loadingDOM);
  }

  function showLoading(msg) {
    if (!loadingDOM) return;
    loadingDOM.setAttribute('style', loadingStyle);
    if (msg) text.textContent = msg;
    else text.innerHTML = '';
    setTimeout(() => {
      if (spinner.getAttribute('style') === spinnerBaseStyle) {
        spinner.setAttribute('style', spinnerAdd);
      } else {
        spinner.setAttribute('style', spinnerBaseStyle);
      }
    }, 10);
  }

  function hideLoading() {
    if (!loadingDOM) return;
    loadingDOM.setAttribute('style', hideStyle);
    setTimeout(() => {
      spinner.setAttribute('style', spinnerBaseStyle);
    }, 10);
  }

  // 确认询问
  var confirmDOM = null;
  var confirmStyle =
    'z-index:3002;position:fixed;left:0;top:0;height:100%;width:100%;background:rgba(0,0,0,0.2);display:flex;flex-flow:column;justify-content:center;align-items:center;color:rgb(0,0,0,0.8); font-size: 14px' +
    '';
  var confirmContentDOM = null;
  var confirmContentStyle =
    'width: 450px; max-height: 600px; background-color:white; border:1px solid rgb(0,0,0,0.1); display: flex;flex-flow: column ;padding: 20px; border-radius:10px';
  var btnSuitDOM = null;
  var textDOM = null;
  var textStyle = 'padding-bottom:10px;';
  var yesDOM = null;
  var noDOM = null;
  var btnSuitStyle = 'display:flex; justify-content: flex-end; cursor: pointer';
  var baseBtnStyle =
    'padding: 0 24px;height: 32px;line-height: 32px;font-size: 14px !important;font-weight: 500; border-radius: 5px; margin-left: 20px; cursor:pointer;';
  var yesStyle = baseBtnStyle + 'background-color: #3371ff; color: white; ';
  var noStyle =
    baseBtnStyle + ' background-color: rgb(51,113,255,0.06); color: #3371ff;';
  var confirmHideStyle = 'display:none;';
  var formatHideImageStyle =
    'position:fixed;top:40px;right:0;padding:8px 10px;border:1px solid #1F23291F;border-radius:4px 0 0 4px;background-color:#fff;line-height:0;cursor:pointer;z-index:1';
  var toggleIcon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjUwMTggMy41MDAwNkwxMi44MzE4IDMuODMwMDZDMTIuOTEzIDMuOTExMzIgMTIuOTU4NiA0LjAyMTUgMTIuOTU4NiA0LjEzNjM5QzEyLjk1ODYgNC4yNTEyOCAxMi45MTMgNC4zNjE0NyAxMi44MzE4IDQuNDQyNzJMOS4yNzY0NiA3Ljk5ODA2TDEyLjgzMTggMTEuNTUzN0MxMi45MTMgMTEuNjM1IDEyLjk1ODYgMTEuNzQ1MiAxMi45NTg2IDExLjg2MDFDMTIuOTU4NiAxMS45NzUgMTIuOTEzIDEyLjA4NTEgMTIuODMxOCAxMi4xNjY0TDEyLjUwMTggMTIuNDk2NEMxMi40MjA1IDEyLjU3NzYgMTIuMzEwNCAxMi42MjMyIDEyLjE5NTUgMTIuNjIzMkMxMi4wODA2IDEyLjYyMzIgMTEuOTcwNCAxMi41Nzc2IDExLjg4OTEgMTIuNDk2NEw3Ljg2MjEzIDguNDcwMDZDNy43NDQwNSA4LjM1MjA4IDcuNjc0NTMgOC4xOTQwOSA3LjY2NzMxIDguMDI3MzJDNy42NjAwOSA3Ljg2MDU1IDcuNzE1NjkgNy42OTcxNSA3LjgyMzEzIDcuNTY5MzlMNy44NjIxMyA3LjUyNzA2TDExLjg4ODggMy41MDAzOUMxMS45MjkgMy40NjAxMyAxMS45NzY4IDMuNDI4MTggMTIuMDI5NCAzLjQwNjM5QzEyLjA4MiAzLjM4NDYgMTIuMTM4NCAzLjM3MzM4IDEyLjE5NTMgMy4zNzMzOEMxMi4yNTIyIDMuMzczMzggMTIuMzA4NiAzLjM4NDYgMTIuMzYxMiAzLjQwNjM5QzEyLjQxMzggMy40MjgxOCAxMi40NjE2IDMuNDYwMTMgMTIuNTAxOCAzLjUwMDM5VjMuNTAwMDZaTTcuNTAxOCAzLjUwMDA2TDcuODMxOCAzLjgzMDA2QzcuOTEzMDEgMy45MTEzMiA3Ljk1ODY0IDQuMDIxNSA3Ljk1ODY0IDQuMTM2MzlDNy45NTg2NCA0LjI1MTI4IDcuOTEzMDEgNC4zNjE0NyA3LjgzMTggNC40NDI3Mkw0LjI3NjQ2IDcuOTk4MDZMNy44MzE4IDExLjU1MzdDNy45MTMwMSAxMS42MzUgNy45NTg2NCAxMS43NDUyIDcuOTU4NjQgMTEuODYwMUM3Ljk1ODY0IDExLjk3NSA3LjkxMzAxIDEyLjA4NTEgNy44MzE4IDEyLjE2NjRMNy41MDE4IDEyLjQ5NjRDNy40MjA1NCAxMi41Nzc2IDcuMzEwMzUgMTIuNjIzMiA3LjE5NTQ2IDEyLjYyMzJDNy4wODA1NyAxMi42MjMyIDYuOTcwMzkgMTIuNTc3NiA2Ljg4OTEzIDEyLjQ5NjRMMi44NjIxMyA4LjQ3MDA2QzIuNzQ0MDUgOC4zNTIwOCAyLjY3NDUzIDguMTk0MDkgMi42NjczMSA4LjAyNzMyQzIuNjYwMDkgNy44NjA1NSAyLjcxNTY5IDcuNjk3MTUgMi44MjMxMyA3LjU2OTM5TDIuODYyMTMgNy41MjcwNkw2Ljg4ODggMy41MDAzOUM2LjkyOTA0IDMuNDYwMTMgNi45NzY4MiAzLjQyODE4IDcuMDI5NDEgMy40MDYzOUM3LjA4MiAzLjM4NDYgNy4xMzgzNyAzLjM3MzM4IDcuMTk1MyAzLjM3MzM4QzcuMjUyMjIgMy4zNzMzOCA3LjMwODU5IDMuMzg0NiA3LjM2MTE4IDMuNDA2MzlDNy40MTM3NyAzLjQyODE4IDcuNDYxNTUgMy40NjAxMyA3LjUwMTggMy41MDAzOVYzLjUwMDA2WiIgZmlsbD0iIzFGMjMyOSIvPgo8L3N2Zz4K';
  var yesCallback = function () {};
  var noCallback = function () {};

  function initConfirmDOM() {
    if (!confirmDOM) {
      confirmDOM = document.createElement('div');
      confirmDOM.setAttribute('style', confirmStyle);
      confirmContentDOM = document.createElement('div');
      confirmContentDOM.setAttribute('style', confirmContentStyle);
      btnSuitDOM = document.createElement('div');
      yesDOM = document.createElement('div');
      noDOM = document.createElement('div');
      yesDOM.setAttribute('style', yesStyle);
      noDOM.setAttribute('style', noStyle);
      btnSuitDOM.appendChild(yesDOM);
      btnSuitDOM.appendChild(noDOM);
      btnSuitDOM.setAttribute('style', btnSuitStyle);
      textDOM = document.createElement('div');
      textDOM.setAttribute('style', textStyle);
      confirmContentDOM.appendChild(textDOM);
      confirmContentDOM.appendChild(btnSuitDOM);
      confirmDOM.appendChild(confirmContentDOM);
      document.documentElement.appendChild(confirmDOM);
      yesDOM.onclick = function () {
        var args = arguments;
        yesCallback(args);
        confirmDOM.setAttribute('style', confirmHideStyle);
      };
      noDOM.onclick = function () {
        var args = arguments;
        noCallback(args);
        confirmDOM.setAttribute('style', confirmHideStyle);
      };
    }
  }
  function myconfirm(params) {
    if (!params) params = {};
    initConfirmDOM();
    yesDOM.innerHTML = params.confirmBtnText || '确认';
    noDOM.innerHTML = params.refuseBtnText || '取消';
    textDOM.innerHTML = params.text || '是否确认';
    yesCallback = function () {};
    noCallback = function () {};
    if (params.onConfirm) yesCallback = params.onConfirm;
    if (params.onRefuse) noCallback = params.onRefuse;
    confirmDOM.setAttribute('style', confirmStyle);
  }

  window.showConfirm = myconfirm;

  /**
   * 保存到本地
   */
  var link = document.createElement('a');
  link.href = '';
  function saveLocal(content) {
    var blob = new Blob([content || '']);
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.download =
      '流程图' +
      new Date(Date.now() + 28800000)
        .toISOString()
        .replace(/T/, ' ')
        .replace(/\..+/, '')
        .replace(/ /g, '')
        .replace(/:/g, '')
        .replace(/-/g, '')
        .slice(4) +
      '-复制文字粘贴到流程图编辑界面' +
      '.txt';
    link.click();
  }

  window.saveLocal = saveLocal;

  /**
   * 发送消息基础方法
   */
  function sendMsg(obj) {
    window.parent.postMessage(JSON.stringify(obj), '*');
  }

  function addButton(saveFn, exitFn, toggleSidebarFn) {
    setTimeout(() => {
      var save = document.createElement('div');
      save.innerHTML = intl.t['保存'];
      var exit = document.createElement('div');
      exit.innerHTML = intl.t['退出'];
      var toggle = document.createElement('div');
      var icon = document.createElement('img');
      save.onclick = saveFn;
      exit.onclick = exitFn;
      toggle.onclick = toggleSidebarFn;
      var baseStyle = 'position:fixed; top:3px;';
      save.setAttribute(
        'style',
        yesStyle + baseStyle + 'right: 100px; z-index:2999;'
      );
      exit.setAttribute(
        'style',
        noStyle +
          baseStyle +
          'right: 10px; background-color: rgb(220,230,240);z-index:3001;'
      );

      toggle.setAttribute('style', formatHideImageStyle);
      icon.setAttribute('src', toggleIcon);

      toggle.appendChild(icon);
      document.body.appendChild(exit);
      document.body.appendChild(save);
      document.body.appendChild(toggle);
    }, 10);
  }

  /**
   * 发送消息基础方法
   */
  function sendMsg(obj) {
    window.parent.postMessage(JSON.stringify(obj), '*');
  }
  var uploadImageTaskMap = {};
  function inject() {
    window.addEventListener('message', function (e) {
      var data = e.data;
      var msg = {};
      try {
        msg = JSON.parse(data);
      } catch (error) {}
      if (msg.action == 'loading') {
        var show = msg.show;
        var message = msg.message;
        var enabled = msg.enabled;
        if (!show) {
          hideLoading();
        } else {
          showLoading(message || '');
        }
      }
      // 扩展消息，保存到本地
      if (msg.action == 'savelocal') {
        showConfirm({
          text: msg.msg || intl.t['网络异常，请先保存到本地，稍后重试'],
          onConfirm() {
            saveLocal(msg.content);
            hideLoading();
          },
          onRefuse() {
            hideLoading();
          },
          refuseBtnText: intl.t['取消'],
          confirmBtnText: intl.t['保存到本地'],
        });
      }

      // 扩展弹窗
      if (msg.action == 'toast') {
        var type = msg.type; // 可以扩展弹窗类型
        showConfirm({
          text: msg.msg || '未知异常',
          onConfirm() {
            hideLoading();
          },
          onRefuse() {
            hideLoading();
          },
          refuseBtnText: intl.t['取消'],
          confirmBtnText: intl.t['我知道了'],
        });
      } else if (msg.action === 'uploadImageResult') {
        var task = uploadImageTaskMap[msg.messageId];
        if (task) {
          if (msg.success) {
            task.onload(msg.data.url);
          } else {
            task.onerror(new Error(msg.msg));
          }
        }
      } else if (msg.action === 'getXml') {
        sendMsg({
          type: 'getXmlResult',
          result: getXml(),
          messageId: msg.messageId,
        });
      } else if (msg.action === 'isLoaded') {
        sendMsg({
          type: 'isLoadedResult',
          result: document.readyState === 'complete',
          messageId: msg.messageId,
        });
      }
    });
    function handleClickSave() {
      // var dom = document.querySelector('[title="保存 (Cmd+S)"]') || document.querySelector('[title="save"]')
      // if (dom) dom.click()
      // else sendMsg({ event: "save" });
      var doms = document.querySelectorAll('[title]') || [];
      var dom = null;
      try {
        for (var i = 0; i < doms.length; i++) {
          var target = doms[i];
          if (
            (target.title && target.title.indexOf('保存') !== -1) ||
            target.innerHTML.indexOf('保存') !== -1
          )
            dom = target;
        }
      } catch (error) {}
      if (!dom)
        dom =
          document.querySelector('[title="保存 (Cmd+S)"]') ||
          document.querySelector('[title="保存 (Ctrl+S)"]') ||
          document.querySelector('[title="save"]');
      if (dom) dom.click();
      else sendMsg({event: 'save'});
    }

    function handleClickExit() {
      var dom =
        document.querySelector('[title="退出"]') ||
        document.querySelector('[title="exit"]') ||
        document.querySelector('[title="Exit"]');
      dom && dom.click();
    }

    function handleToggleFormatSidebar() {
      var dom =
        document.querySelector('[title="格式 (Cmd+Shift+P)"]') ||
        document.querySelector('[title="格式 (Ctrl+Shift+P)"]') ||
        document.querySelector('[title="Format (Cmd+Shift+P)"]');
      dom && dom.click();
    }

    addButton(handleClickSave, handleClickExit, handleToggleFormatSidebar);

    window.addEventListener('load', () => {
      setTimeout(() => {
        var dom =
          document.querySelector('.geSidebarContainer.geFormatContainer');
        if (dom && dom.style) dom.style.zIndex = '2'; // toggleButton 和 抽屉 的 z-index 都为 1 的情况，会有展示 bug
        var svgCanvas = document.querySelector('.geDiagramContainer.geDiagramBackdrop');
        if (svgCanvas) {
          svgCanvas.addEventListener('wheel', (e) => {
            e.stopPropagation();
          });
        }
        var _isEventIgnored = drawioApp.keyHandler.isEventIgnored;
        drawioApp.keyHandler.isEventIgnored = function(evt) {
          // 重写原有的键盘事件方法，屏蔽cmd+0的快捷键
          if (evt.keyCode === 48 && (evt.metaKey || evt.ctrlKey)) {
            return true;
          }
          return _isEventIgnored.apply(this, arguments);
        };
        var _popup = mxPopupMenu.prototype.popup;
        mxPopupMenu.prototype.popup = function(x, y, cell, evt) {
          // 重写原始 popup 方法，去除自定义按钮对应快捷键提示文案
          _popup.apply(this, arguments);
          const lastEle = document.querySelector(".mxPopupMenu.geToolbarMenu tbody > .mxPopupMenuItem:last-child > .mxPopupMenuItem:last-child");
          lastEle && (lastEle.innerHTML = '');
        };
      }, 10);
    });

    // 增加监听
    document.addEventListener(
      'paste',
      evt => {
        var provider =
          evt.dataTransfer != null ? evt.dataTransfer : evt.clipboardData;
        // console.log(provider)
        // console.log('types',provider.types)
        // console.log('--------text', provider.getData('Text'))
        // console.log('--------html', provider.getData('text/html'))
        // console.log('--------plain', provider.getData('text/plain'))
        var html = '';
        try {
          html = provider.getData('text/html');
        } catch (error) {}
        if (html.indexOf('<img') !== -1) {
          evt.stopPropagation();
          myconfirm({
            text: intl.t[
              '粘贴的网络图片可能最终无法保存成功，建议先将图片下载到本地，再推拽到编辑区'
            ],
          });
        }
      },
      true
    );

    // 禁用浏览器原生双指操作：缩放&双指移动
    document.addEventListener(
      'wheel',
      evt => {
        if (evt.ctrlKey) {
          evt.preventDefault();
        }
      },
      { passive: false }
    );
  }

  sendMsg({
    event: 'load',
  });
  window.inject = inject;
  window.showLoading = showLoading;

  function generateMessageId() {
    return Date.now() + '' + Math.random();
  }

  function getXml() {
    return drawioApp.getFileData(
      !0,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      !1
    );
  }

  var imageUriMap = {};
  var domainRegexp =
    /^https?:\/\/.*((\.test\.gifshow\.com)|(\.zgzoqmc\.com)|(\.qingque\.cn)|(\.corp\.kuaishou\.com))\/.+/;

  var loadImage = function (uri, onload, onerror) {
    var img = new Image();
    img.crossOrigin = 'use-credentials';
    img.onload = function (e) {
      onload && onload(img);
    };
    img.onerror = function (e) {
      onerror && onerror(e);
    };
    img.src = uri;
  };
  window.proxyDrawioSomeMethods = function () {
    var drawioLoadImage = EditorUi.prototype.loadImage;
    EditorUi.prototype.loadImage = function (uri, onload, onerror) {
      var messageId = generateMessageId();
      uploadImageTaskMap[messageId] = {
        onload: function (resultUrl) {
          if (resultUrl.indexOf('?') === -1) {
            resultUrl += '?';
          }
          resultUrl += '&from=docs-h2';
          imageUriMap[uri] = resultUrl;
          loadImage(resultUrl, onload, onerror);
        },
        onerror: function (e) {
          onerror && onerror(e);
        },
      };
      sendMsg({
        type: 'uploadImage',
        content: uri,
        messageId,
      });
    };
    var drawioConvertDataUri = EditorUi.prototype.convertDataUri;
    EditorUi.prototype.convertDataUri = function (uri) {
      if (imageUriMap[uri]) {
        return imageUriMap[uri];
      }
      return drawioConvertDataUri.call(this, uri);
    };

    var drawioImportFile = EditorUi.prototype.importFile;
    EditorUi.prototype.importFile = function (...args) {
      const data = imageUriMap[args[0]] || args[0];
      args[0] = data;
      return drawioImportFile.apply(this, args);
    };

    var drawioRewriteImageSource = mxAsyncCanvas.prototype.rewriteImageSource;
    mxAsyncCanvas.prototype.rewriteImageSource = function (src) {
      if (domainRegexp.test(src)) {
        return src;
      }
      return drawioRewriteImageSource(src);
    };

    var drawioCreateImageUrlConverter =
      Editor.prototype.createImageUrlConverter;
    Editor.prototype.createImageUrlConverter = function () {
      var converter = drawioCreateImageUrlConverter.call(this);
      var convert = converter.convert;
      converter.convert = function (src) {
        if (domainRegexp.test(src)) {
          return src;
        }
        return convert.call(this, src);
      };
      return converter;
    };

    var drawioConvertImageToDataUri = Editor.prototype.convertImageToDataUri;
    Editor.prototype.convertImageToDataUri = function (url, callback) {
      if (domainRegexp.test(url)) {
        if (url.indexOf('qingque.cn') !== -1) {
          url += '&crossSite=true';
        }
        loadImage(
          url,
          function (img) {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            try {
              callback(canvas.toDataURL());
            } catch (e) {
              callback(Editor.svgBrokenImage.src);
            }
          },
          function () {
            callback(Editor.svgBrokenImage.src);
          }
        );
      } else {
        drawioConvertImageToDataUri.call(this, url, callback);
      }
    };
  };
})();
