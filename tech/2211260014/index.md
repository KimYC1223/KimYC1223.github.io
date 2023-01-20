---
layout: post
type: tech
date: 2022-11-26 00:14
category: Blog
title: AWS EC2 요금 폭탄 정산 후기
subtitle: 불법 해킹으로인한 3,700만원의 AWS 요금 폭탄 해결기
writer: KimYC1223
post-header: true
image: /img/title.png
header-img: /tech/2211260014/img/bg.png
hash-tag: [ToyProject]
draft : false
---

## 바쁘다 바빠 현대사회인을 위한 요약

아마 이 글을 읽고 있는 분은 엄청난 요금 폭탄으로 긴 글을 읽을 정신이 없을것이다.

그런 당신을 위해, 이 문제에 대한 나의 조언은 다음과 같다.

📌 지금 당장 [AWS 고객센터](https://support.console.aws.amazon.com/support/home#/)에 문의하라. 시간이 늦어질수록 당신이 불리해진다.

📌 AWS는 이런 문제에 대해 자주 대응하고 있다고 한다. 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;본인은 당황스러울 수 있으나 생각보다 자주 일어나는 일이고 다들 잘 해결을 하고 있으니, 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;너무 걱정하지 않아도 된다. 특히 이 문제는 해결하는데 한달 이상이 소요되므로

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;멘탈을 잘 붙잡고 버티는것이 중요하다.

📌 문제가 발생한 즉시 조치하면 정말 큰 금액도 해결 할 수 있지만, 몇 개월 이상 방치했다면... 해결이 어려워진다고 한다.

📌 AWS에서 답장을 줄 때 신속하게 대응 할 수 있도록, 메일을 자주 확인해야한다.

📌 이런 일이 일어나지 않도록 [MFA](https://ko.wikipedia.org/wiki/다요소_인증)와 같은 보안 설정을 철저히 한다.

<br>

---

## 새벽에 날라온 AWS의 고지서

평소와 다를 바 없던 10월 3일 새벽, 공포는 소리없이 내게 찾아왔다.

![AWS 3700만원 문자 메세지](./img/img_1.png)

누워서 자고있던 도중, 한 통의 문자가 도착했다.

평소 석사 졸업 연구 프로젝트에 관한 서버와 개인용 웹서버 & 게임 서버를 운용하기 위해 사용중이던 AWS에서 요금 정산 메시지가 온 것이다.

여러 서버를 사용중이었기에, 한달에 대략 5만원 ~ 7만원 가량의 요금이 나왔는데, 새벽에 문자가와서 확인해보니

이번달은 ```3만 7천원```의 요금이 나와있었다.

```'어..? 그런데 왜 한도 초과라고 하는거지?'``` 라고 생각하며 다시 확인해보니...


![놀라는 짤방](./img/img_2.gif)

<center><span style="color:red; margin-top:-15px">3만 7천원이 아니라 3,700만원 이라는 요금이 부과되었다.</span></center>

<br>

이.... 이 무슨... 심각한 사태임을 직감한 나는 바로 일어나 컴퓨터를 켜고 확인에 나섰다.

AWS에 가입한 메일로 영수증 관련된 메일이 온 것을 확인했는데, 자세히 확인해보니 다음과 같은 내역을 볼 수 있었다.

![3,700만원 영수증](./img/img_4.png)

AWS의 웹 대시보드 중 ```Billing```페이지에 가 보면 자세한 청구 내역을 확인할 수 있다.

내 요금 중 가장 큰 포션을 차지하는것은 ```p3.16xlarge```를 대여한 비용이었다.

```p3.16xlarge``` 인스턴스?? 이게 도대체 뭐지? 이름부터 뭔가 불길한데..?

![p3.16xlarge 설명](./img/img_5.png)

확인해보니, 64코어 CPU에 500GB 메모리라는 엄청난 성능의 윈도우 서버를 대여하고 있었다.

며칠 전(9월 말)에 아는 동생이 멀티 게임 서버를 열어달라고 하여,

새로 EC2 인스턴스를 구매하고 게임 서버를 열어준 적이 있는데,

혹시나 내가 잘못보고 ```인스턴스 유형을 잘못 선택한게 아닐까?``` 라는 생각을 했다.

그런데 더 확인해 알아본 결과, 이 정신나간 인스턴스는 9월 4일 새벽 3시부터 가동을 시작했다는 것을 알게되었다.

문제는 내가 분명한 기억하건데, 근 한달동안 새벽에 AWS 서버 작업을 한 기억이 없거니와,

특히나 9월 4일은 저녁 먹은게 체해서 이른 저녁부터 소화제를 먹고 앓아 누워있던 밤이었다.

![놀라서 뒤집어지는 짤방](./img/img_3.gif)

<center><span style="color:red;">여기서부터 내 AWS계정이 해킹당했음을 직감했다.</span></center>

<br>

---

## 도와줘요 고객센터

찾아보니, 나와 같은 피해자가 정말 많은것 같았다.

외국 해커들이 다른 사람의 계정을 도용하여 AWS서버를 대여하고, 이를 비트코인과 같은 가상화폐 채굴에 사용하여

돈만 벌고 서버 유지비용은 피해자에게 떠넘기는 것이다.

분노가 치솟아 올랐지만, 일단 급한대로 AWS의 [고객센터](https://support.console.aws.amazon.com/support/home#/)에 들어가 문의를 남겼다.

![고객센터에 새로운 문의를 남기는 방법](./img/img_6.png)

```Open support cases```항목에서, ```Create case```를 누른다.

그럼 아래와 같은 문의사항의 종류를 선택 할 수 있는 페이지로 넘어가는데,

![문의 사항 종류](./img/img_7.png)

```Releated issue```는 ```Account and billing```으로,

```Service```는 ```Account```, ```Category```는 ```Security```,

```Severity```는 ```General question```으로 두고 다음으로 넘어가면 된다.

그럼 메일처럼 제목과 본문으로 입력을 할 수 있는데, 다음과 같이 입력했다.

| English | 한국어 |
|:--------|:-----|
| Dear, sir or madam. <br><br>Today AWS forwarded me with a charge of 37,804,640 KRW. I was so surprised to see such an astronomical amount. Because I am only using AWS for personal purposes.<br><br>When I checked the EC2 dashboard, I saw that the instance with ID "i-0f9826cc21b46142e" was set to p3.16xlarge. I think someone hacked my account and did this.<br><br>So I'm sorry, but can I delete this instance and get a refund? I can't afford to pay that amount...<Br><br>p.s.<br>Additionally, since I'm not good at English, is it possible to reply in Korean if possible? If that's not possible, It's okay to reply me in english.<br><br>Thank you.<br><br>Best regards,<br>Young Chan Kim | 안녕하세요.<br><br>오늘 AWS에서 제게 37,804,640원의 요금을 청구했습니다. 저는 개인적인 용도로만 AWS를 사용하고 있기 때문에, 천문학적인 금액을 보고 너무 놀랐습니다.<br><br>EC2 대시보드를 확인해보니 ID가 "i-0f9826cc21b46142e"인 인스턴스가 p3.16xlarge로 설정되어 있는 것을 확인했는데, 누군가 내 계정을 해킹하여 이런 짓을 한 것 같습니다.<br><br>죄송하지만 이 인스턴스를 삭제하고 환불받을 수 있을까요? 저는 그 금액을 감당할 수 없습니다...<br><br>추신.<br>추가로 제가 영어를 잘 못하는데 가능하면 한국어로 답장해도 될까요? 가능하지 않다면 영어로 답장주셔도 괜찮습니다.<br><br>감사합니다.<br><br>친애하는,<br>김영찬<br> |

이때, 답변을 어떤 방식으로 선택할 수 있는지 고를 수 있는데, 꼭 웹 채팅방식을 선택하길 바란다.

<details><summary><span style="cursor:pointer; font-weight:bold; color:#222222; text-decoration : underline;">웹 채팅 방식을 사용해야 하는 이유</span></summary>
<div style="padding: 10px 0px 10px 15px; border-left:5px solid #e2e2e2;">
나는 최대한 빨리 답장을 받고싶다는 마음에 실시간으로 대화할 수 있는 <span style="color:red;">Phone call</span>을 선택했다.<br>
<br>
두근거리는 마음으로 간절히 빌며 기다리자, 조금 뒤에 국제 전화로 전화가 걸려왔다.<br>
<br>
어떤 남자가 영어로 자신은 AWS 고객 센터팀 소속이고, 문의를 읽고 연락을 줬다고 한다.<br>
<br>
평소에 영어는 잘 못하지만, 학부 졸업할 땐 토스 6레벨도 있었고 토익에서도 RC보단 LC가 더 자신 있었기에,<br>
<br>
크게 무리 없이 이해할 수 있을거라 생각했는데...<br>
<br>
<span style="color:red;">전체 대화중 20%도 못알아듣겠더라.</span><br>
<br>
일단 당연하게도 정말 원어민이 네이티브로 말을 하니까 정말 하나도 모르겠고,<br>
<br>
무슨 마이크를 쓰는지 음질도 구려서 정말 안들렸다.<br>
<br>
그래서 계속 <span style="color:red;">영어 잘 못합니다. 제발 한국어로 지원해주세요</span>를 외쳤는데, 내 영어 발음이 구려서인지<br>
<br>
그쪽도 못알아 듣는 상황이 왔다.<br>
<br>
너무 말이 안통해 대화가 되질 않자 새벽에 이게 뭐하는 짓인가 싶어,<br>
<br>
전화기로 "하... ㅅㅂ 뭐라는거야 진짜"라고 한국어로 중얼거렸더니<br>
<br>
놀랍게도 거기서 상담원이 "Oh, I See, I see" 라고 하며 웹 채팅 상담으로 변경해주었다.<br>
<br>
만약 당신이 상담 방법을 선택 할 수 있다면, 반드시 웹 채팅 상담을 받길 바란다.<br>
<br>
</div>
</details>

<br><br>

나의 경우, 다음과 같은 연락을 받았다.

```text
안녕하세요 아마존웹서비스입니다,

연락주셔서 감사합니다.

고객님의 문의에 따라 본 케이스를 한국어 고객지원팀으로 이관 도와드리겠으며,

해당 팀에서 케이스를 확인한 후 한국어로 자세하게 안내 드릴 예정입니다.

해당 팀에 먼저 접수된 문의량이 많은 경우 답변을 드리는 데까지 다소 시일이

소요될 수 있는 점에 대해 미리 양해 부탁 드리도록 하겠습니다.

한국어 지원 업무 시간: 평일 오전 9시 - 오후 6시

휴무: 주말 및 공휴일

감사합니다.
```

반가운 한국어를 뒤로 하고, 일단 더 큰 피해가 생기는 것을 막기 위해

문제가 있는 인스턴스는 ```중지```처리하였다.

초조한 마음으로 며칠을 기다리자, 다음과 같은 답변이 왔다.

![고객 센터 답변](./img/img_8.png)

내용이 길어 요약하면, 다음과 같다.

```text
해킹당했다는 너의 주장은 잘 알겠어

일단 내부적으로 정말 너가 한 짓인지, 아닌지 알아보고 연락줄게.

근데 혹시 너도 정말 네 게정이 털렸는지 궁금하니?

아래에 너 계정의 활동 로그를 볼 수 있는 방법들을 소개해줄게 확인해보렴
```

... 그냥 기다리라는 소리였다.

다만, 중간에 중요한 문장이 하나 잇었는데,

```
현재 말씀해 주셨던 인스턴스는 중단된 것으로 확인되나 원치 않는 과금을 막기 위해,  종료시키는 것을 추천드리겠습니다. 

만약 인스턴스를 종료시키지 않을 경우 관련 리소스에서 추가 비용이 발생할 수 있기 때문입니다.
```

그랬다. 추가적인 피해를 막기 위해 잘못된 인스턴스를 ```중지```시켰으나,

중지가 아닌 ```종료```를 해야했던 것이었다!

![중지와 종료](./img/img_9.png)

이것 때문에 추가 금액이 또 발생하고 말았다.

(하지만 최종적으로는 AWS에서 이 금액까지도 모두 없애주었다.)

무튼, 일단 추가적인 피해를 막았고,

AWS에서 말한 **내부적인 검토**가 끝나길 기다렸다.

<br>

---

## 보안은 철저히

내부적 검토를 기다리는 와중에, 추가적인 피해를 막기 위해

계정의 보안을 강화하는 작업을 진행해야 했다.

(이 과정에서는 다시 영어로 메일이 왔다)

![AWS에서 온 Action required 메일](./img/img_10.png)

<span style="color:red;font-weight:bold;">만약, 당신이 메일중 [ACTION REQUIRED] 이라는 메일을 받으면,</span>

당신이 무언가 해야 할 일이 있다는 뜻이므로, 반드시 메일을 잘 읽고 그 지시에 따라야 한다.

예를 들어, 바로 위에 있는 사진에서는 계정이 손상된 것 같으니,

비밀번호를 바꾸고 [Cloud tail](https://doitnow-man.tistory.com/entry/AWS-Cloudtail-%EA%B3%BC-CloudWatch-%EB%B9%84%EA%B5%90)에서 이상한 활동 기록이 있는지 확인하라는 것이었다.

이 메일에 대해 나는 다음과 같이 답신했다.

| English | 한국어 |
|:---|:---|
|Dear, sir or madam.<br><br>Thank you so much for your quick response despite your busy schedule.<br><Br>I have completed steps 1, 2, and 3.<br>I found out that MFA was enabled on October 4, 2022 at 3:00 AM (UTC+9), but I requested through the AWS service center to turn it off on October 6th.<br>And the current problematic instance has been terminated.<Br><br>Please feel free to contact me if there is anything I need to do.<br><br>Best regards,<br>Young Chan Kim. | 안녕하세요<br><Br>바쁘신 와중에도 빠른 답변 감사드립니다.<br><br>1, 2, 3단계를 완료했습니다.<br>2022년 10월 4일 오전 3시(UTC+9)에 MFA가 활성화된 것을 알았으나 AWS 서비스 센터를 통해 10월 6일에 해제를 요청했습니다.<br>그리고 현재 문제가 있는 인스턴스가 종료되었습니다.<br><Br>제가 해야 할 일이 있으면 언제든지 연락주세요.<br><br>친애하는,<br>김영찬 |


---

< 작성중 >

게시글을 작성중입니다. 혹여 궁금해할까 결론만 요약해서 말하자면,

고객센터에서 시키는대로만 하면 한 번은 봐줍니다. 멘탈 잡고 힘내십쇼