let timeGapMS = 60 * 1000;
let columnSeparator = '  ';
let lineSeparator = '\n';

function slashes(str) {
  return str.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

async function logic(fileHandle) {
  lineSeparator = slashes(document.getElementById('lineSeparator').value);
  columnSeparator = slashes(document.getElementById('columnSeparator').value);
  timeGapMS = document.getElementById('timeGapSec').value * 1000;

  const avi = await getHTML5FileContent(fileHandle);

  const groups = transform(avi);

  download('res.csv', groups);
}

function transform(avi) {
  const [firstDoc, ...restDocs] = avi
    .trim()
    .split(lineSeparator)
    .map((line) => line.trim().split(columnSeparator))
    .map(([date, price, , , e, , , , i]) => ({ originalDate: date, date: parseDate(date), price: parseFloat(price), e, i }));

  const groups = [{ date: firstDoc.originalDate, price: firstDoc.price, e: firstDoc.e, i: firstDoc.i }];
  let lastDate = firstDoc.date;

  for (const { date, price, originalDate, e, i } of restDocs) {
    // console.log(date, lastDate)
    if (date - lastDate < timeGapMS) {
      groups[groups.length - 1].price += price;
    } else {
      lastDate = date;
      groups.push({ date: originalDate, price, e, i });
    }
  }

  const transformedGroups = groups.map((group) => Object.values(group).join(columnSeparator)).join(lineSeparator);
  return transformedGroups;
}

function getHTML5FileContent(fileHandle) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      resolve(event.target.result);
    });
    reader.readAsText(fileHandle);
  });
}

function parseDate(date) {
  return new Date(date.replace(/^(\d\d)\/(\d\d)/, '$2/$1'));
  // const [day, month, ...rest] = date.split('/');
  // return  new Date([month, day, ...rest].join('/'));
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}