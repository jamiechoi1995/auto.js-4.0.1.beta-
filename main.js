//mainly based on https://github.com/hudeyu/-Auto.js-/blob/f8c1ad0c683b51fe4f4038aec3e0da0d15dbf1ff/collectAntForest.js

//author: jamiechoi@163.com

function unlock_device(){
    //小米解锁有加速度检测，通过滑到负一屏点击密码进行解锁
    //https://www.bilibili.com/read/cv2656128/
    device.wakeUp();
    sleep(1000);
    swipe(50,1300,1000,1300,100);
    sleep(1000);
    click(550, 550);
    sleep(500);
    click(550, 550);
    sleep(500);
    click(550, 550);
    sleep(500);
    click(550, 550);
    sleep(500);
}

function launch_zfb() {
    // app.launchApp("支付宝");
    var name = getPackageName("支付宝");
    // toast(name);
    app.launch(name);

    // if(text("支付宝").exists()){
    //     toast("进入支付宝");
    //     click("支付宝");
    // }
    sleep(2500);
}

function enter_forest() {
    if(text("蚂蚁森林").exists()){
        toast("进入蚂蚁森林");
        // text("蚂蚁森林").findOne().click();
        /*有时在生活服务板块也会出现蚂蚁森林的文字，此时会错误地点了这个蚂蚁森林，还是改为固定位置比较靠谱*/
        click(167, 486);
        // click("蚂蚁森林");
        sleep(2500);
    }else{
        toast("找不到蚂蚁森林")
    }
}


function thread_requestScreenCapture(){
    //https://github.com/e1399579/autojs/blob/9b8addf73ecce716f8a5d175af2eab717a569466/%E8%9A%82%E8%9A%81%E6%A3%AE%E6%9E%97.js#L295-L307
    var timeout = 8000;
    threads.start(function () {
        var remember;
        var beginBtn;
        if (remember = id("com.android.systemui:id/remember").checkable(true).findOne(timeout)) {
            remember.click();
        }
        if (beginBtn = classNameContains("Button").textContains("立即开始").findOne(timeout)) {
            beginBtn.click();
        }
    });
    if (!requestScreenCapture()) {
        throw new Error("请求截图失败");
    }
}


function collectEnergy_blind_click(){ 
    toast("下面开始收集能量");
    /*个人页面没有偷取小手，颜色判断又容易错误，改为点击全部可能位置*/
    var x_start = 200;
    var y_start = 500;
    for(x=200; x<=850; x+=50){
        for(y=500; y<=800; y+=50){
            click(x,y);
            sleep(20);
        }
    }
}

function collectEnergy(){ 
    toast("下面开始收集能量");
    // 截图权限申请
    thread_requestScreenCapture();

    var countTopLimit = 10;//通过cl限制次数来保证程序陷入的情况下也能够退出
    var img = captureScreen();
    toast("captureScreen")
    //toastLog("循环"+num);
    var colorGreen = "#C3FF60";
    // var colorGreen = "#CDFF60";
    // var colorGreen = "#EAFDBB";
    // var pointEnergyBall=findColor(img,colorGreen,{ region: [0, 0, 800, 800],threshold: 10 });
    var date = new Date();
    var hour = date.getHours();
    if (hour < 18){
        img_name = 'energy_hand.jpg';
    } else {
        img_name = 'energy_hand_night.jpg'
    }
    var icon = images.read(img_name);
    if (null === icon) {
        throw new Error("缺少图片文件");
    }
    var pointEnergyBall= images.findImage(img, icon, { threshold: 0.75 });
    while(pointEnergyBall){
        toast("发现能量球");
        toast(pointEnergyBall.x, pointEnergyBall.y);
        click(pointEnergyBall.x-20,pointEnergyBall.y-20);
        click(pointEnergyBall.x-30,pointEnergyBall.y-30);
        sleep(500);
        countTopLimit--;
        if(countTopLimit <= 0){
            toastLog("已经到了最大次数，程序退出");
            break;
        }
        img = captureScreen();
        // pointEnergyBall=findColor(img,colorGreen,{ region: [0, 0, 800, 800],threshold: 10 });
        pointEnergyBall= images.findImage(img, icon, { threshold: 0.75 });

    }
    toastLog("收集能量结束");
    sleep(1000);
}



function collectFriendsEnergy(){
    sleep(1000);
    // descEndsWith("查看更多好友").findOne().click();
    // descEndsWith("查看").findOne().click();
    if(text("查看更多好友").exists()){
        toast("查看更多好友");
        click("查看更多好友");
        sleep(2500);
    } else {
        toast("没有 查看更多好友");
        exit()
    }
    sleep(1000);

    thread_requestScreenCapture();

    var colorGreenHand="#1DA06D";
    var inviteFriendGreen = "#2EC06E";

    var swipe_count = 20;
    while(swipe_count){
        var img = captureScreen();
        var icon = images.read('friend_hand.jpg')
        if (null === icon) {
            throw new Error("缺少图片文件");
        }
        // var pointHand=findColor(img,colorGreenHand,{ region: [1000, 400],threshold: 10 });
        var pointHand=findImage(img, icon, { threshold: 0.75 });

        if(pointHand && text("好友排行榜").exists()){//找到绿色，包括手还有计时
            toastLog("找到了有能量的好友，开始偷能量");
            click(pointHand.x,pointHand.y+50);
            sleep(2500);
            collectEnergy();
            back();
            sleep(2500);
        }else{
            var inviteFriendBox = findColor(img,inviteFriendGreen,{ region: [1000, 400],threshold: 10 });
            if(inviteFriendBox){
                toastLog("到了好友列表的最后，退出好友排行榜");
                // click(60,120);//点击返回到列表
                sleep(1000);
                break;
            }else{
                swipe(500,1800,500,100,1000);//没有到结尾就翻页
                sleep(1000);
            }
        }
        swipe_count--;
    }
}

while (!device.isScreenOn()) {
    unlock_device();
    device.wakeUp();
    sleep(1000); // 等待屏幕亮起
}
launch_zfb();
enter_forest();
// collectEnergy();
collectEnergy_blind_click()
collectFriendsEnergy();
