<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - [I'mBack<sup>&reg;</sup>](https://imback.eu) の RAW ファイルを DNG に変換します

そのほとんどはフリーソフトウェア ([0 条項 BSD ライセンス](LICENSE.txt)) であり、商用サポートは提供されていません。

または [ドイツ語](https://shyrodgau.github.io/imbraw2dng/README_de)   
  [英語](https://shyrodgau.github.io/imbraw2dng/README)

## ここで見つけるもの

- `imbraw2dng.html` - [オリジナル コンバーター](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_ja.html)。ハードディスク、インターネット、または ImB から直接ブラウザーで使用する
`imbraw2dng_XX.html` としてさまざまな言語でも使用できます ([国際化](#国際化) を参照)

- `imbapp.htm` - 新しい [アプリのようなバージョン](https://shyrodgau.github.io/imbraw2dng/imbapp.htm)

- `imbapp.apk` - [本物の Android アプリ](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk)。Apple の場合は、[こちら](#iphone) を参照してください。

- [`imbraw2dng.js`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js) - コマンドラインで使用するための Node.js バージョン
`imbraw2dng_XX.js` としてさまざまな言語でも使用可能 ([国際化](#国際化) を参照)

- ImB 用に調整された [ダウンロード用カメラ プロファイル](cameraprofiles.md)

- [`imbdng2raw.html`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html)、[`imbdng2raw.js`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js) DNG から RAW への逆変換 (これらのツールを使用して変換された元の DNG のみ)


ImB RAW は実際には「B&W RAW」ではありませんが、実際にはRAW センサー データには、カラー フィルタリングも含まれています (残念ながら、35mm と MF では 8 ビット深度のみ、フィルムでは 12 ビット)。

DNG はオープンな TIFF のような形式で、主に元の画像スキャンライン周辺の定数データで構成されます。
MF またはフィルム ImB からのものであれば、カラー フィルタ アレイは異なります。
DNG への変換では現在、ファイル名が適切な I'm Back ファイル名 (つまり、`YYYY_MMDD_hhmmss`) であると思われる場合はタイムスタンプ タグが設定され、
OriginalRawFilename は RAW 入力ファイルの名前に設定されます。こうすることで、元の情報をほとんど失うことなく、DNG ファイルに好きな名前を付けることができます。

問題やアイデアについては、[github リポジトリ](https://github.com/shyrodgau/imbraw2dng) の「[Issues](https://github.com/shyrodgau/imbraw2dng/issues)」または「[Discussions](https://github.com/shyrodgau/imbraw2dng/discussions)」タブ、または [Facebook の I'm Back Users Group](https://www.facebook.com/groups/1212628099691211) でも議論できます。


## 開始

Android を使用している場合は、[Android アプリ](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) を試してください。

PC またはスマートフォンのブラウザーで使用したい場合は、次の選択肢があります。

- [新しい `IMBAPP.HTM`](https://shyrodgau.github.io/imbraw2dng/imbapp.htm) または [従来の `IMBRAW2DNG.HTML`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng_ja.html) のいずれか (または両方) をインターネットから直接使用するか、ハードディスクまたはメモリ上の任意の場所にコピーします。
（**すべてのデータはブラウザ内に残ります！**）
この場合、ImB からファイルを転送するか、USB、アダプタ、オリジナルの ImB アプリなどを介して MicroSD にアクセスする必要があります。


- <a name="browsing-on-the-imback"> </a>MicroSD の `IMBACK` フォルダにバージョンを 1 つ (または両方) コピーすると 
[(コピーする方法)](#html-ファイルを-micro-sd-にコピーするにはどうすればよいですか)、ダウンロードと DNG への変換を直接組み合わせることができます: (ビデオと JPG もダウンロードできます)
`http://192.168.1.254/IMBACK/IMBAPP.HTM` (新しいバージョン。時計の設定、ビデオの録画、写真の撮影もできます!) または
`http://192.168.1.254/IMBACK/IMBRAW2DNG.HTML` (クラシック。ダウンロードと変換のみ)
**ページを開くデバイスは ImB Wifi に接続されている必要があります。**

コマンドラインを使用する場合は、 [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) を node.js で実行します。デバイスの Wi-Fi を使用している場合は、ImB にアクセスすることもできます。
[コマンドライン ヘルプ](#nodejs-を使用したコマンドライン)


## HTML ファイルを Micro SD にコピーするにはどうすればよいですか?

#### Android:

[実際のアプリ](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) をインストールし、追加メニューを使用します。

#### Micro SD リーダー/アダプターまたは USB ケーブルの使用

Micro SD を背中から取り出し、コンピューターまたは電話の Micro SD アダプターに挿入するか、ImB を USB 経由で PC に接続し、ImB で「マス ストレージ」を選択します。

Micro SD/USB ドライブの内容を開きます。名前は「VOLUME1」または「0000-0001」で、「imback」または「IMBACK」という名前のフォルダーが表示されます。

オペレーティング システム/ファイル エクスプローラーを使用して、ダウンロードしたファイル「imbapp.htm」を「imback」または「IMBACK」フォルダーにコピーします。
<!-- 言語コード `XX` (DE、JA、FR、さらに翻訳が必要!) を使用して `imbapp_XX.html` (注: `htm` ではなく `html`!) に名前を変更できますが、その場合は以下のリンクを調整する必要があります。-->

Micro SD をコンピューターまたは電話から取り出し、デバイスに戻します - 準備完了!

#### ネットワーク経由

スマートフォンまたは PC を ImB Wifi に接続します。

新しいブラウザーウィンドウまたはタブを使用して、[http://192.168.1.254/IMBACK/](http://192.168.1.254/IMBACK/) に移動します。

「ファイルを選択」をクリックし、ダウンロードしたばかりの `imbapp.htm` を選択します。「ファイルをアップロード」をクリックします (文言を確認する必要があります) - 準備完了!


## 使用方法

I'm Back (PC に挿入された micro SD または USB マス ストレージ) からすべてのディレクトリまたはファイルを青いフィールドにドラッグ アンド ドロップできます。その後、すべての非 RAW ファイルが正確にコピーされ、RAW ファイルが DNG に変換され、`.raw`/`.RAW` ファイル拡張子が `.dng` に置き換えられます。`Choose Files` ボタンを使用すると、RAW ファイルを直接選択できます。


ブラウザはダウンロード設定に従ってダウンロードするため、設定に応じてファイルごとに保存場所を示すダイアログが表示されるか、設定に応じてすべてのファイルがダウンロード ディレクトリに投げ込まれます (名前が変更される場合もあります)。または、または、または...


DNG への変換では現在、ファイル名が I'm Back ファイル名として適切であると思われる場合はタイムスタンプ タグが設定され (つまり、`YYYY_MMDD_hhmmss`)、
OriginalRawFilename が RAW 入力ファイルの名前に設定されます。こうすることで、元の情報をほとんど失うことなく、DNG ファイルに好きな名前を付けることができます。

DNG から元の RAW に戻す必要がある場合 (たとえば、変換を再度実行しない場合)、[imbdng2raw.html](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html) を使用すると可能です。


## DNG の処理

darktable、lightroom、ufraw、rawtherapee など、お気に入りのソフトウェアを使用します。

画像がそのままで問題ないと**期待しないでください**。すべてのプログラムに対応できるように、DNG のすべてのタグを提供することはできないでしょう。
時間をかけて色を調整し、その後残りの部分を調整してください。*DNG について経験のある方、または協力してくれる人を知っている方は、ご連絡ください*
例: [pixls.us でのディスカッション](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/) で Darktable/RawSpeed または
I'm Back デジタルバック [Facebook の開発者グループ](https://www.facebook.com/groups/2812057398929350) について説明しました。

画像全体に強い緑やマゼンタの色合いが現れることはもうありません。ただし、画像に緑やマゼンタの色合いが見られ、ソフトウェアのカラー マトリックス/カラー キャリブレーションやホワイト バランス調整を使用しても **平らにならない場合は**、サンプル画像で修正するとよいかもしれません。


画像の中央に赤いハイライト部分がある場合は、処理後に手動で修正するか、次の darktable 設定を使用して、その領域の周りに手動で円形を配置してサイズを調整する必要があります。


最初から赤いスポットを回避するには、より大きな絞り (より小さい f 値) を使用するか、標準の PDLC マットを I'm Back のフレネル スクリーンまたは Canon EG-xxx スクリーンと組み合わせます。


![darktable sample against the red circle](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png "darktable sample against the red circle")


## 国際化

現在サポートされている言語は、英語 (EN)、日本語 (JA)、ドイツ語 (DE) です。HTML ファイルの名前を `imbraw2dng_XX.html` (`XX` は言語のショートカット) に変更して保存すると、その言語でページが直接開きます。翻訳に貢献したい場合は、今読んでいるものを翻訳するか、[こちら](https://shyrodgau.github.io/imbraw2dng/translations.xls) を見て連絡してください!



## node.js を使用したコマンドライン

[node.js](https://nodejs.org) バージョン V20.10(LTS) 以上がインストールされている場合は、ファイル [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) を取得してコマンドラインから変換できます。[国際化](#国際化) に従った命名規則が適用されます。パラメーターと呼び出しのヘルプは、`node imbraw2dng.js` で読み取ることができます。
```


使用方法: node imbraw2dng.js [-l lang] [-f | -r] [-d dir] [-nc | -co] [-np] [-ndcp] [-owb] [-cr copyright] [-R] [-J] [-O] [-n yyyy_mm_dd-hh_mm_ss] [-fla | -flx] [ [--] <files-or-dirs>* ]
オプション:
 -h - このヘルプを表示する
 -nc - 色付きテキストを使用しない
 -co - 色付きテキストを強制する
 -l XX - XX は有効な言語コード (現在: DE、EN、FR、JA)
 ファイル名を imbraw2dng_XX.js に変更して言語を設定することもできます。
 -d dir - 出力ファイルを dir に置きます
 -f - 既存のファイルを上書きします
 -r - 出力ファイルがすでに存在する場合は名前を変更します
 -np - DNG にプレビュー サムネイルを追加しません
 -owb - 旧式の一定ホワイト バランスを使用します
 -ndcp - 新しい DNG カラー プロファイルを含めません
 -cr 'copyright...' - DNG に著作権を追加します
 -fla, -flx - 複数の画像を追加して長時間露光を偽装します。flx は縮小されます
 -R - Wifi 経由で接続された ImB または指定されたディレクトリから RAW を取得します
 -J - Wifi 経由で接続された ImB または指定されたディレクトリから JPEG を取得します
 -O - Wifi 経由で接続された ImB または指定されたディレクトリから非 RAW/非 JPEG を取得します
 -n yyyy_mm_dd-hh_mm_ss (または任意の長さのプレフィックス) - ImB または指定されたディレクトリから、このタイムスタンプより新しいものだけを選択します
-----
-- - 残りのパラメーターをローカル ファイルまたはディレクトリとして扱います
<files-or-dirs> - ローカル ファイルまたはディレクトリを処理します再帰的に、例えば ImB の MicroSD で
```

設定については [imbraw2dng.json](imbraw2dng.json) を参照してください。

## ヒント、コツ、内部構造、詳細

### 比較

`IMBAPP.HTM` と Android アプリについて:
[ImB のアプリ](https://imback.eu/home/app/) に対する利点:
- どのブラウザでも使用可能
- RAW を表示可能
- ダウンロード時に RAW を DNG に変換
- imbraw2dng と同様にオフラインで使用可能

ImB のアプリに対する欠点:
- ビデオのライブ画像ビューが組み込まれていない
- PC/電話でローカルアルバムを閲覧できない
- タフガイがあなたを見ているわけではない

ImB のアプリに対する違い:
- 接続時にデバイスの時間が自動的に設定されないため、手動でメニューをクリックする (または設定を使用して自動的に行う)

ImB で使用する場合の私のクラシック `imbraw2dng.html` に対する利点:
- ImB の時間を設定できる
- 写真やビデオを撮影できる
- より高速な JPEG プレビュー
- 画像パラメータ (サイズ、 EV...)

ImB で使用しない場合の従来の imbraw2dng に対する欠点:
- ステップバイステップがなくなり、すべて処理する (ファイル選択ボタン) か、アプリのような画像ブラウザ (ドラッグ アンド ドロップ) を使用するかのいずれかになります。また、ナビゲーション付きの拡大鏡も追加されました。

### EXIF

ImB からの JPEG ファイル内の EXIF データは、実際のカメラではなく ImB の光学系とセンサーの視点を反映しているため、用途が限られています。ただし、DNG ファイルに追加したい場合は可能です。最初に JPEG を処理し、次に対応する RAW を処理します。
対応とは、時間差が 5 秒未満で、カウンタ (ファイル名の最後の部分) の差が 1 であると定義されます。直接連続している必要はありません。最初にすべての JPEG を処理し、次に RAW を処理する必要があります。

### 長時間露光<a name="a-lot-more-tricks-and-details"> </a>

特定のノイズを避けるために、長時間の「長時間露光」を複数の短い露光でシミュレートしたい場合は、node.js で `-fla`/`-flx` パラメータを使用して行うことができます。
または、HTML ページの青いフィールドの下のチェックボックスをオンにして、一緒にスタックする RAW ファイルを青いフィールドにドラッグ アンド ドロップします。
アプリでは、まずすべての RAW を DNG に変換する必要があります。次に、スタックする DNG をファイル ブラウザーで選択し、ImB OS アプリと共有します。

### RAW に戻す

アプリで元の DNG を元の RAW に戻す場合は、ファイル ブラウザーで 1 つの DNG のみを選択し、ImB OS アプリと共有します。

または、[imbdng2raw.html](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html) または [imbdng2raw.js](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js) を使用します。

### iPhone

Android アプリは HTML ページと同じ HTML/Javascript コードで構成されていますが、Apache Cordova でラップされています。iOS アプリの作成も同様に可能だと思いますが、私は Mac も iPhone も所有していません。どなたか手伝っていただける方はいらっしゃいますか??

### その他

ご希望の設定は、node.js の構成ファイル (上記参照) に保存するか、Web サーバー (インターネットまたは、ImB) から読み込むときにブラウザーに保存できます。

コードを閲覧したり、翻訳や最適化にご協力ください!

---------------------------


## オリジナルのクラシックなクイック使用法

`.../IMBACK` は、USB ケーブル経由でマウントするか (デバイスで `MassStorage` を選択)、Micro SD を PC またはスマートフォンに挿入して、デバイスのパスを参照します。

1. ブラウザで [imbraw2dng.html](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) を開きます。`.../IMBACK/PHOTO` と `.../IMBACK/MOVIE` を青いフィールドにドラッグ・アンド・ドロップします。 [(詳細)](#使用方法)

1. ([imbraw2dng.html](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbraw2dng.html) を MicroSD の `.../IMBACK` フォルダにコピーし、正常に取り出した後)
ImB Wifi にスマートフォンまたは PC を接続し、ブラウザで ImB から [http://192.168.1.254/IMBACK/imbraw2dng.html](http://192.168.1.254/IMBACK/imbraw2dng.html) に移動します。

1. [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) をダウンロードし、`node imbraw2dng.js .../IMBACK` を呼び出します。
[(詳細)](#nodejs-を使用したコマンドライン)

1. PC を ImB Wifi に接続し、[imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) をダウンロードして、`node imbraw2dng.js -R -J -O` を呼び出します。
[(詳細)](#nodejs-を使用したコマンドライン)

