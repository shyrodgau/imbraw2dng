<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - [I'mBack<sup>&reg;</sup>&nbsp;35mm/MF](https://imback.eu) RAW から DNG ファイルへの変換

これは商用サポートのないフリー ソフトウェア ([0-clause BSD-License](LICENSE.txt)) です。

ここでは: [インストール](#インストール) - [国際化](#国際化) - を見つけることができます。
[使用法](#使用法) - [ImBack での閲覧](#imback-での閲覧) - [node.js を使用したコマンドライン経由](#nodejs-を使用したコマンドライン経由) - [どのように動作するか？](#どのように動作するか)

簡易ドキュメント: [こちら](https://shyrodgau.github.io/imbraw2dng/README_ja)

or [IN ENGLISH](https://shyrodgau.github.io/imbraw2dng/moredoc)  
oder [AUF DEUTSCH](https://shyrodgau.github.io/imbraw2dng/moredoc_de)

## インストール

現在のバージョンは [V3.5.2_a8c2532 - プレビュー イメージあり](https://github.com/shyrodgau/imbraw2dng/releases/tag/V3.5.2_a8c2532). 
注: エラーが見つかった場合、新しい翻訳が提供された場合、または新しい画像形式が追加された場合は、さらに開発を進めます。

ファイル [imbraw2dng.html](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.html) fを PC にコピーするか、 
"Source code".zip または .tar.gz バージョンから解凍して、お気に入りのブラウザで開きます (比較的最新のものであれば何でも機能します)。

ローカルにインストールできない場合は、 [私の github ページ](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) 
(常に最新バージョンである必要があります) または [あなあの ImB から](#ImBack-での閲覧) または [imback.eu](https://imback.eu/home/im-back-raw-dng-converter-ib35/) 
などのネットワークから取得できます(他の言語に自動翻訳されますが、常に最新とは限りません)。 画像データはブラウザ内に確実に残ります。


[node.js](#command-line-using-nodejs) の場合は、JavaScript ファイル [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) のみが必要です。

github リポジトリは [ここ](https://github.com/shyrodgau/imbraw2dng) にあります。

## 国際化

現在サポートされている言語は、英語 (EN)、フランス語 (FR)、ドイツ語 (DE)、日本語 (JA) です。 HTML ファイルの名前を `imbraw2dng_XX.html` (`XX` 
は言語ショートカット) に変更して保存すると、その言語でページが直接開きます。 翻訳に貢献したい場合は、今読んでいる内容を翻訳するか、
[ここ](https://shyrodgau.github.io/imbraw2dng/translations.xls) を見て連絡してください。!

[node.js](https://nodejs.org) バージョン &ge; V20.10(LTS) の場合、ファイル [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) を取得し、
`imbraw2dng_00.js` の下に保存してから、 `node imbraw2dng_00.js -CSV > mytexts.csv` を呼び出して、テキストを含む現在の翻訳された CSV を生成できます。


## 使用法

I'm back から（つまり、PC に挿入されたマイクロ SD から）すべてのファイルを青いフィールドにドラッグ アンド ドロップできます。 次に、すべての非 RAW ファイルを正確にコピーし、RAW ファイルを DNG に変換し、`.raw`/`.RAW` ファイル拡張子を `.dng` に置き換えます。 `ファイルを選択` ボタンを使用すると、RAW ファイルを直接選択できます。

ブラウザはダウンロード設定に従ってファイルをダウンロードするため、そのように設定されている場合はファイルごとに保存するためのダイアログがポップアップ表示されるか、そのように設定されている場合はすべてのファイルをダウンロード ディレクトリにスローする (おそらく名前を変更する) か、または、 または...

現在、DNG への変換では、ファイル名が適切な I'm Back ファイル名 (すなわち、`YYYY_MMDD_hhmmss`) であると思われる場合はタイムスタンプ タグが設定され、OriginalRawFilename は RAW 入力ファイルの名前に設定されます。 こうすることで、元の情報をほとんど失うことなく、DNG ファイルに好きな名前を付けることができます。

新機能: RAW ファイルのプレビューを使用して、段階的に実行できます。 そのためには、`プレビューありでシングルステップ` チェックボックスをオンにします。 各ファイルで、そのファイルを処理するかスキップするかを選択できます。また、現在選択している残りのファイルに同じアクションを適用するかどうかも選択できます。

## ImBack での閲覧

HTML ファイル ( [国際化](#国際化) に応じて名前も変更) を ImBack 内のマイクロ SD、たとえば `IMBACK` フォルダーに置くことができます。 次に、PC を ImBack Wifi に接続し、[あなたの Imback](http://192.168.1.254/IMBACK/imbraw2dng.html) (または名前を変更したもの) を参照します。

指定されたタイムスタンプより新しいファイルを直接処理/コピーしたり、ビジュアル ブラウザを使用して ImBack 上のファイルを種類や日付ごとに確認したりできます。 RAW画像とJPEG画像が表示されます。 変換/ダウンロードまたは削除するファイルを選択できます。

## node.js を使用したコマンドライン経由

[node.js](https://nodejs.org) バージョン &ge; V20.10(LTS) がインストールされている場合は、ファイル 
[imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) を取得することで、コマンド ライン経由で変換を行うことができます。[国際化](#internationalization) に従った命名規則が適用されます。
パラメータと呼び出しヘルプは、ノード `node imbraw2dng.js` で読み取ることができます。
```
使用法: node imbraw2dng.js [-l lang] [-f] [-d dir] [-nc | -co] { [-R] [-J] [-O] [-n yyyy_mmdd_hhmmss] | [--] <files-or-dirs> }
オプション:
 -h - このヘルプを表示します
 -nc - 色付きのテキストを使用しません
 -co - 色付きのテキストを強制します
 -l XX - は有効な言語コードです (現在: DE、EN、FR、JA)
         ファイル名を imbraw2dng_XX.js に変更することで言語を設定することもできます。
 -d dir - 出力ファイルを dir に置きます
 -f - 既存のファイルを上書きします
 -R - Wifi 経由で接続された ImB から RAW を取得します
 -J - Wifi 経由で接続されている ImB から JPEG を取得します
 -O - Wifi 経由で接続された ImB から非 RAW/非 JPEG を取得します
 -n yyyy_mmdd_hhmmss (または任意の長さのプレフィックス) - ImB からこのタイムスタンプより新しいもののみを選択します
 -----
 -- - 残りのパラメータをローカル ファイルまたはディレクトリとして扱います
 <files-or-dirs> と -R/-J/-O/-n は同時に使用できません。
```

## どのように動作するか

DNG は TIFF に似た形式で、主に元の画像のスキャンラインの周囲の定数データで構成されます。 データは、画像の幅、高さ 
(これらは明示的に示されており、データ長に応じて多くのオフセットがあります)、およびファイル名 (OriginalRawFilename タグの場合) によって異なります。 ImB 
ファイル名の日付が有効であると思われる場合は、その日付にタグ (EXIFTAG_DATETIMEORIGINAL、TIFFTAG_DATETIME) が追加されます。 MF ImB からのものである場合、カラー フィルター アレイは異なります。

色については、[DNGの処理](README_ja#DNG-の処理)もお読みください。