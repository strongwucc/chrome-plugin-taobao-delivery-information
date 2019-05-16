$('#query-orders').click(function () {
    var username = $('#username').val()
    var password = $('#password').val()

    if (!username || !password) {
        alert('请输入淘宝账号和密码')
        return false
    }

    var bg = chrome.extension.getBackgroundPage();
    bg.username = username
    bg.password = password
    bg.queryOrders();
});

document.addEventListener('DOMContentLoaded', function () {
	// var orders = chrome.extension.getBackgroundPage().orders;
    //
	// var tr = '';
    //
	// orders.forEach(function (orderItem) {
	// 	tr += '<tr><td class="order-title">订单号</td><td class="order-content">' + orderItem.tradeId + '</td><td class="seller-title">商户ID</td><td class="seller-content">' + orderItem.sellerId + '</td></tr>'
	// })
    //
	// $('#content table').html(tr)
});
