var urls = [];
var logined = true;
var username = '';
var password = '';
function getDomainFromUrl(url){
	var host = "null";
	if(typeof url == "undefined" || null == url)
		url = window.location.href;
	var regex = /.*\:\/\/([^\/]*).*/;
	var match = url.match(regex);
	if(typeof match != "undefined" && null != match)
		host = match[1];
	return host;
}

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        if(callback) callback(tabs.length ? tabs[0].id: null);
    });
}

function queryOrders() {
    getCurrentTabId(function (tabId) {
        chrome.tabs.update(tabId, {url: 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&tabCode=waitConfirm'});
        // chrome.tabs.update(tabId, {url: 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm'});
    })
}

function queryDelivery() {
	var currentUrl = urls.shift()
	if (currentUrl) {
        getCurrentTabId(function (tabId) {
            chrome.tabs.update(tabId, {url: currentUrl});
        })
	} else {
		setTimeout(function () {
            queryOrders()
        }, 3600000)
	}

}

function sendMessageToContentScript(message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response)
        {
            if(callback) callback(response);
        });
    });
}

function checkForValidUrl(tabId, changeInfo, tab) {
	if(getDomainFromUrl(tab.url).toLowerCase()=="www.taobao.com"){
        chrome.pageAction.show(tabId);
	}
    if(getDomainFromUrl(tab.url).toLowerCase()=="www.tmall.com"){
        chrome.pageAction.show(tabId);
        sendMessageToContentScript({cmd:'check_login', value:'check login'}, function(response)
        {
            console.log('来自content的回复：'+response);
        });
    }
    if(getDomainFromUrl(tab.url).toLowerCase()=="buyertrade.taobao.com" && tab.url === 'https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm?action=itemlist/BoughtQueryAction&event_submit_do_query=1&tabCode=waitConfirm'){
        sendMessageToContentScript({cmd:'query_order', value:'auto query order'}, function(response)
        {
            console.log('来自content的回复：'+response);
        });
    }
    if(getDomainFromUrl(tab.url).toLowerCase()=="detail.i56.taobao.com"){
        sendMessageToContentScript({cmd:'query_delivery', url:tab.url}, function(response)
        {
            console.log('来自content的回复：'+response);
        });
    }
    if(getDomainFromUrl(tab.url).toLowerCase()=="login.taobao.com"){
        sendMessageToContentScript({cmd:'login', username:username, password:password}, function(response)
        {
            console.log('来自content的回复：'+response);
        });
    }
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.runtime.onMessage.addListener(function(request, sender, sendRequest){
	if(request.type == 'order_information'){
		urls = request.urls
		queryDelivery()
	}
	if(request.type == "delivery_information"){
        if(!request.error){
            $.ajax({
                url: "http://116.62.116.155:81/shopmall/plugins/delivery.php",
                cache: false,
                type: "POST",
                data: JSON.stringify({tabao_id:request.orderId,logi_id:request.deliveryNo,logi_name:request.deliveryName}),
                dataType: "json"
            }).done(function(msg) {
                console.log(msg)
                queryDelivery();
            }).fail(function(jqXHR, textStatus) {
                console.log(textStatus)
                queryDelivery();
            });
        }else{
            queryDelivery();
        }
	}
    if (request.type === 'go_login') {
        logined = false
    }
    if (request.type === 'logined') {
        logined = true
    }
});
