---
layout: post
type: tech
date: 2020-01-05 19:38
category: Blog
title: WEB 디자인 _ 검색 세션
subtitle: HTML과 CSS, 그리고 Javascript를 사용한 검색 페이지를 만들어보았다.
writer: KimYC1223
post-header: false
image: /img/title.png
hash-tag: [Web]
---

 심플하고 간단한 느낌이 드는 이 검색 페이지는 사용자의 입력을 받기 위해 동적으로 검색 바가 움직이는 모습을 보여준다. 또한 Javascript의 classList.add와 classList.remove를 이용하여 검색 창에 검색어가 남아 있으면 모습을 유지하도록 하였다.

# 결과 화면

<iframe width="100%" height="600" src="//jsfiddle.net/kimyc1223/o6kg4Lbc/6/embedded/result/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

Chrome에서 확인 할 때 가장 잘 보인다.

<br><br><br>

# HTML

``` html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" type="text/css" href="./style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/core.js"></script>
</head>
<body>
  <div class="bigBox">
    <h2>Search session</h2>
  </div>
  <div class="container">
    <input type="text" class="searchText inputField" id="input">
    <button class="btn"><i class="fas fa-search"></i></button>
  </div>
  <script lang="javascript">
    let textField = document.getElementById('input')

    textField.onfocus = () => {
      textField.classList.remove('searchText')
    }

    textField.onblur = () =>{
      if (textField.value == "")
        textField.classList.add('searchText')
    }
  </script>
</body>
</html>

```

html은 정말 간단하다. 딱히 설명할것도 없고,

javascript에서는 검색창을 감시하다가 길이가 늘었다 줄었다하도록 클래스를 추가/제거한다.

<br><br><br>

# CSS

``` css
*{
  margin:0px;
  padding:0px;
  font-family:sans-serif;
}

body{
  background-color: #27ae60;
}

.bigBox{
  position:absolute;
  left:50%;
  top:50%;
  transform:translate(-50%,-50%);
  text-align: center;
}

.bigBox h2{
  text-transform: uppercase;
  font-size: 30px;
  color:white;
  margin:15px;
}

.container{
  background-color: #1A7540;
  height: 50px;
  vertical-align: middle;
  border-radius: 50px;
  position:absolute;
  left:50%;
  top:60%;
  transform:translate(-50%,-50%);
}

.inputField{
  border:none;
  outline:none;
  font-size:16px;
  border-radius: 50px;
  height:25px;
  padding: 5px 10px;
  margin:7px 7px;
  display: inline;
  width:200px;
  float:left;
  color:#717171;
}

.searchText{
  width:0px;
  transition: 0.2s !important;
  padding: 5px 0px !important;
  margin:7px 0px !important;
}

.container:hover > .searchText {
  width:200px !important;
  margin:7px 7px !important;
  padding: 5px 10px !important;
}

.btn{
  margin:7px 7px;
  width: 35px;
  height: 35px;
  float:left;
  color:white;
  background-color: #27ae60;
  border-radius: 50px;
  display: inline;
  border:none;
}

```

<br><br><br>

# 결과

Javascript의 classList를 사용하는 방법을 알게되었다.
