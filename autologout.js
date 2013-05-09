// $Id:

Drupal.behaviors.autologout = function (context) {
  if(context == document) {
    var t = setTimeout(init, Drupal.settings.autologout.timeout);
    var paddingTimer;
  }
  
  function init() {
    if (Drupal.settings.autologout.jquery_ui) {
      paddingTimer = setTimeout(confirmLogout, Drupal.settings.autologout.timeout_padding);

      // While the countdown timer is going, lookup the remaining time. If there
      // is more time remaining (i.e. a user is navigating in another tab), then
      // reset the timer for opening the dialog.
      $.ajax({
        url : Drupal.settings.basePath + 'autologout_ajax_get_time_left',
        dataType: 'json',
        success: function(data) {
          window.console.log(data.time);
          if(data.time > 0) {
            clearTimeout(paddingTimer);
            t = setTimeout(init, data.time);
          } else {
            theDialog = dialog();
          }
        }
      });
    } else {
      if (confirm(Drupal.settings.autologout.message) ) {
        refresh();    
      } else {
        logout();
      }
    }    
  }
  
  function dialog() {
    return $('<div> ' +  Drupal.settings.autologout.message + '</div>').dialog({
      modal: true,
      closeOnEscape: false,
      width: 'auto',
      buttons: { 
        Reset: function() {
          $(this).dialog("destroy");
          clearTimeout(paddingTimer);
          refresh();
        },
        Logout: function() {
          $(this).dialog("destroy");
          logout();
        }
      },
      title: Drupal.settings.autologout.title,
      close: function(event, ui) {
        logout();
      }
    });
  }

  function refresh() {
    $.ajax({
      url: Drupal.settings.basePath + 'autologout_ahah_set_last',
      type: "POST",
      success: function() {
        t = setTimeout(init, Drupal.settings.autologout.timeout);
      },
      error: function(XMLHttpRequest, textStatus) {
        alert('There has been an error resetting your last access time: ' + textStatus + '.')
      },
    });
  }
  
  // A user could have used the reset button on the tab/window they're actively
  // using, so we need to double check before actually logging out.
  function confirmLogout() {
    $(theDialog).dialog('destroy');
    $.ajax({
      url : Drupal.settings.basePath + 'autologout_ajax_get_time_left',
      dataType: 'json',
      error: logout,
      success: function(data) {
        window.console.log(data.time);
        if(data.time > 0) {
          t = setTimeout(init, data.time);
        }
        else {
          logout();
        }
      }
    });
  }

  function logout() {
    $.ajax({
      url: Drupal.settings.basePath + 'autologout_ahah_logout',
      type: "POST",
      success: function() {
        document.location.href = Drupal.settings.autologout.redirect_url;
      },
      error: function(XMLHttpRequest, textStatus) {
        alert('There has been an error attempting to logout: ' + textStatus + '.')
      },
    });
  }
};
