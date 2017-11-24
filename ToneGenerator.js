/**
 * JavaScript source code
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: http://anhr.github.io/AboutMe/
 * source: https://github.com/anhr/ToneGenerator
 * example: http://anhr.github.io/ToneGenerator/
 * Thanks to https://github.com/RolandR/tonegen
 * Licences: GPL, The MIT License (MIT)
 * Copyright: (c) 2015 Andrej Hristoliubov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * Revision:
 *  2017-09-17, : 
 *       + init.
 *
 */

var toneGenerator = {
    create: function (options) {
        this.options = options;
        if (this.options == undefined) this.options = {};

        //https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
        if (this.options.audio == undefined) toneGenerator.audio = new (window.AudioContext || window.webkitAudioContext)();
        else toneGenerator.audio = this.options.audio;

        if (this.options.muted == undefined) this.options.muted = false;
        if (this.options.wave == undefined) this.options.wave = "sine";
//        if (this.options.frequency == undefined) this.options.frequency = 440;
        if (this.options.volume == undefined) this.options.volume = Math.pow(0.3, 2);
        if (this.options.pan == undefined) this.options.pan = 0;

        this.createAudioContext = function () {
            if (!toneGenerator.audio) {
                consoleError("Coudn't initiate audio context!");
                return false;
            }
            if (this.oscillator != undefined)
                return true;
            this.oscillator = toneGenerator.audio.createOscillator();
            this.oscillator.type = this.options.wave;
            if (this.options.frequency != undefined) this.oscillator.frequency.value = this.options.frequency;
//            this.oscillator.start();

            this.gain = toneGenerator.audio.createGain();
            this.gain.gain.value = this.options.muted ? 0 : this.options.volume;

            this.panner = toneGenerator.audio.createPanner();
            this.panner.setPosition(Math.sin(this.options.pan), 0, Math.cos(this.options.pan));

            this.analyser = toneGenerator.audio.createAnalyser();
            //this.analyser.smoothingTimeConstant = 1;

            toneGenerator.audio.suspend();
            this.oscillator.connect(this.gain);
            this.gain.connect(this.panner);
            this.panner.connect(this.analyser);
            this.analyser.connect(toneGenerator.audio.destination);
            return true;
        }
        if (!this.createAudioContext())
            return;
        this.playing = false;
        this.toggle = function () {
            this.playing = !this.playing;
            if (this.playing) {
                this.start();
                return true;
            }
            this.stop();
            return false;
        }
        this.start = function () {
            consoleLog('toneGenerator.start() ');// + JSON.stringify(this.options));
            if (!this.createAudioContext())
                return;
            toneGenerator.audio.resume();
            if (!this.options.muted) this.gain.gain.value = this.options.volume;

            //Periodic Wave https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createPeriodicWave
            if (this.options.arraysPeriodicWave != undefined)
                this.oscillator.setPeriodicWave(ac.createPeriodicWave(this.options.arraysPeriodicWave.real, this.options.arraysPeriodicWave.imag));
/*
            //Add harmonics
            if (this.options.harmonics != undefined) {
                for (i = 0; i < options.harmonics.length; i++) {
                    var harmonic = options.harmonics[i];
                    consoleLog('harmonic ' + i + ': ' + JSON.stringify(harmonic));
                    harmonic.toneGenerator = new toneGenerator.create({
                        audio: options.audio,
                        frequency: (this.options.frequency == undefined ? this.oscillator.frequency.value : this.options.frequency) * (i + 2),
                        attenuation: options.attenuation,
                        time: options.time,
                        volume: harmonic.volume,
                        scope: options.scope
                    });
                    harmonic.toneGenerator.start();
                }
            }
*/
            //attenuation
            if (this.options.attenuation != undefined) {
                if ((this.options.attenuation.time != undefined) && (this.options.attenuation.volume != undefined)) {
                    this.clearInterval();
                    var tg = this;
                    this.options.timerIdInterval = setInterval(function () {
                        tg.gain.gain.value /= options.attenuation.volume;
                        if (options.harmonics != undefined)
                            options.harmonics.forEach(function (harmonic) { harmonic.toneGenerator.gain.gain.value /= options.attenuation.volume; });
                    }, this.options.attenuation.time / 50);

                    //stop
                    if (this.options.timerIdTimeout != undefined) {
                        clearTimeout(this.options.timerIdTimeout);
                        delete this.options.timerIdTimeout;
                    }
                    if (this.options.attenuation.time != undefined)
                        this.options.timerIdTimeout = setTimeout(function () { tg.stop(); }, this.options.attenuation.time);
                } else consoleError('options.attenuation: ' + JSON.stringify(this.options.attenuation));
            }
            this.oscillator.start();
            switch (typeof options.scope) {
                case "object": this.oscillator.connect(options.scope.input); break;
                case "undefined": break;
                default: consoleError('scope: ' + options.scope);
            }
        }
        this.stop = function () {
            consoleLog('toneGenerator.stop()');// + JSON.stringify(this.options));
            if (this.oscillator != undefined)
                this.oscillator.stop();
            delete this.oscillator;
            this.clearInterval();
            if (this.options.harmonics != undefined) this.options.harmonics.forEach(function (harmonic) { harmonic.toneGenerator.stop(); });
        }
        this.clearInterval = function () {
            if (this.options.timerIdInterval == undefined)
                return;
            clearTimeout(this.options.timerIdInterval);
            delete this.options.timerIdInterval;
        }
    },
    newToneGenerator: function (event, options) {
        var el = getElementFromEvent(event);
        if (el.toneGenerator == undefined) el.toneGenerator = new toneGenerator.create(options);
        return el;
    },
}
