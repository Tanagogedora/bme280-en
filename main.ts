/**
 * makecode BME280 digital pressure and humidity sensor package.
 * 
 * Based on original work from the MicroPython Chinese community:
 * http://www.micropython.org.cn
 * 
 * Original License: MIT
 * Original Copyright (c)2018, microbit/micropython Chinese community
 * 
 * Modified for MakeCode by Tanagotti, 2025
 */

/**
 * Package for the BME280 digital weather sensor module
 * for microbit MakeCode.
 * Can measure temperature, pressure, and humidity. 
 * Can also calculate dew point from temperature and humidity.
 * See README for detailed data such as measurement range.
 *
 * マイクロビット MakeCode 用 BME280 デジタル気象センサー
 * モジュール対応パッケージです。
 * 気温・気圧・湿度を測定できます。
 * また気温・湿度から露点を求めることができます。
 * 測定範囲など詳細なデータはREADMEをご覧ください。
*/

/**
* BME280 block
* 
* This namespace provides functions for interacting with the BME280
* digital pressure and temperature sensor.
* It includes functions to read temperature, pressure, and humidity, 
* control power modes, and configure the I2C address.
* 
* BME280 センサー用のブロック群です。
* 気温・気圧・湿度の取得や電源制御などを行います。
*/

namespace BME280 {
    //Enum Definitions / 列挙型の定義
    //I2C address/I2Cアドレス
    export enum BME280_I2C_ADDRESS {
        //% block="0x76"
        ADDR_0x76 = 0x76,
        //% block="0x77"
        ADDR_0x77 = 0x77
    }

    //Temperature Unit / 気温の単位
    // Temperature units: C (Celsius) or F (Fahrenheit) / 温度単位：C（摂氏）または F（華氏）
    export enum BME280_T {
        //% block="C"
        T_C = 0,
        //% block="F"
        T_F = 1
    }

    // Pressure Unit / 気圧の単位
    // Pressure units: Pa or hPa / 単位：Pa（パスカル）または hPa（ヘクトパスカル）
    export enum BME280_P {
        //% block="Pa"
        Pa = 1,
        //% block="hPa"
        hPa = 100
    }

    // Unit of Elevation difference / 標高差の単位（m/ft）
    export enum Eldf {
        //Units meter/単位 メートル
        //% block="m"
            altd_m=1,
        //Units feet/単位 フィート
        //% block="ft"
            altd_f = 2
    }

    // Selection of Saturated Water Vapor Pressure,
    // and Saturated Water Vapor Amount
    // 飽和水蒸気圧・飽和水蒸気量選択

    export enum Spad {
        //% block="Saturated Water Vapor Presure / 飽和水蒸気圧"
            swp=1,
        //% block="Saturated Water Vapor Amount / 飽和水蒸気量"
            swa=2
    }

    // Selection Humidity Selection,Water Vapor Pressure and Water Vapor Amount 
    // 相対湿度・水蒸気圧・水蒸気量の選択
    export enum SelecHPA {
        // block="Humidit / 湿度"
            hmdy=1,
        // block="Water Vapor Pressure / 水蒸気圧"
            wvp=2,
        // block="Water Vapor Amount / 水蒸気量"
            wva=3
    }
   
    // Numerical precision
    // 数値の精度
    // Integer / 1　decimal place
    // 整数 / 小数第1位
    export enum RPoint {
        //% block="Integer/整数"
            Rint=1,
        //% block="1 demicl place / 小数第1位"
            RPt=10
    }
        
    /**
     * Global variables to store the final compensated
     * temperature, pressure and humidity 
     * temperature	: unit  °C
     * pressuere	: unit Pa
     * humidity		: unit %
     * 
     * グローバル変数：補正後の気温・気圧・湿度
     * 単位　気温：℃　気圧：Pa　湿度：％
     */
    let T = 0;
    let P = 0;
    let H = 0;

    // Default I2C address: 0x77 / デフォルトの I2C アドレス：0x77
    let BME280_I2C_ADDR = BME280_I2C_ADDRESS.ADDR_0x76

