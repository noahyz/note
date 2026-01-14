(function () {
  /**
   * UI 方法
   */
  var loadingDOM = null;
  var spinner = null;
  var loadingStyle =
    "z-index:3000;position:fixed;left:0;top:0;height:100%;width:100%;background:rgba(255,255,255,0.3);display:flex;flex-flow:column;justify-content:center;align-items:center;user-select:none;color:rgb(0,0,0,0.8)";
  var hideStyle = "display:none;";
  var spinnerBaseStyle =
    "transition: all 100000s linear; height: 25px; width: 25px; background:url(https://static.yximgs.com/udata/pkg/IS-DOCS/spinner.png); background-size: contain;";
  var spinnerAdd = spinnerBaseStyle + "transform: rotate(14000000deg);";

  if (typeof window !== "undefined") {
    // 说明是在 浏览器中
    loadingDOM = document.createElement("div");
    spinner = document.createElement("div");
    text = document.createElement("div");
    text.innerHTML = "";
    loadingDOM.appendChild(spinner);
    loadingDOM.appendChild(text);
    spinner.setAttribute("style", spinnerBaseStyle);
    loadingDOM.setAttribute("style", hideStyle);
    document.documentElement.appendChild(loadingDOM);
  }

  function showLoading(msg) {
    if (!loadingDOM) return;
    loadingDOM.setAttribute("style", loadingStyle);
    if (msg) text.textContent = msg;
    else text.innerHTML = "";
    setTimeout(() => {
      if (spinner.getAttribute("style") === spinnerBaseStyle) {
        spinner.setAttribute("style", spinnerAdd);
      } else {
        spinner.setAttribute("style", spinnerBaseStyle);
      }
    }, 10);
  }

  function hideLoading() {
    if (!loadingDOM) return;
    loadingDOM.setAttribute("style", hideStyle);
    setTimeout(() => {
      spinner.setAttribute("style", spinnerBaseStyle);
    }, 10);
  }

  // 确认询问
  var confirmDOM = null;
  var confirmStyle =
    "z-index:3002;position:fixed;left:0;top:0;height:100%;width:100%;background:rgba(0,0,0,0.2);display:flex;flex-flow:column;justify-content:center;align-items:center;color:rgb(0,0,0,0.8); font-size: 14px" +
    "";
  var confirmContentDOM = null;
  var confirmContentStyle =
    "width: 450px; max-height: 600px; background-color:white; border:1px solid rgb(0,0,0,0.1); display: flex;flex-flow: column ;padding: 20px; border-radius:10px";
  var btnSuitDOM = null;
  var textDOM = null;
  var textStyle = "padding-bottom:10px;";
  var yesDOM = null;
  var noDOM = null;
  var btnSuitStyle = "display:flex; justify-content: flex-end; cursor: pointer";
  var baseBtnStyle =
    "padding: 0 24px;height: 32px;line-height: 32px;font-size: 14px !important;font-weight: 500; border-radius: 5px; margin-left: 20px; cursor:pointer;";
  var yesStyle = baseBtnStyle + "background-color: #3371ff; color: white; ";
  var noStyle =
    baseBtnStyle + " background-color: rgb(51,113,255,0.06); color: #3371ff;";
  var confirmHideStyle = "display:none;";
  var yesCallback = function () { };
  var noCallback = function () { };

  function initConfirmDOM() {
    if (!confirmDOM) {
      confirmDOM = document.createElement("div");
      confirmDOM.setAttribute("style", confirmStyle);
      confirmContentDOM = document.createElement("div");
      confirmContentDOM.setAttribute("style", confirmContentStyle);
      btnSuitDOM = document.createElement("div");
      yesDOM = document.createElement("div");
      noDOM = document.createElement("div");
      yesDOM.setAttribute("style", yesStyle);
      noDOM.setAttribute("style", noStyle);
      btnSuitDOM.appendChild(yesDOM);
      btnSuitDOM.appendChild(noDOM);
      btnSuitDOM.setAttribute("style", btnSuitStyle);
      textDOM = document.createElement("div");
      textDOM.setAttribute("style", textStyle);
      confirmContentDOM.appendChild(textDOM);
      confirmContentDOM.appendChild(btnSuitDOM);
      confirmDOM.appendChild(confirmContentDOM);
      document.documentElement.appendChild(confirmDOM);
      yesDOM.onclick = function () {
        var args = arguments;
        yesCallback(args);
        confirmDOM.setAttribute("style", confirmHideStyle);
      };
      noDOM.onclick = function () {
        var args = arguments;
        noCallback(args);
        confirmDOM.setAttribute("style", confirmHideStyle);
      };
    }
  }
  function myconfirm(params) {
    if (!params) params = {};
    initConfirmDOM();
    yesDOM.innerHTML = params.confirmBtnText || "确认";
    noDOM.innerHTML = params.refuseBtnText || "取消";
    textDOM.innerHTML = params.text || "是否确认";
    yesCallback = function () { };
    noCallback = function () { };
    if (params.onConfirm) yesCallback = params.onConfirm;
    if (params.onRefuse) noCallback = params.onRefuse;
    confirmDOM.setAttribute("style", confirmStyle);
  }

  window.showConfirm = myconfirm;

  /**
   * 保存到本地
   */
  var link = document.createElement("a");
  link.href = "";
  function saveLocal(content) {
    var blob = new Blob([content || ""]);
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.download =
      "思维导图" +
      new Date(Date.now() + 28800000).toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/ /g, '').replace(/:/g, '').replace(/-/g, '').slice(4) +
      "-复制文字粘贴到思维导图编辑界面" +
      ".txt";
    link.click();
  }

  window.saveLocal = saveLocal;

  /**
   * 发送消息基础方法
   */
  function sendMsg(obj) {
    var str = JSON.stringify(obj)
    window.parent.postMessage(str, "*");
    console.log('naotu send to docs: ', str)
  }

  function addButton(saveFn, exitFn) {
    setTimeout(() => {
      var main = document.querySelector(".minder-editor-container");
      var header = document.querySelector(".editor-title");
      header.style.display = "none";
      main.style.top = "0px";
      var save = document.createElement("div");
      save.innerHTML = "保存";
      var exit = document.createElement("div");
      exit.innerHTML = "退出";
      save.onclick = saveFn;
      exit.onclick = exitFn;
      var baseStyle = "position:fixed; top:0px;";
      save.setAttribute(
        "style",
        yesStyle + baseStyle + "right: 100px; z-index:2999;"
      );
      exit.setAttribute(
        "style",
        noStyle +
        baseStyle +
        "right: 10px; background-color: rgb(220,230,240);z-index:3001;"
      );

      document.body.appendChild(exit);
      document.body.appendChild(save);
    }, 500);
  }

  var needCompact = location.href.indexOf("compact") !== -1;
  function getDefaultContentObj() {
    return {
      root: {
        data: {
          id: Math.random().toString(36).slice(2),
          created: Date.now(),
          text: "中心主题",
        },
        children: [],
      },
      template: "default",
      theme: "fresh-blue" + (needCompact ? "-compat" : ""),
      version: "1.4.43",
    };
  }

  function clearMind() {
    editor.minder.importJson(getDefaultContentObj());
  }

  function inject() {
    // ui 调整
    // 发出初始化完成事件，为了避免与 drawio 一致，特意带上 n- 前缀
    sendMsg({ event: "n-init" });
    function handleClickSave() {
      console.log('naotu click save');
      sendMsg({ event: "n-save" });
    }
    function handleClickExit() {
      console.log('naotu click exit')
      var currentContent = JSON.stringify(editor.minder.exportJson());
      if (currentContent == window.initalContent) sendMsg({ event: "n-exit" });
      else {
        showConfirm({
          text: "尚未保存，确定退出么？",
          onConfirm() {
            sendMsg({ event: "n-exit" });
          },
        });
      }
    }
    function handleNaotuChange() {
      // 和drawio不同，naotu contentchange 事件在json未发生变化的时候也会触发，例如importJson、失焦等逻辑，这里判断一下，减少事件触发
      const curJson = JSON.stringify(editor.minder.exportJson());
      if (!window.preJson) {
        window.preJson = curJson;
        return;
      }
      if (window.preJson !== curJson) {
        window.preJson = curJson;
        sendMsg({ event: 'n-change' });
      }
    }
    editor.minder.on('contentchange', handleNaotuChange);
    window.handleExport = function () {
      var json = JSON.stringify(editor.minder.exportJson());
      editor.minder.exportData("png").then((data) => {
        sendMsg({ event: "n-export", png: data, json: json });
      });
    };
    window.addEventListener("message", function (e) {
      var data = e.data;
      var msg = {};
      try {
        msg = JSON.parse(data);
      } catch (error) { }
      if (msg.action == "n-export") {
        if (msg.format == "png") {
          handleExport();
        }
      }
      if (msg.action == "n-load") {
        if (!msg.json) {
          clearMind();
        } else {
          editor.minder.importJson(msg.json);
          sendMsg({ event: "n-load", result: 'success' });
          window.initalContent = msg.json;
        }
      }
      if (msg.action == "n-clear") {
        clearMind();
      }
      if (msg.action == "n-reload") {
        var cacheStr = window.localStorage.getItem("naotu-cache");
        var cacheObj = getDefaultContentObj();
        try {
          cacheObj = JSON.parse(cacheStr);
        } catch (error) { }

        editor.minder.importJson(cacheObj);
      }
      if (msg.action == "n-loading") {
        var show = msg.show;
        var message = msg.message;
        var enabled = msg.enabled;
        if (!show) {
          hideLoading();
        } else {
          showLoading(message || "");
        }
      }
      // 扩展消息，保存到本地
      if (msg.action == "n-savelocal") {
        showConfirm({
          text: msg.msg ||
            "网络异常，请先保存到本地，稍后重试",
          onConfirm() {
            saveLocal(JSON.stringify(editor.minder.exportJson()));
            hideLoading();
          },
          onRefuse() {
            hideLoading();
          },
          refuseBtnText: '取消',
          confirmBtnText: '保存到本地'
        });
      }
      if (msg.action == "n-toast") {
        showConfirm({
          text: msg.msg,
          onConfirm() {
            hideLoading();
          },
          onRefuse() {
            hideLoading();
          },
          refuseBtnText: '取消',
          confirmBtnText: '确定'
        });
      }
      if (msg.action === 'n-getJson') {
        sendMsg({
          type: 'n-getJsonResult',
          result: JSON.stringify(editor.minder.exportJson()),
          messageId: msg.messageId,
        });
      }
    });
    addButton(handleClickSave, handleClickExit);

    // 删除一些多余的功能，比如图片/链接，因为他们在图片格式的时候不可用

    setTimeout(() => {
      var picDOM = document.querySelector(
        "body > div.minder-editor-container.ng-isolate-scope > div.top-tab.ng-scope.ng-isolate-scope > div > div > div.tab-pane.ng-scope.active > div:nth-child(5)"
      );
      var linkDOM = document.querySelector(
        "body > div.minder-editor-container.ng-isolate-scope > div.top-tab.ng-scope.ng-isolate-scope > div > div > div.tab-pane.ng-scope.active > div:nth-child(6)"
      );
      var memoDOM = document.querySelector(
        "body > div.minder-editor-container.ng-isolate-scope > div.top-tab.ng-scope.ng-isolate-scope > div > div > div.tab-pane.ng-scope.active > div:nth-child(7)"
      );
      picDOM && (picDOM.style.display = "none");
      linkDOM && (linkDOM.style.display = "none");
      memoDOM && (memoDOM.style.display = "none");
    }, 1);
  }

  /**
   * 处理黏贴事件
   */
  document.addEventListener("paste", function (e) {
    var text = e.clipboardData.getData("text");
    var json = null;
    try {
      json = JSON.parse(text);
    } catch (error) { }
    if (json) {
      if (json.root && json.template && json.theme) {
        e.preventDefault();
        e.stopPropagation();
        showConfirm({
          text: "是否导入本地数据？",
          onConfirm() {
            editor.minder.importJson(json);
          },
        });
      }
    }
  }, true);

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

  window.inject = inject;
  window.showLoading = showLoading;
})();
