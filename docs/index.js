'use strict'
const files = window.__print2a_files;
const BASE_URL = 'https://github.com/MSFTserver/print2a/tree/master/';
const RAWFILE_BASE_URL = 'https://raw.githubusercontent.com/MSFTserver/print2a/master/'

const INITIAL_LIST_LENGTH = 10;
// const TOOLTIP_README_SNIPPET = new RegExp(/description[\s\S\n\nr]*(.*)/, 'gi');

function handleUrls(string) {
  return string.replace('%','%25');
}

function render(html) {
  $('#results').html(html);
  $('.tooltip').tooltipster({
    side: 'right',
    interactive: true,
    contentAsHTML: true,
    content: 'Loading readme...',
    functionBefore: function(instance, helper) {
      const $origin = $(helper.origin);

      if ($origin.data('loaded') !== true) {
        const linkData = JSON.parse($origin.attr('data'));

        $.get(`${RAWFILE_BASE_URL}${linkData.readmePath}`, function(readmeData) {
          const readme = readmeData.replace(/(\n)/gi,'<br>');
console.log(readme);
          instance.content(readme);
          $origin.data('loaded', true);
        });
      }
    }
  });
}

function listResults(array) {
  if(!array) {
    return null;
  }

  const html = array.map(r => {
    const href = `${handleUrls(BASE_URL+r.location)}`;
    const data = JSON.stringify({
      readmePath: r.readme
    });
    const link = `<a target="_blank" href="${href}">${r.location}</a>`;
    return `<li class="tooltip" data=${data}>${link}</li>`;
  }).join('');

  return '<ul>'+html+'</ul>';
}

// when searching by file location
$('#searchLocation').change(function(e) {
  const search = $(this).val();
  let html = null;
  if(search == '') {
    html = listResults();
  } else {
    const results = files.filter(f => f.location.toLowerCase().indexOf(search.toLowerCase()) > -1);
    html = listResults(results);
  }

  render(html);
});

// when searching by tag(s)
$('#searchTag').change(function(e) {
  const search = $(this).val();
  let html = null;
  if(search == '') {
    html = listResults();
  } else {
    const reg = new RegExp(search, 'gi');
    const results = files.filter(f => f.tags.some(t => t.search(reg) > -1));
    html = listResults(results);
  }

  render(html);
});

$(document).ready(function(){
  // initial display
  const initialDisplay = files.sort((a,b) => dayjs(a.mtime).subtract(dayjs(b.mtime)))
  const list = listResults(initialDisplay.slice(0,INITIAL_LIST_LENGTH));
  const firstDisplay = `<h3>The latest additions:</h3> ${list}`;
  render(firstDisplay);
});