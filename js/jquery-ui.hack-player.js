jQuery.fn.extend({
  hackPlayer: function(options) {
    var iframe = $('<iframe></iframe>');
    iframe.attr('src', options.src).css({
      border: 'none',
      visibility: 'hidden',
      width: this.width(),
      height: this.height() - 45
    });
    iframe.load(function() {
      if (options.zoom)
        $(this).zoom(options.zoom);
      $(this).attachHackPlayer(function(player) {
        var playSpeed = options.playSpeed || 1000;
        var playerIntervalID = null;

        function stop() {
          if (playerIntervalID !== null) {
            clearInterval(playerIntervalID);
            playerIntervalID = null;
          }
          playPause.button("option", {icons: {primary: "ui-icon-play"}});
        }

        function step() {
          player.goForward();
          scrubber.slider("value", player.getPosition());
          if (!player.canGoForward())
            stop();
        }

        function play() {
          if (playerIntervalID === null) {
            playerIntervalID = setInterval(step, playSpeed);
            playPause.button("option", {icons: {primary: "ui-icon-pause"}});
            if (player.canGoForward())
              step();
            else {
              player.goToBeginning();
              scrubber.slider("value", 0);
            }
          }
        }

        scrubber.slider({
          value: 0,
          min: 0,
          max: player.getEndPosition(),
          step: 1,
          slide: function(event, ui) {
            player.goTo(ui.value);
          }
        });
        playPause.button({text: false}).click(function() {
          if (playerIntervalID === null)
            play();
          else
            stop();
        });
        $(this).css("visibility", "visible").focus();
        controls.show();
        stop();
        if (options.startAtEnd) {
          player.goToEnd();
          scrubber.slider("value", player.getEndPosition());
        }
      });
    });
    var controls = $('<div></div>');
    var playPause = $('<button>&nbsp;</button>').css({
      width: 32,
      height: 32,
      marginLeft: 4,
      marginRight: 15
    });
    var scrubber = $('<span></span>').css({
      display: 'inline-block',
      width: iframe.width() - 70
    });
    controls.append(playPause, scrubber);
    this.empty().append(iframe, controls);
    controls.hide().css({marginTop: 4});
  }
});
