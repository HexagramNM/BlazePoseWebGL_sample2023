# BlazePoseWebGL_sample2023
[BlazePose](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection)で背景マスクをした映像をWebGLのテクスチャとして流すサンプル

[こんな感じ](https://hexagramnm.github.io/BlazePoseWebGL_sample2023/index.html)に動きます。背景マスクされたWebカメラ映像が少し奥行き方向に傾いた状態で表示されます。

[前のリポジトリ](https://github.com/HexagramNM/BlazePoseWebGL_sample)から、以下の部分を変更しました。

- BlazePoseに渡す用のキャンバスとマスク用のキャンバスを別に作成し、
  そのキャンバスの解像度を128*128程度に設定した。

- 前のリポジトリで使用していたintermediateキャンバスはカメラ映像と
  同じ解像度に変更した。

- キャンバスのdrawImageメソッドでもでスケーリングしたり、マスク処理をかけたり
  できたため、ピクセルごとの処理はやめ、drawImageメソッドを使用するように切り替えた。

<br>

結果として、以下の環境でも約30fpsで動作するようになりました。

```
CPU: Intel Core i7-6567U @ 3.30GHz
RAM: 16.0GB
GPU: Intel Iris Graphics 550
```

WebGLでの行列計算に[minMatrix.js](https://wgld.org/d/library/l001.html)を使用しております。minMatrix.jsはライセンスについて完全にフリーだそうなので、このリポジトリ内のコードは自由に使用していただいて大丈夫です。
