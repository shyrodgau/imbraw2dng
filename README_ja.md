<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - RAW ファイルを [I'mBack<sup>&reg;</sup>&nbsp;35mm/MF](https://imback.eu) から DNG に変換する - クイック スタート

これは商用サポートのないフリー ソフトウェア ([0-clause BSD-License](LICENSE.txt)) です。

その他のドキュメント: [こちら](https://shyrodgau.github.io/imbraw2dng/moredoc_ja)

oder [AUF DEUTSCH](https://shyrodgau.github.io/imbraw2dng/README_de)  
or [IN ENGLISH](https://shyrodgau.github.io/imbraw2dng/)

これらは "白黒 RAW" ファイルではなく、カラー フィルタリングが施された実際の生のセンサー データです (残念ながら 8 ビットのみです...)。

このサイトは、携帯電話アプリの部分的な機能 (場合によってはそれ以上、つまり RAW の表示) もサポートできるようになりました。

現時点では、35mm ("Angle medium"と"small"も) および I'm Back MF (中判) の現在のファームウェアで動作するようです。 MF ではすべてのアングル設定がカバーされているわけではありません。
それらが必要で、少しでも手助けしたい場合は、ご連絡ください。

問題やアイデアは、[github リポジトリ](https://github.com/shyrodgau/imbraw2dng) の "[問題](https://github.com/shyrodgau/imbraw2dng/issues)" または "[ディスカッション](https://github.com/shyrodgau/imbraw2dng/discussions)" タブ 
、または [Facebook の I'm Back Users グループ](https://www.facebook.com/groups/1212628099691211) で。

## 基本 ;tldr

以下では、コピー中に RAW ファイルを DNG 形式に変換することに焦点を当てます。 ブラウザで使用するために必要なファイルは 1 つだけ、node.js で使用するために必要なファイルは 1 つだけです。

`.../IMBACK` は ImB の Micro SD カード上のディレクトリで、USB (デバイス上の `大容量ストレージ` を選択します) 経由でアクセスするか、Micro SD カードを PC またはスマートフォンに挿入することでアクセスできます。

1. ブラウザで [imbraw2dng.html](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) を開きます。 `.../IMBACK/PHOTO` および `.../IMBACK/MOVIE` フォルダーからファイルを青いフィールドにドラッグします。 [(詳細)](https://shyrodgau.github.io/imbraw2dng/moredoc#usage)

1. ([imbraw2dng.html](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbraw2dng_ja.html) を `.../IMBACK` フォルダに保存し、カードを取り出した後) 
PC またはスマートフォンを ImB WiFi に接続し、ブラウザで ImB から [http://192.168.1.254/IMBACK/imbraw2dng_ja.html](http://192.168.1.254/IMBACK/imbraw2dng_ja.html) を開きます。
[(詳細)](https://shyrodgau.github.io/imbraw2dng/moredoc#browsing-on-the-imback)

1. [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) をダウンロードし、 `node imbraw2dng.js .../IMBACK` を呼び出します。
[(詳細)](https://shyrodgau.github.io/imbraw2dng/moredoc#command-line-using-nodejs)

1. PC を ImB の WiFi に接続し、 [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) ダウンロードし、`node imbraw2dng.js -R -J -O` を呼び出します。
[(詳細)](https://shyrodgau.github.io/imbraw2dng/moredoc#command-line-using-nodejs)


## DNG の処理

これには、darktable、lightroom、ufraw、rawtherapee などのお気に入りのソフトウェアを使用してください。

写真がすぐにうまくいくとは期待 **しない** でください。べてのプログラムが期待するすべてを DNG に収めることはできそうにありません。 
時間をかけて、適切な色を取得してから、残りを行ってください。 *DNG に関する経験がある方、または協力してくれる人を知っている方は、ご連絡ください。* 
例えば、Darktable/RawSpeed についての [pixls.us のディスカッション](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/) または、 
[Facebook のI'm Back デジタル バック開発者グループ](https://www.facebook.com/groups/2812057398929350) に戻ってください。

画像に強い緑またはマゼンタの色合いが発生することはなくなります。 ただし、カラー キャリブレーション/カラー マトリックス/ホワイト バランスで除去 **できない** ものがある場合は、サンプル画像が興味深いかもしれません。

**色について一言:** 色についてはまったくわかりません...

画像の中央に赤い点がある場合は、手動でレタッチするか、ダークテーブルで次の設定を使用して、その周りに手動で円を配置する必要があります。

最初から赤点を避けるには、より大きな絞り (小さな F 値) を使用するか、通常の PDLC フォーカシング スクリーンを I'm Back のフレネル スクリーンまたは Canon EG-xxx フォーカシング スクリーンに接続します。

![darktable sample agains red circle](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png "darktable sample agains red circle")

