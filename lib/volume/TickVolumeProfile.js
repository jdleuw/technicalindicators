import { Indicator, IndicatorInput } from '../indicator/indicator';
export class TickVolumeProfileInput extends IndicatorInput {
}
export class TickVolumeProfileOutput {
}

export class TickVolumeProfile extends Indicator {
    constructor(input) {
        super(input);
        
        var prices = input.price;
        var volumesUp = input.volumeUp;
        var volumesDown = input.volumeDown;
        var volumes = input.volume;
        
        var bars = input.noOfBars;
        if (!(prices.length === volumes.length)) {
            throw ('Inputs(prices, volumes) not of equal size');
        }
        
        var combined = [...prices].map((price, i) => {
          return {
            price,
            volumeUp: volumesUp[i],
            volumeDown: volumesDown[i],
            volume: volumes[i],
          }
        })

        var maxPrice = Math.max(...prices);
        var minPrice = Math.min(...prices);
        var totalVolume = volumes.reduce((a, b) => a + b, 0)
        
        var maxVolume = Math.max(...volumes)
        var maxVolumeIdx = volumes.indexOf(maxVolume)
        var addedVolume = 0, lowerBarIdx = maxVolumeIdx, upperBarIdx = maxVolumeIdx, n = 0;
        do {
          if (lowerBarIdx === 0) {
            upperBarIdx++
            addedVolume += volumes[upperBarIdx];
          } else if (upperBarIdx === volumes.length - 1) {
            lowerBarIdx--
            addedVolume += volumes[lowerBarIdx];
          } else {
            if (volumes[upperBarIdx+1] > volumes[lowerBarIdx-1]) {
              upperBarIdx++
              addedVolume += volumes[upperBarIdx];
            } else {
              lowerBarIdx--
              addedVolume += volumes[lowerBarIdx];
            }
          }

          n++
        } while (addedVolume <= (totalVolume * 0.7) && n < volumes.length)

        var hvn = [...combined].filter(b => b.price !== prices[maxVolumeIdx])
        hvn.sort((a, b) => b.volume - a.volume)
        
        var lvn = [...combined].filter(b => b.price !== prices[maxVolumeIdx])
        lvn.sort((a, b) => a.volume - b.volume)
        
        
        this.result = {
          vah: prices[upperBarIdx],
          val: prices[lowerBarIdx],
          poc: prices[maxVolumeIdx],
          ph: maxPrice,
          pl: minPrice,
          vol: totalVolume,
          pocvol: volumes[maxVolumeIdx],
          hvn: hvn.slice(0, 10).map(b => b.price),
          lvn: lvn.slice(0, 10).map(b => b.price),
          poc_hvn: hvn.filter(b => Math.abs(b.price - prices[maxVolumeIdx]) < 0.02 * b.price).slice(0, 10).map(b => b.price),
          poc_lvn: lvn.filter(b => Math.abs(b.price - prices[maxVolumeIdx]) < 0.02 * b.price).slice(0, 10).map(b => b.price),
        };
    }
    ;
    nextValue(price) {
        throw ('Next value not supported for volume profile');
    }
    ;
}

TickVolumeProfile.calculate = tickvolumeprofile;
export function tickvolumeprofile(input) {
    var result = new TickVolumeProfile(input).result;
    return result;
}
;
