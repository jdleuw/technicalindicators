import { Indicator, IndicatorInput } from '../indicator/indicator';
export class VolumeProfileInput extends IndicatorInput {
}
export class VolumeProfileOutput {
}
export function priceFallsBetweenBarRange(low, high, low1, high1) {
    return (low <= low1 && high >= low1) || (low1 <= low && high1 >= low);
}
export class VolumeProfile extends Indicator {
    constructor(input) {
        super(input);
        var highs = input.high;
        var lows = input.low;
        var closes = input.close;
        var opens = input.open;
        var volumesUp = input.volumeUp;
        var volumesDown = input.volumeDown;
        var volumes = input.volume;

        if (volumesUp.length && volumesDown.length && volumesUp.length === volumesDown.length && (!volumes || !volumes.length)) {
          volumes = volumesUp
          volumesDown.map((current, index) => volumes[index] += current)
        }
        var bars = input.noOfBars;
        if (!((lows.length === highs.length) && (highs.length === closes.length) && (highs.length === volumes.length))) {
            throw ('Inputs(low, high, close, volumes) not of equal size');
        }
        this.result = {
          bars: []
        };
        var max = Math.max(...highs, ...lows, ...closes, ...opens);
        var min = Math.min(...highs, ...lows, ...closes, ...opens);
        var totalVolume = volumes.reduce((a, b) => a + b, 0)
        var barRange = (max - min) / bars;
        var lastEnd = min;
        for (let i = 0; i < bars; i++) {
            let rangeStart = lastEnd;
            let rangeEnd = rangeStart + barRange;
            lastEnd = rangeEnd;
            let bullishVolume = 0;
            let bearishVolume = 0;
            let barVolume = 0;
            let upVolume = 0;
            let downVolume = 0;
            for (let priceBar = 0; priceBar < highs.length; priceBar++) {
                let priceBarStart = lows[priceBar];
                let priceBarEnd = highs[priceBar];
                let priceBarOpen = opens[priceBar];
                let priceBarClose = closes[priceBar];
                let priceBarVolume = volumes[priceBar];
                let priceBarUpVolume = volumesUp[priceBar];
                let priceBarDownVolume = volumesDown[priceBar];
                if (priceFallsBetweenBarRange(rangeStart, rangeEnd, priceBarStart, priceBarEnd)) {
                    barVolume = barVolume + priceBarVolume;
                    upVolume = upVolume + priceBarUpVolume;
                    downVolume = downVolume + priceBarDownVolume;
                    if (priceBarOpen > priceBarClose) {
                        bearishVolume = bearishVolume + priceBarVolume;
                    }
                    else {
                        bullishVolume = bullishVolume + priceBarVolume;
                    }
                }
            }
            this.result.bars.push({
                rangeStart, rangeEnd, bullishVolume, bearishVolume, barVolume, upVolume, downVolume
            });
        }

        let highestBar = this.result.bars.reduce((a, b) => a.barVolume > b.barVolume ? a : b)
        let highestBarIdx = this.result.bars.indexOf(highestBar)

        let addedVolume, lowerBarIdx = highestBarIdx, upperBarIdx = highestBarIdx, n = 0;
        do {
          if (lowerBarIdx === 0) {
            upperBarIdx++
            addedVolume += this.result.bars[upperBarIdx].barVolume;
          } else if (upperBarIdx === 0) {
            lowerBarIdx--
            addedVolume += this.result.bars[lowerBarIdx].barVolume;
          } else {
            if (this.result.bars[upperBarIdx].barVolume > this.result.bars[lowerBarIdx].volume) {
              upperBarIdx++
              addedVolume += this.result.bars[upperBarIdx].barVolume;
            } else {
              lowerBarIdx--
              addedVolume += this.result.bars[lowerBarIdx].barVolume;
            }
          }

          n++
        } while (addedVolume <= totalVolume * 0.7 && n < this.result.bars.length)

        this.result.lowerRange = this.result.bars[lowerBarIdx].rangeStart
        this.result.upperRange = this.result.bars[upperBarIdx].rangEnd

    }
    ;
    nextValue(price) {
        throw ('Next value not supported for volume profile');
    }
    ;
}
VolumeProfile.calculate = volumeprofile;
export function volumeprofile(input) {
    Indicator.reverseInputs(input);
    var result = new VolumeProfile(input).result;
    if (input.reversedInput) {
        result.bars.reverse();
    }
    Indicator.reverseInputs(input);
    return result;
}
;
