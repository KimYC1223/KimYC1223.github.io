---
layout: post
type: tech
date: 2019-11-12 13:12
category: Blog
title: HoloLens 컨트롤러 UI 문제 해결
subtitle: 기존 UI에 존재하는 가시성 이슈를 해결하였다.
writer: KimYC1223
post-header: false
image: /img/title.png
hash-tag: [MixedReality]
---

기존의 3D Object를 꺼내오는 방식으로, 캐비넷 모양의 Parts Model Library와 4 X 2 그리드 테이블인 Hyundai Model Library가 있었다.

오브젝트를 불러오는 객체가 2개나 존재해 Scene이 지저분해 졌고, 무엇보다 두 UI가 기존의 UI와 차이가 컸다.

UI의 차이점은 통일감을 방해하는 요인으로 작용된다고 판단했으며,

이를 수정하여 통일성과 직관성을 높이고자 하였다.

# 변경 후

일단 기존의 UI를 변경하여 다음과 같은 UI로 변경하였다.

![image](https://user-images.githubusercontent.com/40852277/68570989-401d5300-04a5-11ea-9354-4c7259584388.png)

위 Library Window는 다음과 같이 LibraryHandler.cs에 의해 작동하게 된다.

![01](https://user-images.githubusercontent.com/40852277/68571006-49a6bb00-04a5-11ea-8278-3dc65a842a5b.png)

![02](https://user-images.githubusercontent.com/40852277/68571017-4d3a4200-04a5-11ea-8141-d52359976733.png)

| 변수명 | 타입 | 설명 |
|:---:|:---:|:---:|
| ActiveBtns | sprite[] | 커서가 올라갔을 때 보여지는 Sprite |
| InactiveBtns| sprite[] | 커서가 올라가있지 않을 때 보여지는 Sprite |
| NullBtn | sprite | 표현 할 정보가 없을 때 보여지는 Sprite |
| Texts | Text[] | UI 버튼의 Text / 길이 4 |
| Btns | ARButton[] | UI 버튼의 ARButton / 길이 4 |
| BtnsSprite | SpriteRenderer[] | UI 버튼의 SpriteRenderer / 길이 4 |
| Objects | GameObject[] | Library를 통해 꺼내올 오브젝트들 |
| ObjectNames | string[] | Library를 통해 꺼내올 오브젝트들의 이름들 |
| Tabs | Image[] | Hyundai 부품, BCU 모델 부품 탭 |

<br><br>
