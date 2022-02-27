---
layout: post
type: tech
date: 2020-12-29 18:29
category: Blog
title: HoloLens2 Vuforia 라이브러리 임포트
subtitle: HoloLens2 프로젝트에 Vuforia를 임포트하는 방법을 설명한다.
writer: KimYC1223
post-header: true
image: /img/title.png
header-img: /tech/2012291829/img/bg.png
hash-tag: [MixedReality]
---

가장 간단한 이미지 타겟 예제를 통해 동작하는 모습을 보여준다.

# Import Vuforia library guide

이미지 및 QR코드 인식에 사용되는 Vuforia 라이브러리 임포트 방법을 기록한다.

HoloLens 1에서도 사용했던 라이브러리인데, HoloLens2도 지원한다.

참고 블로그 : [HoloLens2 + Vuforia image recognition](https://www.programmersought.com/article/36095466956/)

<hr>

## 1. 준비물

- **이미지 파일** : 인식할 이미지 파일을 준비한다. png 또는 jpg로 준비한다.
- **인쇄된 이미지** : 이미지 파일을 출력해 준비한다. 이 이미지를 인식할 것이다.
- **HoloLens2** : 홀로렌즈2를 가지고 있어야 한다.
- **WebCam** : 디버그용(Unity Play모드에서 쓸) 웹캠이 있어야 한다.
- **MRTK 프로젝트** : #101 에서 만든 **기본 프로젝트 만들기**가 선행되어야 한다.

<hr>

## 2. Import Vuforia Library

### 2-1. Package Manager를 통해 가져오기

![image](https://user-images.githubusercontent.com/40852277/103183891-955e3300-48f8-11eb-9912-e52f8f955774.png)

상단 메뉴의 ```Window > Package Manager > Vuforia Engine AR```을 Install해 준다.

### 2-2. Main Camera에 ```Vuforia Behaviour```추가하기

![image](https://user-images.githubusercontent.com/40852277/103183945-c9d1ef00-48f8-11eb-926a-5b8e06784778.png)

Scene Hierarchy에서, ```MixedRealityPlayspace```의 아래에 있는 Main Camera에 ```Vuforia  Behaviour``` 컴포넌트를 추가한다.

<hr>

## 3. Configuration Vuforia Library

### 3-1. ```Vuforia Engine```의 개발자 동의를 진행한다.

![image](https://user-images.githubusercontent.com/40852277/103184715-97c28c00-48fc-11eb-95c3-cf57f8accda1.png)

상단 메뉴에서 ```Help > Vuforia Engine > Show Developer Agreement```를 눌러 ```Accept```한다.

### 3-2. ```Vuforia Behaviour``` 컴포넌트의 ```Open Vuforia Engine configuration```을 누른다.

![image](https://user-images.githubusercontent.com/40852277/103184805-fdaf1380-48fc-11eb-92e4-bc5076b2d017.png)

### 3-3. Vuforia License Key를 발급받는다.

1. [Vuforia 웹사이트](https://developer.vuforia.com/vui/develop/licenses)에 접속한다.
2. 회원가입을 진행하고, 로그인을 한다.
3. ```Get Development Key```를 눌러 라이센스를 만든다.
4. 추가된 License를 누르면, License Key가 보인다. 이를 복사한다.

![image](https://user-images.githubusercontent.com/40852277/103185433-c5f59b00-48ff-11eb-8219-886feaca3209.png)

### 3-4. License Key 등록

![image](https://user-images.githubusercontent.com/40852277/103185488-fccbb100-48ff-11eb-8445-07eda69f8096.png)

발급 받은 License Key를 입력한다.

<hr>

## 4. Create Target Image Database

### 4-1. [Vuforia developer portal](https://developer.vuforia.com/)에 접속해 데이터베이스를 만든다.

```Develop > Target Manager```에 들어가 ```Add Database```버튼을 누른다.

![image](https://user-images.githubusercontent.com/40852277/103186281-423dad80-4903-11eb-9b9a-c9c921fd59ff.png)

그 후, 적당한 이름을 입력하고 Type은 ```Device```로 한 다음 ```Create```를 누른다.

### 4-2. 이미지를 추가한다.

```Add Target``버튼을 눌러 이미지를 추가한다. 여기서는 Single Image로 진행하도록 한다.

**File** : 이미지 파일을 선택하여 넣는다.
**Width** : 이미지 파일의 가로 길이를 입력한다. **이때 단위는 m이다! 즉, 가로길이가 5cm라면 0.05이다!!**
**Name** : 타겟의 이름을 입력한다.

![image](https://img.shields.io/badge/-NOTICE-red?logo=Highly&logoColor=white)

반드시 **Width**파라미터를 잘 설정해야 한다. 이 설정이 맞지 않으면, 최종 단계에서 Offset이 발생 할 수 있다.

또한, 이 Width는 이미지 파일의 Width가 아닌, **인쇄된 이미지의 가로길이**임을 주의하라.

### 4-3.  Database 다운로드

![image](https://user-images.githubusercontent.com/40852277/103186342-8af56680-4903-11eb-8ecd-d0c7b24a0039.png)

Target Image를 추가하고 잠시 기다리면, Status가 ```Active```가 되면서 사용이 가능해지는 것을 볼 수 있다.

동시에, Rating이라는 항목에 별이 매겨지게 되는데, 이 별이 많을수록 인식이 잘 될 가능성이 높다는 뜻이다.

![image](https://user-images.githubusercontent.com/40852277/103186515-1e2e9c00-4904-11eb-8862-3eab5b896023.png)

이미지 특징을 추출하는 과정에서, 복잡하고 특징이 많은 이미지 일 수록 판단하기 쉽고,

밋밋하고 단조로운 이미지일 수록 특징을 추출할게 별로 없어 판단하기 어렵기 때문이다.

데이터베이스를 다운 받기 위해 ```Download Database (All)```을 눌러준다.

그럼 창이 하나 뜨는데, Unity Editor를 선택하고 Download를 눌러준다.

<hr>

## 5. Import database

### 5-1.  데이터 베이스 패키지 임포트

다운받은 ```[데이터베이스 이름].unitypackage```를 Unity ```Project``` 윈도우에 드래그 & 드랍하고,

모두 선택하여 Import를 눌러준다.

### 5-2. Image Target 오브젝트 배치

![image](https://user-images.githubusercontent.com/40852277/103186733-06a3e300-4905-11eb-9bbd-42da6f6e1cdc.png)

```Scene Hierarchy```에서 마우스 우클릭으로 ```Vuforia Engine > Image```를 눌러 Target Image를 만들어준다.

![image](https://user-images.githubusercontent.com/40852277/103186806-584c6d80-4905-11eb-945d-52f172fb4ced.png)

그럼 아까 만들었던 Image Target이 나타난 모습을 볼 수 있다.

이 Image 위에 Cube 임시로 올려주었다.

<hr>

## 6. Debug Setting

### 6-1. 웹캠 세팅

![image](https://user-images.githubusercontent.com/40852277/103186927-cdb83e00-4905-11eb-95b2-4f68996ec5bd.png)

```Scene Hierarchy```의  ```MixedRealityPlayspace > Main Camera > Vuforia Behaviour > Open Vuforia Engine configuration```을 누른다.

```Webcam```항목에서 자신의 웹캠이 잘 선택되어 있는지 확인해야 한다.

<hr>

## 7. 머징 완료

![ezgif-5-6766574f0a73](https://user-images.githubusercontent.com/40852277/103187577-31436b00-4908-11eb-90f5-b93ac1ce34b2.gif)

<br>
<br>

# 2021.01.12 추가

테스트 결과 Unity Editor 상에서는 잘 동작하지만, 실제로 빌드하여 HoloLens에 올리면 잘 동작하지 않는다.

확인해보니 MRTK의 ```Camera System```과 충돌하여 그런 듯 하다.

임시 방편으로는 ```MixedREalityToolkit``` 오브젝트의 ```MixedRealityToolkit``` 컴포넌트에서

카메라 항목에 들어가 ```Enable Camera System```의 체크박스를 해제하면 동작하긴 한다.

![image](https://user-images.githubusercontent.com/40852277/104258877-a9429100-54c3-11eb-817f-503960a9de79.png)

카메라 시스템에 대한 내용은 [공식 문서](https://microsoft.github.io/MixedRealityToolkit-Unity/Documentation/CameraSystem/CameraSystemOverview.html)를 참고하면 좋다.

아래는 Vuforia를 사용하여 만든 간단한 카드 AR 어플리케이션.

![KakaoTalk_20210112_105031010](https://user-images.githubusercontent.com/40852277/104259086-0c342800-54c4-11eb-9ad3-8dfbcba19b7e.gif)

[Pinterest의 이 영상](https://www.pinterest.co.kr/pin/606086062351979970/)을 보고 감동받아서 짧게 따라해 보았다.


<br>
<br>
