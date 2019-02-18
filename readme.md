# 四川大学本科教务系统验证码识别
具体使用详见[gitpage](http://scu.edu.pl/scu_captcha_recognition/). 
下载: <http://scu.edu.pl/scu_captcha_recognition/download/recognition.min.js>
应用实例: 
1. 登录免验证码(书签)
```javascript
javascript: function login_without_captcha(c){ if(c > 20){ alert('fail to recognize!'); }else{ c++; var usr = document.getElementById('input_username').value; var pwd = document.getElementById('input_password').value; getCaptcha().then(res=>getLabels(res)).then(res=>{ var xhr = new XMLHttpRequest(); xhr.open('post','/j_spring_security_check'); xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded'); xhr.send('j_username='+ usr +'&j_password='+ pwd +'&j_captcha='+ res); xhr.onload=function(){ if(/badCaptcha/.test(xhr.responseURL)){ login_without_captcha(c); }else{ window.location.href=xhr.responseURL; } } }); } }; var s = document.createElement('script'); s.src='http://scu.edu.pl/scu_captcha_recognition/download/recognition.min.js'; document.body.appendChild(s); s.onload=function(){ document.getElementById('captchaImg').style='display:none'; document.getElementById('input_checkcode').style='display:none'; document.getElementById('loginButton').onclick =function(e){ e.preventDefault(); login_without_captcha(0); }; }; void 0;
```
