# BME280 Sensor Extension for micro:bit
 

You can measure atmospheric pressure, temperature, and humidity.  
Sensor values are based on the official BME280 datasheet.



> 🔗 Demo Page: [https://tanagogedora.github.io/bme280-en/](https://tanagogedora.github.io/bme280-en/)

---
## 📦 How to Use
### As a MakeCode Extension
1. Open [https://makecode.microbit.org/](https://makecode.microbit.org/)
1. Create a new project
1. Click the gear icon (⚙) in the top-right → select “Extensions”
1. Paste the following URL to add the extension  
	 `https://github.com/tanagogedora/bme280-en/` 

---

### 🖼 Example 

🎯 The following sample (block/script) performs the following actions:
- Connects the BME280 weather sensor to the micro:bit via I2C (address: `0x76`).
- Initializes the BMP280 so it can measure temperature and atmospheric pressure.
- **Pressing button A** displays the **temperature** (in Celsius, with one decimal place) on the micro:bit LED.
- **Pressing button B** displays the **air pressure** (in hPa, with one decimal place) on the micro:bit LED.
- **Pressing button A+B** displays the **humidity** (in %, with one decimal place) on the micro:bit LED.

### 🖼 Sample Blocks 

![Sample Blocks](https://github.com/Tanagogedora/bme280-en/blob/main/BME280en.png?raw=true)

💻 Sample Code  
```javascript  

BME280.Address(BME280.BME280_I2C_ADDRESS.ADDR_0x76)
BME280.PowerOn()
basic.pause(1000)
input.onButtonPressed(Button.A, function () {
    basic.showString("" + BME280.temperature(BME280.BME280_T.T_C, BME280.RPoint.RPt) + "C")
})
input.onButtonPressed(Button.AB, function () {
    basic.showString("" + BME280.humidity(BME280.Rpoint2.RP1st) + "%")
})
input.onButtonPressed(Button.B, function () {
    basic.showString("" + BME280.pressure(BME280.BME280_P.hPa, BME280.RPoint.RPt) + "hPa")
})

```


### ✏️ To modify the extension source code in MakeCode:

1. Open [https://makecode.microbit.org/](https://makecode.microbit.org/)
1. Click "Import" → "Import URL"  
1. Paste this URL  
	 `https://github.com/tanagogedora/bme280-en`  

---

## 🧪 Sensor Specification (Based on Datasheet)   

| Measurement | Range | Accuracy | Resolution |
|-----------|------------------|-------------------|--------------------|
| Pressure | 300 ～ 1100 hPa | ±1.0 ～ 1.7 hPa | ±0.16 Pa |
| Temperature | -40 ～ +85 ℃ | ±0.5 ～ 1.0 ℃ | ±0.01 ℃ |
| Humidity | 0～100% | ±3% | ±0.008% |

※ Sensor values are based on the official BME280 datasheet.  


## 📝 Acknowledgement

This extension is based on an open-source BME280 TypeScript implementation originally developed by the microbit/micropython Chinese community (2018).

We have adapted and extended it for Japanese educational use, adding Japanese block support and decimal precision for science experiments.

Original Source: http://www.micropython.org.cn

## 📝 License

MIT License

© 2025 Tanagotti  
Based on BME280 code by the microbit/micropython Chinese community (2018)  
Original Source: http://www.micropython.org.cn  


#### メタデータ (検索、レンダリングに使用)

* for PXT/microbit
<script>
makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");
</script>
