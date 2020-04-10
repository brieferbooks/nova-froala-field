import FroalaEditor from 'froala-editor';

// Add the custom speak button
(function(FroalaEditor){

    if( ! Nova.config.voiceSynthesizeUri ) return;

    let audioLoading = false;
    let audioPlaying = false;
    let audio = null;

    FroalaEditor.RegisterShortcut(74, 'speak', '', 'J', false);
    FroalaEditor.DefineIcon('speakIcon', {NAME: 'Listen', template: 'text'})
    FroalaEditor.RegisterCommand('speak', {
        title: 'Listen To Selected',
        icon: 'speakIcon',
        focus: true,
        showOnMobile: true,
        refreshAfterCallback: true,

        callback: function () {
            let voiceSynthesizeUri = Nova.config.voiceSynthesizeUri;
            let $btn = this.$tb.find('[data-cmd="speak"]');
            let $btnText = $btn.find('span').first();

            if( audioLoading ) return;

            if( audioPlaying ) {
                // If there is audio playing, just stop playing it
                audio.pause();
                $btnText.text('Listen');

                audioPlaying = false;
                audioLoading = false;
                return;
            }

            // Make a selection
            if( this.selection.text().trim() == '' ){
                this.commands.selectAll();
            }

            $btnText.text('Loading...');
            $btn.addClass('fr-disabled');
            audio = new Audio( voiceSynthesizeUri + '?text=' + encodeURIComponent(this.selection.text().trim()));
            audioLoading = true;
            audio.play();

            audio.addEventListener('playing', function(){
                audioPlaying = true;
                audioLoading = false;
                $btn.removeClass('fr-disabled');
                $btnText.text('Stop');
            }.bind(this));

            audio.addEventListener('ended', function(){
                audioPlaying = false;
                $btn.removeClass('fr-disabled');
                $btnText.text('Listen');
            }.bind(this));

            audio.addEventListener('error', function(){
                audioPlaying = false;
                audioLoading = false;
                $btn.removeClass('fr-disabled');
                $btnText.text('Listen');

                if( ! _.isUndefined(Nova) ) {
                    Nova.app.$toasted.show('Matthew is a little tired. Please try again shortly.', { type: 'error' });
                }
            });
        },

        refresh: function () {
        }
    });

})(FroalaEditor);
