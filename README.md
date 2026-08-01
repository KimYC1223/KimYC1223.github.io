![Logo](https://github.com/KimYC1223/KimYC1223.github.io/blob/master/meta/android-icon-144x144.png?raw=true)

# 김영찬의 개발 블로그

[🗺 Git Blog Link : https://kimyc1223.github.io](https://kimyc1223.github.io/)

해당 블로그는 [GitHub Pages](https://pages.github.com/)와 [Jekyll](https://jekyllrb.com/)을 사용하여 퍼블리싱하였으며, 

마크다운 문법을 사용하여 글을 작성합니다.

해당 문서에서는 Jekyll 기반의 블로그 운영을 위한 환경구성 방법부터

마크다운 작성을 통한 블로그 포스팅 방법 등을 설명합니다.

----

## 📖 목차

- [환경구성](#️-환경구성)
  1. [사전 요구사항](#사전-요구사항)
  2. [프로젝트 clone](#프로젝트-clone)
  3. [Ruby 설치](#ruby-설치)
  4. [의존성 설치](#의존성-설치)
  5. [로컬에 블로그 실행](#로컬에-블로그-실행)

- [프로젝트 구조](#-프로젝트-구조)

- [블로그 포스팅](#️-블로그-포스팅)
  1. [Typora 설치 (옵션)](#typora-설치-옵션)
  2. [테크노트 작성](#테크노트-작성)
  3. [소소한 이야기 작성](#소소한-이야기-작성)

- [배포](#-배포)

- [문제 해결](#-문제-해결)
  
----
  
## ⚙️ 환경구성

### 사전 요구사항

| 항목 | 권장 버전 | 비고 |
| --- | --- | --- |
| Ruby | **3.3.x** | GitHub Pages 빌드 서버와 동일한 버전. 아래 ⚠️ 참고 |
| Bundler | 2.x 이상 | Ruby 설치 시 함께 들어옵니다 |
| Git | 최신 버전 | |

> ### ⚠️ Ruby 버전을 반드시 맞춰주세요
>
> 이 블로그는 `Gemfile`에서 `jekyll`을 직접 지정하지 않고 **`github-pages` gem**을 사용합니다.
>
> `github-pages`가 Jekyll · Liquid · kramdown 버전을 전부 고정하기 때문에, 실제로 동작하는 Jekyll은 **3.x 계열**입니다.
>
> 그런데 `github-pages`의 의존 gem인 `commonmarker`가 **Ruby 4.0 미만**만 지원하고, Jekyll 3.x는 Ruby 3.4에서 표준 라이브러리에서 빠진 `csv`를 요구합니다.
>
> 그래서 Ruby 3.4 이상 / 4.x 환경에서는 아래와 같은 일이 벌어집니다.
>
> - `bundle install`은 **성공한 것처럼 보입니다.** (bundler가 조용히 구버전 `github-pages 223`으로 내려가서 해결하기 때문)
> - 하지만 `bundle exec jekyll serve` 실행 시 `undefined method 'tainted?' for an instance of String` 오류로 빌드가 실패합니다.
>   (구버전이 끌고 온 `liquid 4.0.3`이, Ruby 3.2에서 삭제된 `String#tainted?`를 호출합니다.)
>
> **Ruby 3.1 ~ 3.3 범위를 사용하시고, 그 중 GitHub Pages 실 빌드 환경과 같은 3.3.x를 권장합니다.**

> ### ⚠️ `github-pages` 버전도 확인해주세요
>
> Ruby 버전을 3.3.x로 맞춰도, **`Gemfile.lock`이 없는 상태에서 `bundle install`을 하면 bundler가 `github-pages 223`(Jekyll 3.9.0 + Liquid 4.0.3)으로 해결합니다.**
>
> `Gemfile.lock`은 `.gitignore` 대상이라 새로 clone 받을 때마다 이 상황이 발생하며, 결국 Ruby 버전이 맞아도 `tainted?` 오류를 보게 됩니다.
>
> 정상 동작하는 조합은 **`github-pages 232`(Jekyll 3.10.0 + Liquid 4.0.4)** 입니다. 아래 중 하나로 맞춰주세요.
>
> - (권장) `Gemfile`에서 버전을 고정합니다. → `gem "github-pages", "~> 232", group: :jekyll_plugins`
> - 또는 설치할 때마다 명시적으로 올려줍니다. → `bundle update github-pages`
>
> 설치 후 `grep "github-pages (" Gemfile.lock` 으로 `232`가 잡혔는지 확인할 수 있습니다.

### 프로젝트 clone

터미널에서 `git clone git@github.com:KimYC1223/KimYC1223.github.io.git` 명령어를 입력하여

프로젝트를 clone 받습니다.

만약 위 명령어를 입력했을 때 git을 찾을 수 없다는 오류가 발생한다면,

git 공식 사이트([Windows](https://git-scm.com/download/win), [macOS](https://git-scm.com/download/mac))에서 git을 설치한 뒤 터미널을 재실행하여 재시도해봅니다.

### Ruby 설치

#### macOS

macOS에 기본 탑재된 시스템 Ruby는 버전이 낮고 쓰기 권한이 막혀 있어 사용하지 않습니다.

(`sudo gem install ...` 로 시스템 Ruby에 gem을 설치하는 방식은 권한 문제와 버전 충돌을 일으키므로 피해주세요.)

버전 관리자인 `rbenv`를 사용하여 필요한 버전만 따로 설치합니다.

```shell
# rbenv 설치
$ brew install rbenv ruby-build

# 셸 설정에 rbenv 초기화 구문 추가 (zsh 기준, 최초 1회)
$ echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc
$ source ~/.zshrc

# Ruby 설치 및 프로젝트에 적용
$ rbenv install 3.3.6
$ cd KimYC1223.github.io
$ rbenv local 3.3.6     # 프로젝트 폴더에 .ruby-version 파일이 생성됩니다

# 확인
$ ruby -v
ruby 3.3.6 ...
```

> `rbenv init` 구문은 **새로 여는 셸부터** 적용됩니다.
>
> 이미 열어둔 터미널 탭에서는 `ruby -v`가 계속 예전 버전으로 나오고,
>
> Homebrew Ruby가 잡힌 채로 `bundle exec jekyll serve`를 실행하면 `cannot load such file -- csv` 오류가 납니다.
>
> `which ruby` 결과가 `~/.rbenv/shims/ruby`가 아니라면 **터미널을 새로 열고** 다시 시도해주세요.

#### Windows

1. [루비 공식 다운로드](https://rubyinstaller.org/downloads/)에서 **Ruby+Devkit 3.3.x (x64)** 버전을 다운로드 & 실행합니다.
2. Agree - 다음 - 다음 - 설치 - 완료 후, `Run 'ridk install'` 체크박스를 체크한 상태로 Finish 합니다.
3. 자동으로 실행된 cmd 창에서 그냥 `ENTER`(기본값 `1,3`)를 입력합니다. → MSYS2 및 개발 툴체인 설치가 끝나면 `ENTER`를 한 번 더 입력하여 창을 닫습니다.
4. 커맨드창을 새로 실행하여 `ruby -v` 입력 시 `ruby 3.3.x` 가 출력되면 정상적으로 설치된 것입니다.

### 의존성 설치

Jekyll을 전역에 설치(`gem install jekyll`)하지 않습니다.

전역 Jekyll은 4.x가 설치되는데, 이 블로그가 실제로 사용하는 버전은 `github-pages`가 고정한 3.x이므로

전역 Jekyll로 실행하면 **로컬 결과와 실제 배포 결과가 달라집니다.**

프로젝트 경로에서 아래 명령어로 `Gemfile`에 정의된 gem들만 설치합니다.

```shell
# 프로젝트 경로로 이동
$ cd KimYC1223.github.io

# bundler 설치 (이미 있다면 생략)
$ gem install bundler

# Gemfile 기준으로 의존성 설치
$ bundle install

# github-pages 가 232 로 잡혔는지 확인 (223 이면 빌드가 실패합니다)
$ grep "github-pages (" Gemfile.lock
    github-pages (232)

# 223 으로 잡혔다면
$ bundle update github-pages
```

`bundle install`이 끝나면 `Gemfile.lock`이 생성됩니다.

이 파일은 `.gitignore`에 포함되어 있으므로 커밋하지 않습니다.

### 로컬에 블로그 실행

```shell
# 블로그 서버 실행 (반드시 bundle exec 를 붙여주세요)
$ bundle exec jekyll serve

# 파일 저장 시 브라우저까지 자동 새로고침 하고 싶다면
$ bundle exec jekyll serve --livereload
```

위 과정에서 오류가 없었다면, 브라우저를 열어 [http://127.0.0.1:4000/](http://127.0.0.1:4000/)로 접속 시 로컬에서 블로그가 실행되는 것을 볼 수 있습니다.

알아두면 좋은 점들입니다.

- `_posts`, `_data`, `_includes` 등의 파일을 수정하면 자동으로 다시 빌드됩니다.
- 단, **`_config.yml`은 자동 반영되지 않습니다.** 수정했다면 서버를 껐다가 다시 실행해주세요.
- `_config.yml`의 `future: false` 설정 때문에 **작성일이 미래인 포스트는 로컬에서 보이지 않습니다.** 미리 확인하려면 `bundle exec jekyll serve --future` 로 실행합니다.
- `jekyll-admin` gem이 포함되어 있어, 서버 실행 중 [http://127.0.0.1:4000/admin](http://127.0.0.1:4000/admin) 으로 접속하면 웹 UI에서도 글을 관리할 수 있습니다.

#### 모든 설정이 완료되었습니다! 🎉

앞으로는 `bundle exec jekyll serve` 명령어를 실행하는 것만으로도 손쉽게 블로그를 실행할 수 있습니다.

----

## 📂 프로젝트 구조

글을 쓰거나 수정할 때 실제로 건드리게 되는 폴더들입니다.

```
├── _posts/         # 테크노트 포스트 원본 (YYYY-MM-DD-TechPost.md)
├── assets/blog/    # 포스트별 이미지 (YYYY-MM-DD-TechPost/ 폴더 단위)
├── _data/          # 태그, 프로필, 소소한 이야기 등 데이터 파일 (YAML)
│   ├── mention.yml     # 소소한 이야기 글 목록
│   ├── tags.yml        # 테크노트에서 사용 가능한 태그 목록
│   ├── career.yml      # 프로필 - 경력
│   └── ...             # 프로필 - 학력 / 프로젝트 / 스택 등
├── life/           # 소소한 이야기 페이지 (img/ 에 첨부 사진)
├── tech/           # 테크노트 목록 페이지
├── profile/        # 프로필 페이지
├── _layouts/       # 페이지 레이아웃 (main, post)
├── _includes/      # 재사용 컴포넌트 (nav, 포스트 카드, mention 등)
├── _sass/          # 스타일 시트
└── _config.yml     # 사이트 전역 설정
```

> `tech`와 `life`는 **글을 담는 폴더가 아니라 목록을 보여주는 페이지 폴더**입니다.
>
> 실제 테크노트 원고는 `_posts/`에, 소소한 이야기는 `_data/mention.yml`에 들어갑니다.

----

## ✍️ 블로그 포스팅

### Typora 설치 (옵션)

마크다운 제너레이터 없이도 마크다운을 잘 작성한다면 설치하지 않아도 무관하나,

우리는 도구를 사용하는 영장류이기 때문에 툴을 사용하면 좋습니다.

[Typora](https://typora.io/) 공식 사이트에 접속하여 프로그램을 설치합니다.

### 테크노트 작성

#### 1. 파일 생성

`_posts/` 폴더에 **`YYYY-MM-DD-TechPost.md`** 형식으로 파일을 만듭니다.

파일명 규칙은 반드시 지켜야 합니다. 레이아웃이 포스트 날짜로부터 이미지 경로를 계산하기 때문에,

`-TechPost` 접미사나 날짜 형식이 어긋나면 **썸네일과 본문 이미지가 전부 깨집니다.**

#### 2. 이미지 폴더 생성

`assets/blog/YYYY-MM-DD-TechPost/` 폴더를 만들고 이곳에 이미지를 넣습니다. (포스트 파일명과 동일한 폴더명)

목록에 노출될 썸네일 이미지(관례상 `title.png`)를 함께 넣어줍니다.

#### 3. Front matter 작성

문서 최상단에 아래와 같이 작성합니다.

```yaml
---
layout: post
pagination: 
  enabled: true
type: tech                                # tech 고정
date: 2026-03-06 21:56                    # 파일명의 날짜와 일치시켜 주세요
category: Blog
title: "2026 Unity GDC 요약"               # 목록/상세에 노출될 제목
subtitle: "2026년 새롭게 소개된 ..."         # 목록에 노출될 한 줄 설명
writer: KimYC1223                         # _data/members.yml 의 id
post-header: false                        # true 로 하면 상단 배경 헤더 사용
# header-img: bg.png                      # post-header 가 true 일 때 사용할 이미지
image: title.png                          # 목록 카드 썸네일 (이미지 폴더 기준 파일명)
tags: [Unity]                             # _data/tags.yml 에 등록된 태그만 필터링됩니다
draft : false                             # true 면 목록에 "Coming Soon" 으로 표시
---
```

#### 4. 본문 작성

이미지 경로는 아래 구문을 front matter 바로 다음에 한 번 선언해두고 재사용하면 편합니다.

```liquid
{% capture img_url %}/assets/blog/{{page.date | date: "%Y-%m-%d"}}-TechPost{% endcapture %}

<img src="{{img_url}}/img_01.png" style="width:900px; max-width:100%">
```

#### 5. 태그 등록

새로운 태그를 사용했다면 `_data/tags.yml`에도 추가해주세요.

여기에 없는 태그는 테크노트 상단의 태그 필터에 나타나지 않습니다.

```yaml
- Unity
- C_Sharp
- MixedReality
```

#### 6. 확인

블로그 서버가 실행되어 있다면 저장하는 즉시 다시 빌드되므로, 브라우저에서 바로 확인할 수 있습니다.

### 소소한 이야기 작성

소소한 이야기는 마크다운 파일이 아니라 **`_data/mention.yml`에 항목을 추가**하는 방식입니다.

1. 사진이 있다면 `life/img/` 폴더에 넣습니다. 파일명은 `YYYYMMDDnn.jpg` 형식을 사용합니다.
   (사이트 전체에서 파일명(확장자 제외)으로 이미지를 찾기 때문에, **다른 이미지와 겹치지 않는 이름**이어야 합니다.)
2. `_data/mention.yml`의 **맨 위에** 새 항목을 추가합니다. (최신 글이 위로 오도록 정렬되어 있습니다.)

```yaml
- writer: KimYC1223                       # _data/members.yml 의 id
  date: 2026-07-31 19:00
  title : 쿠키런 크럼블 앱스토어 인기순위 1위 달성!
  message: 본문입니다.<br />줄바꿈은 &lt;br /&gt; 로, 링크는 &lt;a class="hyperlink" href="..."&gt; 로 작성합니다.
  emoji : 🍪                               # 타임라인에 표시될 이모지
  media:
    - type: photo
      name: 2026073101                    # life/img/2026073101.jpg (확장자 제외)
    - type: video
      name: GHzrRICVlbc                   # 유튜브 video id
      t: 0                                # 시작 시간(초), 생략 가능
```

---- 

## 🚀 배포

이 저장소는 별도의 CI 없이 **GitHub Pages의 기본 빌드**를 사용합니다.

`master` 브랜치에 push하면 GitHub이 알아서 Jekyll 빌드 후 [https://kimyc1223.github.io](https://kimyc1223.github.io/)에 반영합니다. (보통 1분 내외)

- 커밋 전 반드시 로컬에서 `bundle exec jekyll serve`로 빌드 오류가 없는지 확인해주세요. 빌드가 실패하면 사이트가 이전 상태로 남고, GitHub에서 메일로 실패 알림이 옵니다.
- `_site/`와 `Gemfile.lock`은 `.gitignore` 대상이므로 커밋하지 않습니다.
- 도메인 설정은 `CNAME` 파일이 담당합니다.

---- 

## 🩺 문제 해결

| 증상 | 원인 및 해결 |
| --- | --- |
| `undefined method 'tainted?' for an instance of String` | `github-pages 223`이 끌고 온 구버전 Liquid(4.0.3)가 Ruby 3.2에서 삭제된 API를 호출하는 경우입니다. `bundle update github-pages`로 **232**로 올려주세요. |
| `cannot load such file -- csv` | Ruby 3.4 이상 / 4.x가 잡혀 있습니다. `which ruby`가 `~/.rbenv/shims/ruby`인지 확인하고, 아니라면 **터미널을 새로 열어** 다시 시도합니다. (rbenv 설정 전에 열어둔 탭에서 자주 발생합니다) |
| `ruby -v`가 계속 예전 버전으로 나옴 | `~/.zshrc`에 `eval "$(rbenv init - zsh)"`가 있는지 확인하고, **새 터미널**에서 실행합니다. 기존 탭에서는 `exec zsh`로도 갱신할 수 있습니다. |
| `Could not find compatible versions ... requires Ruby >= 2.6, < 4.0` | Ruby 4.x를 사용 중입니다. Ruby 3.3.x를 설치해주세요. |
| `cannot load such file -- webrick` | `bundle exec` 없이 실행했을 가능성이 높습니다. `bundle exec jekyll serve`로 실행해주세요. |
| `Address already in use - bind(2) for 127.0.0.1:4000` | 이미 다른 Jekyll 서버가 떠 있습니다. 해당 프로세스를 종료하거나 `bundle exec jekyll serve --port 4001`로 실행합니다. |
| 새로 쓴 글이 목록에 보이지 않음 | ① 파일명이 `YYYY-MM-DD-TechPost.md` 형식인지 ② front matter의 `type`이 `tech`인지 ③ 작성일이 미래는 아닌지(`--future` 옵션 필요) 확인합니다. |
| 썸네일/본문 이미지가 깨짐 | 이미지 폴더명이 `assets/blog/{파일명과 동일한 이름}/`인지, front matter의 `date`가 파일명의 날짜와 같은지 확인합니다. |
| 태그 필터에 태그가 안 보임 | `_data/tags.yml`에 해당 태그를 추가했는지 확인합니다. |
| `_config.yml`을 고쳤는데 반영되지 않음 | `_config.yml`은 자동 반영되지 않습니다. 서버를 재시작해주세요. |

---- 

