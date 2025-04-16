# Sensor Extension for micro:bit
# micro:bit 用 BME280 センサー拡張機能

You can measure atmospheric pressure, temperature, and humidity.  
Sensor values are based on the official BME280 datasheet.


気圧・気温・湿度の測定が可能です。センサー仕様は BME280 のデータシートに基づいています。

 
> ⚠️ **この拡張機能は現在ベータ版です。動作確認中の機能が含まれます。ご使用の際はご注意ください。**

> 🔗 Demo Page:**デモページを見る: [https://tanagogedora.github.io/BME280_JP/](https://tanagogedora.github.io/BME280_JP/)

---
## 📦 How to Use / 使い方
### As a MakeCode Extension
1. Open [https://makecode.microbit.org/](https://makecode.microbit.org/)
1. Create a new project
1. Click the gear icon (⚙) in the top-right → select “Extensions”
1. Paste the following URL to add the extension  
	 `https://github.com/tanagogedora/BME280_JP` 

---

### MakeCode 拡張機能としての使用方法

1. MakeCode [https://makecode.microbit.org/](https://makecode.microbit.org/)を開く
1. 「新しいプロジェクト」をクリック
1. 画面右上のギアボタン（⚙）をクリックし、「拡張機能」を選択 
1. 下記の URL を検索または貼り付けてインポート    
	`https://github.com/tanagogedora/BME280_JP`


---

### 🖼 Example / 使用例 

🎯 The following sample (block/script) performs the following actions:
- Connects the BME280 weather sensor to the micro:bit via I2C (address: `0x76`).
- Initializes the BMP280 so it can measure temperature and atmospheric pressure.
- **Pressing button A** displays the **temperature** (in Celsius, with one decimal place) on the micro:bit LED.
- **Pressing button B** displays the **air pressure** (in hPa, with one decimal place) on the micro:bit LED.
- **Pressing button A+B** displays the **humidity** (in %, with one decimal place) on the micro:bit LED.
🎯 次のサンプル（ブロック／スクリプト）は、以下のような動作を行います：
- I2C接続により、気象センサー BME280 と micro:bit が接続されます（アドレス：`0x76`）。
- BMP280 が有効化され、気温・気圧の測定が可能になります。
- **ボタンA** を押すと、micro:bit のLEDに **気温（摂氏・小数第1位）** が表示されます。
- **ボタンB** を押すと、micro:bit のLEDに **気圧（hPa・小数第1位）** が表示されます。
- **ボタンA+B** を押すと、micro:bit のLEDに **湿度（％・小数第1位）** が表示されます。

### 🖼 Sample Blocks / ブロックの使用例 

English
![BME280 ブロック](https://github.com/Tanagogedora/BME280_JP/blob/main/BME280en.png?raw=true)

日本語 
![BME280 ブロック](https://github.com/Tanagogedora/BME280_JP/blob/main/BME280ja.png?raw=true)

💻 Sample Code / JavaScriptサンプル 
```javascript
BME280.Address(BME280.BME280_I2C_ADDRESS.ADDR_0x76)
BME280.PowerOn()
input.onButtonPressed(Button.A, function () {
    basic.showString("" + BME280.temperature(BME280.BME280_T.T_C) + "C")
})
input.onButtonPressed(Button.B, function () {
    basic.showString("" + BME280.pressure(BME280.BME280_P.hPa) + "hPa")
})
input.onButtonPressed(Button.AB, function () {
    basic.showString("" + BME280.humidity() + "%")
})

```
---

### ✏️ To modify the extension source code in MakeCode:

1. Open [https://makecode.microbit.org/](https://makecode.microbit.org/)
1. Click "Import" → "Import URL"  
1. Paste this URL  
   `https://github.com/tanagogedora/BME280_JP`


---

### ✏️ MakeCode 上で編集

1. MakeCode [https://makecode.microbit.org/](https://makecode.microbit.org/) を開く
1. 「読み込む」→「URLから読み込む…」を選択
1. 以下の URL を貼り付けてインポート   
	`https://github.com/tanagogedora/BME280_JP`

---

## 🧪 Sensor Specification (Based on Datasheet) / 測定仕様（参考：データシートより）


| Measurement(測定対象) | Range(範囲) | Accuracy(精度) | Resolution(分解能) |
|-----------|------------------|-------------------|--------------------|
| Pressure(気圧) | 300 ～ 1100 hPa | ±1.0 ～ 1.7 hPa | ±0.16 Pa |
| Temperature(気温) | -40 ～ +85 ℃ | ±0.5 ～ 1.0 ℃ | ±0.01 ℃ |
| Humidity(湿度) | 0～100% | ±3% | ±0.008% |

※ 上記の値は BME280 の公式データシートに基づく参考値です。


## 📝 Acknowledgement

This extension is based on an open-source BME280 TypeScript implementation originally developed by the microbit/micropython Chinese community (2018).

We have adapted and extended it for Japanese educational use, adding Japanese block support and decimal precision for science experiments.

Original Source: http://www.micropython.org.cn

## 📝 謝辞・ベースとなった実装について

本拡張機能は、microbit/micropython 中国コミュニティ（2018年）による BME280 TypeScript 実装をもとに開発しています。

日本の教育現場での利用を想定し、ブロックの日本語対応や小数点精度での測定機能を追加しました。

元コード提供元（参考）：http://www.micropython.org.cn


## 📝 ライセンス / License

MIT License

© 2025 Tanagotti  
Based on BME280 code by the microbit/micropython Chinese community (2018)  
Original Source: http://www.micropython.org.cn  
（元コード：microbit/micropython 中国コミュニティによる BME280 実装）


#### メタデータ (検索、レンダリングに使用)

* for PXT/microbit
<script>
makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");
</script>
