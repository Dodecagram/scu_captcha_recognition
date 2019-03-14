# 四川大学本科教务系统验证码识别
具体使用详见[GitPage](https://scu.edu.pl/scu_captcha_recognition/). 

使用1000个样本测试，准确率有60%，由于输错验证码不会导致账号被锁定，故可作登录用途。

下载: [recognition.min.js](http://scu.edu.pl/scu_captcha_recognition/download/recognition.min.js)

应用实例: 

1. 登录免验证码(书签)(脚本文件较大，建议下载脚本后再修改使用)
```javascript
javascript: function login_without_captcha(c){ if(c > 20){ alert('fail to recognize!'); }else{ c++; var usr = document.getElementById('input_username').value; var pwd = document.getElementById('input_password').value; getCaptcha().then(res=>getLabels(res)).then(res=>{ var xhr = new XMLHttpRequest(); xhr.open('post','/j_spring_security_check'); xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded'); xhr.send('j_username='+ usr +'&j_password='+ pwd +'&j_captcha='+ res); xhr.onload=function(){ if(/badCaptcha/.test(xhr.responseURL)){ login_without_captcha(c); }else{ window.location.href=xhr.responseURL; } } }); } }; var s = document.createElement('script'); s.src='https://scu.edu.pl/scu_captcha_recognition/download/recognition.min.js'; document.body.appendChild(s); s.onload=function(){ document.getElementById('captchaImg').style='display:none'; document.getElementById('input_checkcode').style='display:none'; document.getElementById('loginButton').onclick =function(e){ e.preventDefault(); login_without_captcha(0); }; }; void 0;
```
