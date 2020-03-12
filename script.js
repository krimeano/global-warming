google.charts.load('current', {'packages': ['corechart']});
google.charts.setOnLoadCallback(setReadyAndDraw);


const elementError = document.getElementById('errorMessage');
let isChartReady = false;
let dataToDraw;


function handleCountrySelected(countryCode) {
  elementError.innerHTML = '';
  loadEmissionData(countryCode, handleResponse);
}


function loadEmissionData(countryCode, cb) {
  const uri = `./data/${countryCode}.json`;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', uri);
  xhr.responseType = 'json';
  xhr.send();

  xhr.onload = function () {
    if (xhr.status !== 200) {
      return cb(new Error(`Can't load data from ${uri}: ${xhr.status} ${xhr.statusText}`));
    }
    cb(null, xhr.response);
  };

  xhr.onerror = function () {
    console.error(xhr);
    cb(new Error(`Can't load data from ${uri}`));
  }
}


function handleResponse(err, data) {
  if (err) {
    console.error('ERROR:', err);
    elementError.innerHTML = err.message || err;
    return;
  }
  try {
    dataToDraw = prepareData(data);
    draw();
  } catch (err) {
    elementError.innerHTML = err.message || err;
  }
}

function prepareData(jsonData) {
  const graphData = [[jsonData.country, 'Co2 emissions']];
  Object.getOwnPropertyNames(jsonData).filter((year) => year !== 'country')
    .forEach((year) => {
      graphData.push([year, jsonData[year]]);
    });
  return graphData;
}


function setReadyAndDraw() {
  isChartReady = true;
  draw();
}

let chart;

function draw() {
  if (!dataToDraw || !isChartReady) {
    return;
  }
  const data = google.visualization.arrayToDataTable(dataToDraw);
  const options = {
    title: `C02 emissions in ${dataToDraw[0][0]}`,
    curveType: 'function',
    legend: {position: 'bottom'}
  };
  chart = chart || new google.visualization.LineChart(document.getElementById('curve_chart'));
  chart.draw(data, options);
}