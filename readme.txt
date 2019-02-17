# scu_captcha_recognition

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