    // Defining Functions / 関数の定義
    /** 
     * Functions "Access to BME280 Registers"
     * BME280のレジスタへのアクセスを行う関数群
     * A set of functions for reading from and writing to BME280
     * registers via I2C communication.
     * I2C 通信を用いて、各種レジスタへの読み書きを行う
     */

    /**
     * Function "Writes 1 byte from a register of the BME280".
     * BME280のレジスタに1バイトのデータを書き込む関数
     *
     * @param reg Register address (integer) / レジストリアドレス（整数値）
     * @returns dat write (integer) / 書き込んだ値（整数値）
     * @returns None/戻り値はない
     *
     * Creates a 2-byte buffer: the first byte is the register address (buf[0]),
     * the second byte is the data to write (buf[1]), and sends it via I2C.
     * レジスタアドレス（buf[0]）と書き込むデータ（buf[1]）を格納した2バイトのバッファを作成し、
     * I2C を使ってデバイスに送信。
     */
    function setreg(reg: number, dat: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = dat;
        pins.i2cWriteBuffer(BME280_I2C_ADDR, buf);
    }

    /**
     * Function "Reads 1 byte from a register of the BME280".
     * BME280の任意のレジスタから 1 バイトの値を読み取る関数。
     *
     * @param reg Register address (integer) / レジストリアドレス（整数値）
     * @returns Value read (integer) / 読み取った値（整数値）
     *
     * Sends the register address via I2C using UInt8BE format,
     * then reads 1 byte from the device.
     * レジストリアドレスを UInt8BE 形式で送信し、1 バイトを読み取って返す。
     */
    function getreg(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.UInt8BE);
    }

    /**
     * Function "Reads a 16-bit unsigned integer".
     * 8 ビットの符号付き整数を読み取る関数。
     *
     * Used for calibration parameters such as dig_H6..
     * 補正パラメータ dig_H6 に使用。
     *
     * @param reg Register address / レジストリアドレス
     * @returns Unsigned 8-bit integer / 符号付き8ビット整数
     */
    function getInt8LE(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.Int8LE);
    }

    /**
     * Function "Reads a 16-bit unsigned integer".
     * 16 ビットの符号なし整数を読み取る関数。
     *
     * Used for calibration parameters such as dig_T1, dig_P1, etc.
     * dig_T1、dig_P1 などの補正パラメータ用に使用。
     *
     * @param reg Register address / レジストリアドレス
     * @returns Unsigned 16-bit integer / 符号なし 16 ビット整数
     */
    function getUInt16LE(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.UInt16LE);
    }

    /**
     * Function "Reads a 16-bit signed integer".
     * 16 ビットの符号付き整数を読み取る関数。
     * 
     * Used for calibration parameters such as dig_T2, dig_T3, dig_P2.
     * dig_T2、dig_T3、dig_P2 などの補正パラメータ用に使用します。
     *
     * @param reg Register address / レジストリアドレス
     * @returns Signed 16-bit integer / 符号付き 16 ビット整数
     */
    function getInt16LE(reg: number): number {
        pins.i2cWriteNumber(BME280_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(BME280_I2C_ADDR, NumberFormat.Int16LE);
    }

    // Rounding numbers/数値の四捨五入
    // Integer/demicl 1 place
    // 整数 / 小数第1位 
    export function Rnber(dt:number,Rdp:number): number {
        return Math.round(dt*Rdp)/Rdp
    }

    // Function "Get Tempratuer , Pressuer and humidity".
    // 気温・気圧・湿度取得の関数
    /**
     * BME280 calibration parameters for temperature, pressure and humidity.
     * BME280 の温度・気圧・湿度補正用キャリブレーションパラメータ。
     * 
     * Address range: 0x88 to 0xE7 (factory-programmed values)
     * アドレス範囲：0x88 ～ 0xE7（工場出荷時に書き込まれた補正値）
     * 
     * Common to BMP280 & BME280 sensors
     * (excluding humidity-related registers 0xA1 to 0xE7)
     * BMP280・BME280 センサーで共通
     *（湿度関連のレジスタ 0xA1 ～ 0xE7は除く）
     */

    /**
     * Set "BME280 calibration parameter registers"
     * BME280温度・気圧・湿度補正用キャリブレーションパラメータのレジストリ　
     * dig_T1 to dig_T3: temperature/気温補正
     * dig_P1 to dig_P9: pressuere/気圧補正
     * dig_H1 to dig_H6: humidity/湿度補正
     */
    // Temperature calibration parameters / 気温補正用パラメータ
    let dig_T1 = getUInt16LE(0x88)
    let dig_T2 = getInt16LE(0x8A)
    let dig_T3 = getInt16LE(0x8C)

    // Pressure calibration parameters / 気圧補正用パラメータ
    let dig_P1 = getUInt16LE(0x8E)
    let dig_P2 = getInt16LE(0x90)
    let dig_P3 = getInt16LE(0x92)
    let dig_P4 = getInt16LE(0x94)
    let dig_P5 = getInt16LE(0x96)
    let dig_P6 = getInt16LE(0x98)
    let dig_P7 = getInt16LE(0x9A)
    let dig_P8 = getInt16LE(0x9C)
    let dig_P9 = getInt16LE(0x9E)

    // Humidity calibration parameters / 湿度補正用パラメータ   		
    let dig_H1 = getreg(0xA1)
    let dig_H2 = getInt16LE(0xE1)
    let dig_H3 = getreg(0xE3)
    let a = getreg(0xE5)
    let dig_H4 = (getreg(0xE4) << 4) + (a % 16)
    let dig_H5 = (getreg(0xE6) << 4) + (a >> 4)
    let dig_H6 = getInt8LE(0xE7)

    /**
     * Sensor configuration:
     * - Set humidity oversampling to x4 (ctrl_hum, 0xF2)
     * - Set temperature oversampling to x16, pressure oversampling to x1, normal mode (ctrl_meas, 0xF4)
     * - Set standby time to 250ms and filter coefficient to x4 (config, 0xF5)
     *
     * センサーの設定：
     * - 湿度のオーバーサンプリングを4倍に設定（ctrl_hum、0xF2）
     * - 温度のオーバーサンプリングを16倍、気圧を1倍、動作モードをノーマルに設定（ctrl_meas、0xF4）
     * - スタンバイ時間を250ms、フィルター係数を4倍に設定（config、0xF5）
     */
    setreg(0xF2, 0x04)
    setreg(0xF4, 0x2F)
    setreg(0xF5, 0x0C)

    /**
     * Calculate Temperatuer , Pressure and Humidity
     * 気温・気圧・湿度の算出
     * Reads raw data from the sensor and calculates
     * corrected temperature , pressure and humidity.
     * センサーから生データを読み取り、
     * 補正済みの気温・気圧・湿度を算出。
     */
    function get(): void {
        // Calculate Temperatuer/気温の計算
        // Read raw temperature data (20 bits)
        // 温度の生データ（20ビット）読み取り
        let adc_T = (getreg(0xFA) << 12) + (getreg(0xFB) << 4) + (getreg(0xFC) >> 4)
        let var1 = (((adc_T >> 3) - (dig_T1 << 1)) * dig_T2) >> 11
        let var2 = (((((adc_T >> 4) - dig_T1) * ((adc_T >> 4) - dig_T1)) >> 12) * dig_T3) >> 14
        let t_fine = var1 + var2;
        let temp = t_fine;
        // Calculate corrected temperature(no rounding)
        // 補正後の気温を計算（数値の丸めなし）
        T = Rnber(((temp * 5 + 128) / 256.0) / 100.0,100) ;

        // Calculate Pressure/気圧の計算
        // Read raw pressure data (20 bits)
        // 気圧の生データ（20ビット）読み取り
        let adc_P = (getreg(0xF7) << 12) + (getreg(0xF8) << 4) + (getreg(0xF9) >> 4);

        // Pressure compensation calculation
        // 気圧補正の計算
        var1 = (t_fine >> 1) - 64000;
        var2 = (((var1 >> 2) * (var1 >> 2)) >> 11) * dig_P6;
        var2 = var2 + ((var1 * dig_P5) << 1);
        var2 = (var2 >> 2) + (dig_P4 << 16);
        var1 = (((dig_P3 * ((var1 >> 2) * (var1 >> 2)) >> 13) >> 3) + ((dig_P2 * var1) >> 1)) >> 18;
        var1 = ((32768 + var1) * dig_P1) >> 15;
        if (var1 == 0) {
            return; // Prevent division by zero / 0除算防止
        }
        let _p = ((1048576 - adc_P) - (var2 >> 12)) * 3125;

        // Calculate Pressure (no rounding)/気圧を算出（数値の丸めなし）
        _p = (_p / var1) * 2 ;
        var1 = (dig_P9 * (((_p >> 3) * (_p >> 3)) >> 13)) >> 12;
        var2 = (((_p >> 2)) * dig_P8) >> 13;
        P =Rnber(_p + ((var1 + var2 + dig_P7) >> 4),100);

        // Calculate Humidity/	湿度の計算
        // Read raw pressure data (16 bits)
        // 湿度の生データ（16ビット）読み取り
        let adc_H = (getreg(0xFD) << 8) + getreg(0xFE)
        var1 = t_fine - 76800
        var2 = (((adc_H << 14) - (dig_H4 << 20) - (dig_H5 * var1)) + 16384) >> 15
        var1 = var2 * (((((((var1 * dig_H6) >> 10) * (((var1 * dig_H3) >> 11) + 32768)) >> 10) + 2097152) * dig_H2 + 8192) >> 14)
        var2 = var1 - (((((var1 >> 15) * (var1 >> 15)) >> 7) * dig_H1) >> 4)
        if (var2 < 0) var2 = 0
        if (var2 > 419430400) var2 = 419430400
        // Calculate Humidity (no rounding)/湿度を算出（数値の丸めなし）
        H = Rnber(var2 / 4194304.0,100);
    }
    
    /**
     * Function Calculate Saturation Vapor Pressure
     * , Saturatio Vapor Amount and  from temperature.
     * 気温から飽和水蒸気圧・飽和水蒸気量・露点を計算する関数
     * Calculation precision 2nd decimal placen: 2 decimal place
     * 計算精度　小数点第2位
     * 
     * Saturation vapor pressure:Tetens-approximation
     * 飽和水蒸気圧：テテンスの近似式
     * 
     * 6.1078 * 10 ** ((7.5 * Temp)/(237.3 + Temp))
     */
    export function SatVpad(Temp: number ,RH: number) :number
     { 
        // numerator（分子）べき乗部の分子部　
        let NMER = 7.5 * Temp;
        // denominator(分母)　べき乗の分母部　
        let DMN = 237.3 + Temp;
        // Calcrate Saturatio Vapor Pressure / 飽和水蒸気圧の計算
        let SVP = 6.1078 * Math.pow(10, NMER / DMN);
        return SVP=Rnber(SVP, 100);         
    }
    /**
     *  Get pressure value from BME280 sensor/BME280 センサーから気圧を取得
     *   
     *  @param u Pressure unit (Pa or hPa) / 気圧の単位（Pa または hPa）
     *  @returns Pressure value / 気圧の値（単位に応じた小数第1位）         
     */
    //% blockId="BME280_GET_PRESSURE"
    //% block="Pressuer / 気圧 %Pu　Accuracy / 精度 %Prd"
    //% weight=80 blockGap=8
    export function pressure(Pu: BME280_P,Prd: RPoint): number {
        get();
        return Rnber(P/Pu,Prd);
    }

    /**
     * Get temperature value from BME280 sensor/ BME280 センサーから気温を取得
     *
     * @param u Temperature unit (C or F) / 温度の単位（C または F）
     * @returns Temperature value / 気温の値（単位に応じた小数第1位）
     */
    //% blockId="BME280_GET_TEMPERATURE"
    //% block="Tempratuere /気温 %Tu Accuracy / 精度 %Trd"
    //% weight=80 blockGap=8
    export function temperature(Tu: BME280_T, Trd: RPoint): number {
        get();
        let tmp=T
        if (Tu == BME280_T.T_F) { 
            //Fahrenheit degree/華氏	
            tmp = T * 9 / 5 + 32;
        }
        return Rnber(tmp , Trd);
    }

    /**
     * Get humidity value from BME280 sensor / BME280 センサーから湿度を取得
     *
     * @param u Humidity unit % / 湿度の単位 %
     * @returns Humidity value / 湿度の値（小数第1位）
     */
    //% blockId="BME280_GET_HUMIDITY"
    //% block="Humidity / 湿度 精度 %Hrd"
    //% weight=80 blockGap=8
    export function humidity(Hrd:RPoint): number {
        get();
        return Rnber(H,Hrd);
    }
    //Sensor power control (Power ON and OFF)
    //センサーの電源管理（起動と停止）
    /**
     * power on / センサー起動
     */
    //% blockId="BME280_POWER_ON" block="
    //% block="Power On Sensor /センサー起動""
    //% weight=22 blockGap=8
    export function PowerOn() {
        setreg(0xF4, 0x2F)
    }

    /**
     * power oFF　センサー停止
     */
    //% blockId="BME280_POWER_OFF"
    //% block="Power OFF Sensor/センサー停止"
    //% weight=21 blockGap=8
    export function PowerOff() {
        setreg(0xF4, 0)
    }

    /**
     * Calculate Elevation difference /標高差の計算
     * Input the reference point pressure P0 into the block
     * Get the current pressure and temperature from the sensor.
     * 基準点の気圧P0をブロックに入力
     * 現在の気圧・気温はセンサ-から取得
     */
    //% block="Elevation difference(標高差) %ELU Pressure (reference point)(気圧(基準点)) %P0 %uP0"
    //% blockId="Elevation_difference"
    //% weight=80  blockGap=8
    export function getElevationdifference(Elu:Eldf,P0: number, uP1: BME280_P):number {
        get();
        // Eprs:Current Pressure / 現地点の気圧
        let Eprs = P    
         // Etemp:Current Temperatuer（kelvin） /　現地点の気温（絶対温度）
        let Etemp = T+273.15 //Celsius->kelvin　/ 摂氏－＞絶対温度
        // Unification of units /単位の統一
        // If the unit of the pressure P0 at the reference point is Pa, multiply P0 by 1. 
        // If the unit is hPa, multiply P0 by 100.
        // 基準点の気圧P0の単位がPaならそのまま、hPaなら1/100
        // uP1:P->1 hPa->1/100
        Eprs = Eprs *1/uP1 

        // Calculate Elevation difference / 標高差計算
        // 0.0065-> Tropospheric temperature lapse rate (0.65℃/100m) 
        // 0.0065-> 対流圏の気温減率（0.65℃/100ｍ）
        let rt=(Math.pow((P0/Eprs),1/5.257)-1)*Etemp
        //　Calculate Elevation difference / 標高差を算出 (Units/単位:m)
        let Diffelev=rt/0.0065
        // Convert values ​​according to altitude units /高度の単位に応じて数値を変換
        if(Elu==2){
            Diffelev=Diffelev*3.2808;}
         return Rnber(Diffelev,10);
    }

    /**
     * Calculate Saturated Vapor Pressure,
     * 飽和水蒸気圧
     */
    //% block="Saturated Vapor Pressure（飽和水蒸気圧）Temp/温度 %Ctemp Precision/精度 %SPdtp"
    //% weight=60 blockGap=10
    export function Calcsvp (Ctemp: number,SPdtp: RPoint) : number
    {
        let Rpnt=SPdtp
        let SatVapPress=SatVpad(Ctemp,Rpnt);
        let SVP=SatVapPress;
        return Rnber(SVP,Rpnt);
     }
     
    /**
     * Calculate Saturated Vapor Amount,
     * 飽和水蒸気量計算
     */
    //% block="Saturated Vapor Amount（飽和水蒸気量） Temp/温度 %Ctemp Precision/精度 %Sadtp"
    //% weight=60 blockGap=10
    export function Calcsva(Ctemp: number, Sadtp: RPoint): number {
        let Rpnt = Sadtp;
        let SVP = SatVpad(Ctemp, Rpnt);
        let SVA = 217 * SVP / (Ctemp + 273.15);
        return Rnber(SVA,Rpnt);
    }

    /**
     * Calculate Dew point
     * Dew Point:Improved Magnus formula / 露点：改良マグヌス式
     * 露点
     */
    //% block="Dew Point/露点　Temp/温度 %Dtemp Humidity / 湿度　%RH　Precision/精度 %dtprec"
    //% weight=60 blockGap=10
    export function getDewpoint(Dtemp: number, RH: number, dtprec: RPoint):number
    {
        get();
        let da = 17.62;
        let db = 243.12;
        let alpha = Math.log(RH / 100) + (da * Dtemp) / (db + Dtemp);
        let DPoint = (db * alpha) / (da - alpha);
        DPoint = Rnber(DPoint, 100);
        return DPoint        
    }
     /**
     * Event Block
     * イベントブロック
    */
    /**
     * Triggered when pressure is Lower than a specified value. / 気圧が指定値より低い場合
     *
     * @param dat Threshold value / しきい値（Pa）
     * @param body Action to perform / 実行する処理
     */
    //% block="Pressuer / 気圧 <  %dat" dat.defl=100000
    export function PressureBelowThan(dat: number, body: () => void): void {
        control.inBackground(function () {
            while (true) {
                get()
                if (P < dat) {
                    body()
                }
                basic.pause(1000)
            }
        })
    }

    /**
     * Triggered when pressure is Higher than a specified value.
     * 気圧が指定値より高い場合
     * @param dat Threshold value / しきい値（Pa）
     * @param body Action to perform / 実行する処理
     */
    //% block="Pressuer / 気圧 > %dat" dat.defl=100000
    export function PressureHigherThan(dat: number, body: () => void): void {
        control.inBackground(function () {
            while (true) {
                get()
                if (P > dat) {
                    body()
                }
                basic.pause(1000)
            }
        })
    }

    /**
     * Triggered when temprature is Lower than a specified value. 
     *  気温が指定値より低い場合
     *
     * @param dat Threshold value / しきい値（C）
     * @param body Action to perform / 実行する処理
     */
    //% block="Temperature / 気温 < %dat" dat.defl=10
    export function TemperatureBelowThan(dat: number, body: () => void): void {
        control.inBackground(function () {
            while (true) {
                get()
                if (T < dat) {
                    body()
                }
                basic.pause(1000)
            }
        })
    }

    /**
     * Triggered when tempratuere is Lower than a specified value.
     * 気温が指定値より低い場合
     *
     * @param dat Threshold value / しきい値（C）
     * @param body Action to perform / 実行する処理
     */
    //% block="Temperature / 気温 > %dat" dat.defl=30
    export function TemperatureHigherThan(dat: number, body: () => void): void {
        control.inBackground(function () {
            while (true) {
                get()
                if (T > dat) {
                    body()
                }
                basic.pause(1000)
            }
        })
    }

    /**
     * Triggered when humidity is Lower than a specified value. 
     * 湿度が指定値より低い場合
     * @param dat Threshold value / しきい値（C）
     * @param body Action to perform / 実行する処理
     */
    //% block="Humidity / 湿度 < %dat" dat.defl=10
    export function HumidityBelowThan(dat: number, body: () => void): void {
        control.inBackground(function () {
            while (true) {
                get()
                if (H < dat) {
                    body()
                }
                basic.pause(1000)
            }
        })
    }

    /**
     * Triggered when humidity is Higher than a specified value. 
     * 湿度が指定値より高い場合
     * @param dat Threshold value / しきい値（C）
     * @param body Action to perform / 実行する処理
     */
    //% block="Humidity / 湿度 > %dat" dat.defl=10
    export function HumidityHigherThan(dat: number, body: () => void): void {
        control.inBackground(function () {
            while (true) {
                get()
                if (H > dat) {
                    body()
                }
                basic.pause(1000)
            }
        })
    }

    /**
     * Set the I2C address of the BME280 sensor. / BME280 の I2C アドレスを設定
     * 
     *  @param addr I2C address to set / 設定する I2C アドレス
     */
    //% blockId="BME280_SET_ADDRESS"
    //% block="I2C Address/I2Cアドレス %addr"
    //% weight=20 blockGap=8
    export function Address(addr: BME280_I2C_ADDRESS) {
        BME280_I2C_ADDR = addr
    }
}
