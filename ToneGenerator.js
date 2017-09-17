/**
 * JavaScript source code
 * Author: Andrej Hristoliubov
 * email: anhr@mail.ru
 * About me: http://anhr.ucoz.net/AboutMe/
 * source: https://github.com/anhr/ToneGenerator
 * example: http://anhr.ucoz.net/ToneGenerator/
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

function toneGenerator(options) {
    this.options = options;
    if (typeof this.options == 'undefined') this.options = {};
    if (typeof this.options.muted == 'undefined') this.options.muted = false;
    if (typeof this.options.wave == 'undefined') this.options.wave = "sine";
    if (typeof this.options.frequency == 'undefined') this.options.frequency = 440;
    if (typeof this.options.volume == 'undefined') this.options.volume = Math.pow(0.3, 2);
    if (typeof this.options.pan == 'undefined') this.options.pan = 0;

    this.audio = new (window.AudioContext || window.webkitAudioContext)();
    if (!this.audio) {
        consoleError("Coudn't initiate audio context!");
        return;
    }

    this.oscillator = this.audio.createOscillator();
    this.oscillator.type = this.options.wave;
    this.oscillator.frequency.value = this.options.frequency;
    this.oscillator.start();

    this.gain = this.audio.createGain();
    this.gain.gain.value = this.options.muted ? 0 : this.options.volume;

    this.panner = this.audio.createPanner();
    this.panner.setPosition(Math.sin(this.options.pan), 0, Math.cos(this.options.pan));

    this.analyser = this.audio.createAnalyser();
    //this.analyser.smoothingTimeConstant = 1;

    this.audio.suspend();
    this.oscillator.connect(this.gain);
    this.gain.connect(this.panner);
    this.panner.connect(this.analyser);
    this.analyser.connect(this.audio.destination);

    this.playing = false;
    this.toggle = function () {
        this.playing = !this.playing;
        this.playing ? this.start() : this.stop();
        return this.playing;
    }
    this.start = function () {
        consoleLog('toneGenerator.start() ' + JSON.stringify(this.options));
        this.audio.resume();
        if (!this.options.muted) this.gain.gain.value = this.options.volume;
    }
    this.stop = function () {
        consoleLog('toneGenerator.stop()' + JSON.stringify(this.options));
        this.gain.gain.value = 0;
        var audio = this.audio;
        setTimeout(function () { audio.suspend(); }, 100);
        // The timeout and gain=0 is to avoid a harsh popping sound on suspend
    }
}
