// This will be called by the admin adapter when the settings page loads
function load(settings, onChange) {
  console.log("start load")

  if (!settings) return;
  if (!settings.hostip) {
    const href = `${window.location.protocol || "http:"}//${window.location.hostname || "127.0.0.1"}:8087`
    settings.hostip = href
  }
  // Boilerplate code: Fetch boolean and text values from config to the UI and add "changed" handlers
  // to each input element identified by class "value"
  $('.value').each(function () {
    var $key = $(this);
    console.log("load 1: ")
    console.log($key)
    var id = $key.attr('id');
    if ($key.attr('type') === 'checkbox') {
      // do not call onChange direct, because onChange could expect some arguments
      $key.prop('checked', settings[id])
        .on('change', () => onChange())
        ;
    } else {
      // do not call onChange direct, because onChange could expect some arguments
      $key.val(settings[id])
        .on('change', () => onChange())
        .on('keyup', () => onChange())
        ;

    }
  });

  /* Doesn'nt work with current Dingz!
  $('#url').on('blur', () => {
    console.log("update url " + $('#url').val())
    const requestOptions = {
      method: 'GET',
      redirect: 'follow',
      headers: {
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Encoding": "gzip,deflate",
        "User-Agent": "Mozilla/5.0"
      },
    }
    fetch("http://192.168.16.59/api/v1/action", requestOptions)
      .then(response => response.text())
      .then(result => applyValues(result))
      .catch(err => console.log("error", err));
  })
  */
  $('#sw-btn').hide()
  $('#sw-pir').hide()
  $('#btn1_actions').hide()
  $('#btn2_actions').hide()
  $('#btn3_actions').hide()
  $('#btn4_actions').hide()
  onChange(false);

  $('#trackbtn1').change(button_change);
  $('#trackbtn2').change(button_change);
  $('#trackbtn3').change(button_change);
  $('#trackbtn4').change(button_change);

  
  // reinitialize all the Materialize labels on the page if you are dynamically adding inputs:
  if (M) M.updateTextFields();
}

// Boilerplate code: Fetch values from all elements classed "value" and store them in the config.
// This will be called by the admin adapter when the user presses the save button
function save(callback) {
  // example: select elements with class=value and build settings object
  var obj = {};
  $('.value').each(function () {
    var $this = $(this);
    if ($this.attr('type') === 'checkbox') {
      obj[$this.attr('id')] = $this.prop('checked');
    } else {
      obj[$this.attr('id')] = $this.val();
    }
  });
  if (obj.url.indexOf("://") == -1) {
    obj.url = "http://" + obj.url
  }
  if (obj.hostip.indexOf("://") == -1) {
    obj.hostip = "http://" + obj.hostip
  }
  callback(obj);
}

function button_change() {
  const elem = $(this);
  const id = elem.prop('id');
  const button_name = id.substring(id.length - 4);

  // Show or hide button entry on buttons page
  const actions = $('#' + button_name + '_actions');
  if ( elem.prop('checked') ) {
    actions.show();
  } else {
    actions.hide();
  }

  // decide if button tab is shown
  var show_button = document.getElementById('trackbtn1').checked
                 || document.getElementById('trackbtn2').checked
                 || document.getElementById('trackbtn3').checked
                 || document.getElementById('trackbtn4').checked;

  if (show_button) {
    $('#sw-btn').show();
  } else {
    $('#sw-btn').hide();
  }

}
