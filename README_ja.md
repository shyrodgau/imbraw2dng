<!-- SPDX-License-Identifier: 0BSD -->
<!-- pandoc -f markdown -t html -o README.html README.md -->
# imbraw2dng - [I'mBack<sup>&reg;</sup>](https://imback.eu) 35/MF/Film の RAW ファイルを DNG に変換します。

このツールのほとんどはフリーソフトウェア ([0 条項 BSD ライセンス](LICENSE.txt)) であり、商用サポートは提供されていません。

または[deutsch&#x1f1e9;&#x1f1ea;](https://shyrodgau.github.io/imbraw2dng/README_de)   
or  [english&#x1f1ec;&#x1f1e7;](https://shyrodgau.github.io/imbraw2dng/README)   
 [**&rarr;MiMi&larr;**](https://shyrodgau.github.io/imbraw2dng/README_MiMi_ja)


## ここで何が見つかるか

[はじめよう](#getstarted) - [使い方](#usage) - [DNGの処理](#processingdng) - [メタデータ/Exif](#metaexif) - [クレジット](#credits) - その他

- [**&#x261e;**`imbapp.htm`](https://shyrodgau.github.io/imbraw2dng/imbapp.htm) - アプリのようなコンバーターブラウザからハードディスク、インターネット、またはImBから直接ダウンロードできます。
`imbapp_XX.htm` として複数の言語でダウンロードすることもできます（[国際化](#internationalization) を参照）。
dngからrawへの逆変換も可能です。

- [**&#x261e;**`imbapp.apk`](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) - 本物のAndroidアプリです。Appleの場合は[こちら](#iphone) を参照してください。

- [**&#x261e;**`imbraw2dng.js`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) - コマンドライン用Node.jsバージョン
`imbraw2dng_XX.js`として他言語版も公開されています([国際化](#internationalization)を参照)

<!-- - [**&#x261e;**`imbraw2dng.html`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) - 旧バージョン
`imbraw2dng_XX.html`として他言語版も公開されています([国際化](#internationalization)を参照)-->

- キャリブレーション済みの[ダウンロード用カメラプロファイル](https://shyrodgau.github.io/imbraw2dng/profiles/README) ImBの場合

- [**&#x261e;**`imbdng2raw.html`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html)、[**&#x261e;**`imbdng2raw.js`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js) DNGからRAWへの逆変換。これらのツールで変換されたオリジナルDNGのみ対象です。

ImB RAWは厳密には「白黒RAW」ではなく、実際にはカラーフィルタ処理（残念ながら35mmとMFでは8ビット深度、FilmとMiMiでは12ビット深度）を含むRAWセンサーデータです。

DNG（Adobe® Digital Negative）はオープンフォーマットで、主にオリジナル画像の走査線で構成されています。
MFまたはフィルムのImBの場合、カラーフィルタ配列は異なります。

問題やアイデアについては、[github リポジトリ](https://github.com/shyrodgau/imbraw2dng) の「[Issues](https://github.com/shyrodgau/imbraw2dng/issues)」または「[Discussions](https://github.com/shyrodgau/imbraw2dng/discussions)」タブ、または [Facebook の I'm Back ユーザーグループ](https://www.facebook.com/groups/1212628099691211) でも議論できます。

## <a name="getstarted" id="getstarted"> </a>はじめよう

**Android** をご利用の場合は、Android デバイスを ImB Wi-Fi に接続し、[Android アプリ](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) をお試しください。

PCまたはスマートフォンの**ブラウザ**で使用したい場合は、以下の選択肢があります。

- [**&#x261e;**`IMBAPP.HTM`](https://shyrodgau.github.io/imbraw2dng/imbapp.htm) をインターネットから直接使用するか、ハードディスクまたはメモリの任意の場所にコピーします。
(すべてのデータはブラウザ内に保存されます！)
一部のブラウザ（モバイル版も含む）では、オフラインで簡単に使用できるように、PortableWebAppとしてインストールできます。「デスクトップに追加」という名前で表示されるか、隠れている場合もあります。
この場合、ImBからファイルを転送するか、USB、アダプター、元のImBアプリなどを介してMicroSDカードにアクセスする必要があります。

- <a name="browsing-on-the-imback" id="browsing-on-the-imback"> </a>そのファイルをMicroSDカードの`IMBACK`フォルダに直接コピーすると（[やり方は？](#how-do-i-copy-html-files-to-the-microsd)）、ダウンロードとDNGへの変換を直接組み合わせることができます。（動画やJPGもダウンロードできます）
`http://192.168.1.254/IMBACK/IMBAPP.HTM`（時計の設定、動画の録画、写真撮影も可能です！）
ページを開くデバイスは、ImBのWi-Fiに接続されている必要があります。

**コマンドライン**を使用する場合は、node.jsで[imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js)を使用できます。デバイスのWi-Fiに接続していれば、ImBにアクセスすることもできます。
[コマンドラインヘルプ](#command-line-using-nodejs)

## <a id="how-do-i-copy-html-files-to-the-microsd" name="how-do-i-copy-html-files-to-the-microsd"></a>HTMLファイルをMicroSDにコピーするにはどうすればよいですか？

…ImBからブラウザで直接ダウンロード/変換したい場合。

#### Androidの場合

[実際のアプリ](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk)をインストールし、ImB Wi-Fiにアクセスして追加メニューを使用してください。

#### Micro SDリーダー/アダプターまたはUSBケーブルを使用する 

Micro SDカードを取り出し、コンピューターまたはスマートフォンのMicro SDアダプターに挿入するか、ImBをUSB経由でPCに接続し、ImBで「大容量ストレージ」を選択します。   
Micro SD/USBドライブの内容を開きます。「VOLUME1」または「0000-0001」という名前になっている場合があり、「imback」または「IMBACK」という名前のフォルダが表示されます。   
オペレーティングシステムまたはファイルエクスプローラーを使用して、[ダウンロードしたファイル[`imbapp.htm`](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbapp.htm)を「imback」または「IMBACK」フォルダにコピーします。    
Micro SD をコンピューターまたはスマートフォンから取り出し、デバイスに挿入します。準備完了です!    

#### ネットワーク経由
スマートフォンまたは PC を ImB Wi-Fi に接続します。   
新しいブラウザウィンドウまたはタブで、[http://192.168.1.254/IMBACK/](http://192.168.1.254/IMBACK/) にアクセスします。    
[ファイルを選択] をクリックし、先ほどダウンロードした [`imbapp.htm`](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbapp.htm) を選択します。 「ファイルをアップロード」をクリックしてください（文言を確認する必要があります） - 準備完了！    

## <a id="usage" name="usage"> </a>使用方法

I'm back（PCに挿入されたmicroSDカードまたはUSBマスストレージ）から、すべてのディレクトリまたはファイルを青いフィールドにドラッグ＆ドロップできます。そうすると、RAW以外のファイルがすべてコピーされ、RAWファイルはDNG形式に変換され、`.raw`/`.RAW`ファイル拡張子が`.dng`に置き換えられます。「ファイルを選択」ボタンを使用すると、RAWファイルを直接選択できます。

ブラウザはダウンロード設定に従ってダウンロードを行います。設定によっては、ファイルごとに保存場所を選択するダイアログが表示される場合もあれば、
設定によってはすべてのファイルがダウンロードディレクトリ（場合によっては名前が変更される）に保存される場合もあります。

Androidアプリを使用する場合、またはブラウザでI'm backのコンバーターページに直接アクセスする場合は、直感的に操作できるはずです。そうでない場合は、お知らせください。

DNGへの変換では、ファイル名が「I'm Back」ファイル名として適切と思われる場合はタイムスタンプタグが設定され、
OriginalRawFilename はRAW入力ファイル名に設定されます。これにより、元の情報をあまり失うことなく、DNGファイルに好きな名前を付けることができます。

DNGから元のRAW画像に戻す必要がある場合（例：一度も変換したことのない画像で再度変換する場合）は、<a href="#revert-to-raw">こちら</a>をご覧ください。

![](https://shyrodgau.github.io/imbraw2dng/helpstuff/usercontrols.png "ユーザーコントロール")

1: <span style="font-weight:bold;">&#x22ee;</span> メニュー    
2: バッテリーレベル（ImB接続時）    
3: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f5d1;&#xfe0e;</span> 選択項目の削除（ImB接続時）    
4: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x2b73;&#xfe0e;</span> 選択項目のダウンロード/変換    
5: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f3d4;&#xfe0e;</span> 画像ブラウザ（ファイル読み込み時）    
6: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f4f7;&#xfe0e;</span> 写真撮影（ImB接続時）    
7: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f4fd;&#xfe0e;</span> ビデオを撮影する（ImB に接続している場合）    
8: グループ化（画像ブラウザのみ）    
9: 並べ替え（画像ブラウザのみ）    
10: すべて選択/なし選択（画像ブラウザのみ）    
11: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f5c2;&#xfe0e;</span> ファイル選択（ImB に接続していない場合。アプリとのファイル共有はいつでも可能です）    
12: &#x2b73;&#xfe0e; ダウンロード/変換    
13: &#x2b6e;&#xfe0e; 時計回りに回転（RAW の場合）    
14: &#x2b6f;&#xfe0e; 反時計回りに回転（RAW の場合）    
15: &#x231a;&#xfe0e; タイムスタンプを修正    
16: RAW JPEG をダウンロードする（RAW で設定されている場合）    
17: &#x1f5d1;&#xfe0e;削除    
18: 画像ブラウザでの操作として選択    
19: &#x270e;&#xfe0e; 説明を設定（RAW画像の場合）    
20: &#x1f50d;&#xfe0e; 拡大表示

## <a id="processingdng" name="processingdng"> </a>DNGの処理

darktable、lightroom、ufraw、rawtherapeeなど、お好みのソフトウェアをご使用ください。

画像がそのままで問題ないと**期待**しないでください。
時間をかけて色を調整し、その後残りの作業を進めてください。*DNGに詳しい方、または協力してくれる方をご存知の方がいらっしゃいましたら、ご連絡ください*
例： Darktable/RawSpeed については [pixls.us のディスカッション](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/)、または
I'm Back digital back [Facebook 開発者グループ](https://www.facebook.com/groups/2812057398929350) をご覧ください。

画像全体に強いグリーンやマゼンタの色合いが出ることはもうありません！もし、そのような色合いが出ていて、ソフトウェアのカラーマトリックス/カラーキャリブレーションやホワイトバランス調整で**均一化**できない場合は、サンプル画像で修正できるかもしれません。

画像中央に赤いハイライト部分がある場合（ImB 35mm/MF）、処理後に手動でレタッチするか、<a href="https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png">こちらのDarktable設定</a>を使用して、該当箇所の周囲に手動で円形を配置し、サイズを調整してください。最初から赤い部分を避けるには、絞りを大きくする（F値を小さくする）か、標準のPDLCマットとI'm Backのフレネルスクリーン、またはCanon EG-xxxスクリーンを組み合わせてください。

<!-- ![赤い円に対するdarktableサンプル](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png "赤い円に対するdarktableサンプル") -->


## <a id="internationalization" name="internationalization"> </a>国際化

現在サポートされている言語は、英語 (EN)、日本語 (JA)、ドイツ語 (DE) です。imbraw2dng.js ファイルの名前を `imbraw2dng_XX.js` に変更して保存すると（`XX` は言語ショートカット）、その言語で直接実行されます。**翻訳にご協力いただける場合は、現在ご覧になっている内容を翻訳するか、
[こちら](https://shyrodgau.github.io/imbraw2dng/translations.xls) をご覧になってご連絡ください！**

例: [ドイツ語版](https://shyrodgau.github.io/imbraw2dng/imbapp_de.htm)、[日本語版](https://shyrodgau.github.io/imbraw2dng/imbapp_ja.htm) (同じファイルですが、名前が異なります)。

## <a id="command-line-using-nodejs" name="command-line-using-nodejs"> </a>node.js を使用したコマンドライン

[node.js](https://nodejs.org) バージョン V20.10(LTS) 以上がインストールされている場合は、ファイル [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) を取得することで、コマンドラインから変換できます。[国際化](#internationalization) に従った命名規則が適用されます。
パラメータと呼び出しのヘルプは `node imbraw2dng.js` で参照できます。
```
使用方法: node imbraw2dng.js [-l lang] [-f | -r] [-d dir] [-nc | -co] [-np] [-ndcp] [-owb] [-cr copyright] [-R] [-J] [-O] [-n yyyy_mm_dd-hh_mm_ss] [-fla | -flx] [ [--] <files-or-dirs>* ]
オプション:
 -h - このヘルプを表示する
 -nc - カラーテキストを使用しない
 -co - カラーテキストを強制的に使用する
 -l XX - XX は有効な言語コード (現在: DE, EN, JA)
     ファイル名を imbraw2dng_XX.js に変更することでも言語を設定できます。
 -d dir - 出力ファイルをdirに出力します
 -f - 既存のファイルを上書きします
 -np - DNGにプレビューサムネイルを追加しません
 -owb - 従来の固定ホワイトバランスを使用します
 -ndcp - 新しいDNGカラープロファイルを含めません
 -cr "copyright..." - DNGに著作権を追加します
 -at "author..." - DNGに作者/作成者を追加します
 -fla, -flx - 複数の画像を追加して擬似長時間露光を行います。flxは縮小されます
 -j - JPEG handling: 1: download, 2: use exif for dng, 3: both (default)
 -R - Wi-Fi接続または指定されたディレクトリにあるImBからRAWデータを変換します
 -J - Wi-Fi接続または指定されたディレクトリにあるImBからJPEGデータを取得します
 -O - Wi-Fi接続または指定されたディレクトリにあるImBから非RAW/非JPEGデータを取得します
 -da correcttimestamp=cameratimestamp - タイムスタンプ補正（形式：yyyy_mm_dd-hh_mm_ss）
 -n yyyy_mm_dd-hh_mm_ss（または任意の長さのプレフィックス） - ImBまたは指定されたディレクトリから、このタイムスタンプより新しいものだけを選択します
-----
-- - 残りのパラメータをローカルファイルまたはディレクトリとして扱います
<files-or-dirs> - ローカルファイルまたはディレクトリを再帰的に処理します（例：ImBからMicroSDへ）。
```

設定については[imbraw2dng.json](imbraw2dng.json)を参照してください。

## ヒント、コツ、内部構造、詳細

### <a id="metaexif" name="metaexif"> </a>メタデータ、EXIF

ImBから取得するJPEGファイルに含まれるEXIFデータは、ImBの光学系とセンサーの視点を反映したものであり、実際のカメラの視点を反映したものではないため、あまり役に立ちません。しかし、DNGファイルに追加することも可能です。まずJPEGファイルを処理してから、対応するRAWファイルを処理してください。
対応とは、時間差が5秒未満かつカウンタ（ファイル名の最後の部分）の差が1以下と定義されます。必ずしも連続している必要はなく、まずすべてのJPEGファイル、次にRAWファイルで連続している必要があります。

作者/クリエーターと著作権のメタデータはグローバルに設定でき、画像ごとに説明（&#x270e;&#xfe0e;）を設定できます。

時間補正は自動的に適用できます（&#x231a;&#xfe0e;）。

### 長時間露光<a id="a-lot-more-tricks-and-details" name="a-lot-more-tricks-and-details"> </a>

特定のノイズを避けるために、複数の短い露光で長時間の「長時間露光」をシミュレートしたい場合は、node.jsで`-fla`/`-flx`パラメータを使用します。
または、HTMLページの青いフィールドの下にあるチェックボックスをオンにし、重ね合わせたいRAWファイルを青いフィールドにドラッグ＆ドロップします。
アプリでは、まずすべてのRAWファイルをDNGファイルに変換する必要があります。次に、ファイルブラウザでスタックしたいDNGファイルを選択し、ImB OSアプリと共有してください。

### <a id="revert-to-raw" name="revert-to-raw"> </a>RAWファイルに戻す

アプリで変換したDNGファイルを元のRAWファイルに戻したい場合は、ファイルブラウザでDNGファイルを1つだけ選択し、ImB OSアプリと共有してください。

または、通常のimbappページを使用して、対応するチェックボックスをオンにしてください。

または、[imbdng2raw.html](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html) または [imbdng2raw.js](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js) を使用してください。

### iPhone

Android アプリは HTML ページと同じ HTML/JavaScript コードで構成されていますが、Apache Cordova でラップされています。iOS アプリも同様に作成できるはずですが、私は Mac も iPhone も持っていません。どなたか手伝っていただける方はいらっしゃいますか？

[こんな感じになります](https://www.facebook.com/groups/imbackofficial/posts/1656635048623845/?__cft__[0]=AZUQGC5WjATUlof9OXx2kE7BZLYYyqvhqUxhPdWTr9FO4NQBNIas8aA9MyhgNrgwVi49RuFZHBUUa-BH2mrAIYT1HQ8NRqvdRuaopAgHHT71hD1ZsDm4yuag3Lez_Ok74OVOYIY2tGymh9nIzngaZ9bCO0_dj-dGBLbPSxlXcZJc5g&__tn__=%2CO%2CP-R)

### 比較

`IMBAPP.HTM` と Android アプリについて：
[ImB のアプリ](https://imback.eu/home/app/) に対する利点：

- どのブラウザでも使用可能

- RAW 画像を表示可能

- ダウンロード時に RAW を DNG に変換

- ローカルファイルであればオフラインで使用可能

ImB のアプリに対する欠点：

- 動画のライブ画像表示機能が組み込まれていない

- PC/スマートフォンでローカルアルバムを閲覧できない

- タフガイのような視線を向けられない

ImB のアプリに対する相違点：

- 接続時にデバイスの時刻が自動的に設定されないため、メニューを手動でクリックするか、設定を使って自動的に設定する
(ImB Film では時刻設定が常に 0:00 に設定されるので、この点は利点です)

<!-- 従来の `imbraw2dng.html` を ImB で使用する場合の利点：
- ImB の時刻を設定できる
- 写真撮影と動画撮影が可能
- 高速JPEG プレビュー
- 画像パラメータ（サイズ、EV 値など）を設定できます
-->

### その他

設定は、Node.js の設定ファイル（上記参照）に保存するか、Web サーバー（インターネットまたは ImB）から読み込む際にブラウザに保存できます。

コードを閲覧したり、翻訳や最適化にご協力いただければ幸いです。

## <a id="fmt" name="fmt"> </a>フォーマット

18000000 B = 4000 x 3000 (12bpp) = MiMi

30607488 B = 5216 x 3912 (12bpp) = フィルム

15335424 B = 4608 x 3328 = 35mm

7667520 B = 3260 x 2352 = 35mm 小角

11618752 B = 4012 x 2896 = 35mm 中角

11943936 B = 3456 x 3456 = MF6x6

12937632 B = 4152 x 3116 = MF6x4.5

6470944 B = 2936 x 2204 = MF6x4.5 小角

9806592 B = 3616 x 2712 = MF6x4.5 中角

15925248 B = 4608 x 3456 = MF6x7

14065920 B = 4320 x 3256 = 歴史的には不明

---------------------------

## <a name="credits" id="credits"> </a>クレジット

謝辞：

**Michele Asciutti** - ImBカラーフィルターアレイパターンを最初に解読した人物

**Sadami Inoue** - 日本語翻訳

**Samuel Mello Medeiros** - ImBackの発明者
