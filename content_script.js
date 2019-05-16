function getParamFromUrl(url, key) {
    var reg = new RegExp(key + '=(.+)[&|$]', 'i')
    var r = url.match(reg)
    if (r != null) {
        return r[1];
    }
    return '';
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    // console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
    if(request.cmd == 'query_order'){
        sendResponse('我收到了你自动查询订单的消息！');
        var urls = []
        var elements = $('a[id="viewLogistic"]')
        elements.each(function (elementIndex) {
            urls.push($(this).prop('href'))
        })
        console.log(urls)
        chrome.runtime.sendMessage({type:"order_information", urls:urls});
    }

    if(request.cmd == 'query_delivery'){
        var orderInfo = $("div.panel-order div.info div.order-row:first-child");
        if(orderInfo.length!=1){
            chrome.runtime.sendMessage({type:"delivery_information", error:"获取物流信息失败."});
        }
        else{
            var msg = {
                type: "delivery_information",
                orderId: getParamFromUrl(request.url,'tId'),
                deliveryNo : '',
                deliveryName : '',
                contact : ''
            }

            var deliveryInfo = orderInfo.eq(0)

            var info = deliveryInfo.children('.em')
            info.each(function( index ) {
                if (index === 0) {
                    msg.deliveryNo = $(this).text().trim()
                }
                if (index === 1) {
                    msg.deliveryName = $(this).text().trim()
                }
                if (index === 2) {
                    msg.contact = $(this).text().trim()
                }
            });
            chrome.runtime.sendMessage(msg);
        }
    }

    if (request.cmd == 'login'){

        if ($('#J_Quick2Static').length > 0) {
            $('#J_Quick2Static').click()
        }

        setTimeout(function () {
            $('#TPL_username_1').val(request.username)
            $('#TPL_username_1')[0].dispatchEvent(new Event('input',{ bubbles: true }))

            $('#TPL_password_1').val(request.password)
            $('#TPL_password_1')[0].dispatchEvent(new Event('input',{ bubbles: true }))

            if ($('#nocaptcha').length > 0 && $('#nocaptcha').css('display') !== 'none') {
                alert('自动登录失败，需要手动登录')
            } else {
                $('#J_SubmitStatic').click()
            }
        }, 500)

    }
});
