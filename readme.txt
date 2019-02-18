# scu_captcha_recognition(四川大学 教务处 验证码识别)

Usage: import js file, and do like this: getCaptcha(img).then(res=>console.log(getLabels(res))). 
Docstring: Recognize the captcha of scu. 
Parameters
----------
img: Image object, optional
     Image object of the captcha.

Examples
--------
>>> getCaptcha().then(res=>console.log(getLabels(res)))
7wda
