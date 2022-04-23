var m1={}
/**
 * @description: 获取百度OCR_token
 * @return: access_token
 */
m1.get_baidu_token=function(client_id,client_secret) {    // 百度ocr
    var res = http.post(
        'https://aip.baidubce.com/oauth/2.0/token',
        {
            grant_type: 'client_credentials',
            client_id: client_id.replace(/ /g, ''),
            client_secret: client_secret.replace(/ /g, '')
        }
    );
    var xad = res.body.json()['access_token'];
    if(xad == null){
        console.error('百度文字识别（OCR）载入失败');
        exit();
    } else {
        console.info('百度文字识别（OCR）载入成功');
    }
    return xad;
}
/**
 * @description: 返回结果列表的百度文字识别
 * @author:Lejw
 * @return: 文字识别内容
 */
m1.baidu_ocr_api_return_list=function(img,token) {
    console.log('百度ocr文字识别中');
    var answer = "";
    var res = http.post(
        'https://aip.baidubce.com/rest/2.0/ocr/v1/general',
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            access_token: token,
            image: images.toBase64(img),
        }
    );
    
    var res = res.body.json();
    try {
        var words_list = res.words_result;
    } catch (error) {
        console.error('百度ocr文字识别失败:检查\n1.百度ocr欠费\n2.其他的错误');
        exit();
    }
  	var ret=[]
    for (let i=0;i<words_list.length;i++) {
       ret[i]=words_list[i].words.replace(/\s*/g, "");
    }
    return ret
}

/**
 * @description: 获取提示答案列表
 * @author:Lejw
 * @return:答案列表
 */
m1.getAnsList=function() {
  auto.waitFor();
  if (!requestScreenCapture()) {
    toastLog('没有授予 Hamibot 屏幕截图权限');
    hamibot.exit();
  }
  ansField=className("android.view.View").clickable(true).depth(23).indexInParent(0).findOne()
  var ans=ansField.bounds()
  var x=ans.left
  var y=ans.top
  var h=ans.bottom-ans.top
  var w=ans.right-ans.left
  console.log(x,y,h,w)
  var img = images.clip(captureScreen(),x,y,w,h);//裁切提示
  img=images.interval(img, "#FD1111", 60)//图片二值化
  images.save(img,'/sdcard/1.png')
  var token=m1.get_baidu_token("","")
  var ansList=m1.baidu_ocr_api_return_list(img,token)
  console.info(ansList)
  return ansList
}
module.exports=m1