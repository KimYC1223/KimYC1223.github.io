---
layout: post
type: tech
date: 2019-11-18 04:42
category: Blog
title: 외부 네트워크에서 Docker Swarm 연결하기
subtitle: Docker Swarm을 외부 인터넷에서 연결 할 수 있도록하는 포트포워딩 작업
writer: KimYC1223
post-header: true
image: /img/title.png
header-img: /tech/1911180442/img/bg.png
hash-tag: [ToyProject]
---

Docker Swarm은 도커가 공식적으로 만든 오케스트레이션 툴이며,

오케스트레이션 툴이란 여러 호스트 서버의 컨테이너들을 배포 및 관리를 위한 툴이다.

따라서 Docker Swarm을 쉽게 말하면 쿠버네티스를 대신할 도커에서 만든 컨테이너 관리를 위한 툴이다.

오케스트렐이션 툴은 컨테이너 배포뿐만 아니라 다양한 기능을 포함한다.

- 컨테이너 자동 배치 및 복제
- 컨테이너 그룹에 대한 로드밸런싱
- 컨테이너 장애 복구
- 클러스터 외부에 서비스 노출
- 컨테이너 추가 또는 제거를 이용한 확장 및 축소
- 컨테이너 서비스간의 인터페이스를 통한 연결 및 네트워크 포트 노출 제어

Docker Swarm의 장점은 아래와같다.

- 여러개의 Docker 호스트를 함께 클러스터링하여 단일 가상 Docker 호스트 생성
- 호스트 OS에 Agent만 설치하면 간단하게 작동하고 설정이 쉽고 Agent를 외부에 설치하지 않는다.
- Docker명령어와 Compose를 그대로 사용가능

컨테이너 오케스트레이션 도구에는 Docker Swarm뿐만 아니라 KUBERNETES, APACHE MESOS 등이 있다.

# 다른 네트워크 컴퓨터와 연결하기

보통 ``` sudo docker swarm init ``` 을 하면  다음과 같은 형태의 메세지가 출력된다.

```
docker swarm join --token SWMTKN-
-4xtelv38m4ide4rbe3jljv0s2sh73miup6v449sqosk2zy7yye-dwgz4xw77hrkipus7v3vnkuhe
192.168.0.10:2377
```

이 때, 맨 마지막의 아이피와 포트번호는 swarm의 호스트 주소로써,

local IP Address를 사용하기 때문에 같은 공유기 내에서

해당 명령어를 입력하여 접근이 가능하다.

그럼 다른 네트워크에서는 어떻게 해야할까?

포트포워딩을 사용하면 된다.

---

# 포트 포워딩

포트 포워딩에 대한 자세한 내용은 아래 유튜브로 대체한다.

모르면 시청하길 바란다.

[![image](https://user-images.githubusercontent.com/40852277/69009150-0ca36280-0996-11ea-8b44-a959e4b6a8a8.png)](https://www.youtube.com/watch?v=XT_jt0CmBbU)

따라서, 외부에서 192.168.0.10:2377로 접속하고 싶으면

해당 공유기에서 자신에게 오는 2377포트를 내부 192.168.0.10 기기의 2377포트를

포워딩 시켜주면 되는 것이다.

일단, 네트워크의 게이트웨이로 접근해서 공유기 설정을 바꿔주어야 한다.

VM ware IP가 192.168.0.10/24 이므로 게이트웨이는 192.168.0.1이다.

접속해서 포트포워딩 설정을 다음과 같이 보여준다.

![image](https://user-images.githubusercontent.com/40852277/69009243-ecc06e80-0996-11ea-8f76-dfb4b01c3d29.png)

2377포트로 연결해준 이유는 ```docker swarm init``` 명령의 결과에서 2377포트로 연결하기 때문이다.

**이렇게 설정을 해 줌으로써, 외부에서 2377포트로 접근하게 되면 VM ware의 2377 포트와 연결된다.**

또한 찾아보니 내 공유기 ( 영찬의 자취방 공유기 ) 주소는

![image](https://user-images.githubusercontent.com/40852277/69009203-86d3e700-0996-11ea-9525-6ac22fb2a0e7.png)

211.217.202.115이다.

이제 211.217.202.115:2377 로 접근하게 될 경우, 자취방의 192.168.0.10:2377 로 연결될 것이다.

---

# 테스트

다음과 같은 환경을 구현한다.

![image](https://user-images.githubusercontent.com/40852277/69009376-ec74a300-0997-11ea-8572-2c27cb810eb8.png)

아래 사진처럼, 데스크탑은 이더넷으로 (유선) 공유기와 물려있으며,

![image](https://user-images.githubusercontent.com/40852277/69009422-58efa200-0998-11ea-89c3-a11f0143f789.png)

노트북은 와이파이로 (무선) 핫스팟과 연결되어 있는 상황이다.

![image](https://user-images.githubusercontent.com/40852277/69009433-6efd6280-0998-11ea-860e-92546fb43c11.png)



일단 blockchain, 즉 데탑에서 ```sudo docker swarm init``` 을 한다.

그럼 다음처럼 나온다.

![image](https://user-images.githubusercontent.com/40852277/69009390-0dd58f00-0998-11ea-8fc5-86b2e92e66b2.png)

하는 방법은 똑같이 이걸 다른 컴터에 붙혀 넣으면 되는데,

주의할 점은 192.168.0.10이 아니라, 외부에서 접속 할 수 있도록

192.168.0.10을 211.217.202.115 로 바꿔서 입력해준다.

![image](https://user-images.githubusercontent.com/40852277/69009461-b08e0d80-0998-11ea-9e64-5af8746d77f9.png)

그럼 놀랍게도 Join이 된다.

![image](https://user-images.githubusercontent.com/40852277/69009505-111d4a80-0999-11ea-859c-2a61459c5b78.png)

다시 데스크탑으로 돌아와서, swarm의 상태를 확인하는 명령어인 ```sudo docekr node ls```를 입력하면

아래처럼 잘 붙어있는 모습을 확인 할 수 있다.

![image](https://user-images.githubusercontent.com/40852277/69009531-4de94180-0999-11ea-8217-dc83763fa36a.png)

---

# 참고

포트포워딩은 swarm의 관리자, 즉 ```sudo docker swarm init```을 입력한 컴퓨터만 해주면 된다.

즉, 이번 실험에서 나는 핸드폰에서의 포트포워딩 설정까진 해주지 않았다.

<br>

<br>

<br>
