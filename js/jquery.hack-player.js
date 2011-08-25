(function(jQuery) {
  function HackPlayer(ui) {
    var position = 0;
    var maxPosition = 0;

    while (ui.commandManager.canUndo()) {
      maxPosition++;
      ui.commandManager.undo();
    }

    var self = {
      goTo: function(newPosition, isInstant) {
        if (newPosition < 0)
          newPosition = maxPosition + 1 + newPosition;
        if (newPosition >= 0 && newPosition <= maxPosition) {
          while (position < newPosition)
            self.goForward(isInstant);
          while (position > newPosition)
            self.goBack(isInstant);
        }
      },
      getPosition: function() {
        return position;
      },
      getEndPosition: function() {
        return maxPosition;
      },
      goBack: function(isInstant) {
        if (!self.canGoBack())
          return false;
        if (isInstant)
          ui.commandManager.undo();
        else
          ui.mixMaster.undo();
        position--;
        return true;
      },
      goForward: function(isInstant) {
        if (!self.canGoForward())
          return false;
        if (isInstant)
          ui.commandManager.redo();
        else
          ui.mixMaster.redo();
        position++;
        return true;
      },
      canGoBack: function() {
        return ui.commandManager.canUndo();
      },
      canGoForward: function() {
        return ui.commandManager.canRedo();
      },
      goToBeginning: function() {
        while (self.canGoBack())
          self.goBack(true);
      },
      goToEnd: function() {
        while (self.canGoForward())
          self.goForward(true);
      }
    };
    
    return self;
  }

  jQuery.fn.extend({
    zoom: function(scale) {
      this.contents().find("html").css({
        '-webkit-transform': 'scale(' + scale + ')',
        '-webkit-transform-origin': 'top left',
        '-moz-transform': 'scale(' + scale + ')',
        '-moz-transform-origin': 'top left'
      });
      
      return this;
    },
    attachHackPlayer: function(cb) {
      var iframe = this[0];
    
      var window = iframe.contentWindow;
      var document = iframe.contentDocument;
    
      window.webxrayWhenGogglesLoad = function(ui) {
        var player = HackPlayer(ui);

        // Hide the HUD and transparent welcome message.
        ui.jQuery('.webxray-tmsg-overlay, .webxray-hud').hide();
        ui.input.deactivate();
        $(iframe).data('player', player);
        cb.call(iframe, player);
      };

      // Inject the goggles.
      (function(){
        var script=document.createElement('script');
        script.src='https://secure.toolness.com/webxray/webxray.js';
        script.className='webxray';
        document.head.appendChild(script);
      })();
      
      return this;
    }
  });
})(jQuery);
