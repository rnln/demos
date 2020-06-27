'use strict';

function formatSeconds(seconds) {
  let date = new Date(0);
  date.setSeconds(+seconds);
  date = date.toISOString().substr(11, 8);
  date = date.replace(/^(0+:0+)+/g, '');
  if (date.length == 3) date = '0' + date;
  return date;
}

/**
 * 
 * @param {Element} container 
 */
function loadWaveform(container) {
  let dataPath = container.getAttribute('data-path');
  let wavesurfer = WaveSurfer.create({
    container: container,
    cursorWidth: 1,
    partialRender: true,
    pixelRatio: 1,
    height: 37,
    responsive: true,
    hideScrollbar: true,
    backgroundColor: '#000',
    cursorColor: '#fff',
    progressColor: '#fff',
    waveColor: '#fffc',
    backend: 'MediaElement',
    mediaControls: false,
    plugins: [
      WaveSurfer.cursor.create({
        followCursorX: true,
        showTime: true,
        // width: '2px',
        color: '#fff8',
        opacity: 1,
        formatTimeCallback: seconds => formatSeconds(seconds),
        customShowTimeStyle: {
          'background-color': '#fff8',
          color: '#000',
          padding: '.1rem .3rem',
          'font-size': '10px',
          'margin-left': '1px',
          'margin-right': '1px'
        }
      })
    ]
  });
  wavesurfer.on('error', e => console.warn(e));
  fetch(dataPath + '.json')
  .then(response => {
      if (!response.ok) throw new Error("HTTP error " + response.status);
      return response.json();
  })
  .then(peaks => wavesurfer.load(dataPath + '.wav', peaks.data))
  .catch(e => console.error('error', e));

  let containerRow = container.parentElement.parentElement
  containerRow.querySelector('[data-action="play"]')
  .addEventListener('click', function() {
    wavesurfer.playPause();
    if (wavesurfer.isPlaying()) {
      this.querySelector('[class*="play"]').classList.add('d-none');
      this.querySelector('[class*="pause"]').classList.remove('d-none');
    } else {
      this.querySelector('[class*="play"]').classList.remove('d-none');
      this.querySelector('[class*="pause"]').classList.add('d-none');
    }
  });

  let durationTimer = setInterval(() => {
    let duration = wavesurfer.getDuration();
    if (duration > 0) {
      clearInterval(durationTimer);
      duration = formatSeconds(duration);
      containerRow.querySelector('.duration').innerHTML = duration;
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  let waveforms = document.querySelectorAll('.waveform');
  for (let container of waveforms) {
    loadWaveform(container);
  }

  // document
  //   .querySelector('[data-action="play"]')
  //   .addEventListener('click', wavesurfer.playPause.bind(wavesurfer));
});
