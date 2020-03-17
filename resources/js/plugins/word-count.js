import FroalaEditor from 'froala-editor';

(function(FroalaEditor){

    // Add an option for your plugin.
    FroalaEditor.DEFAULTS = Object.assign(FroalaEditor.DEFAULTS, {
        wordCounter: true,
    });

    FroalaEditor.PLUGINS.charCounter = function (editor) {
        let counter;

        function countWords() {
            let text = editor.el.innerText || "";
            text = text.replace(/\s+/gi, " ");
            text = text.trim();
            return text.length ? text.split(' ').length : 0;
        }

        function timeFormat(time) {
            // Hours, minutes and seconds
            let hrs = ~~(time / 3600);
            let mins = ~~((time % 3600) / 60);
            let secs = ~~time % 60;

            // Output like "1:01" or "4:03:59" or "123:03:59"
            let ret = "";

            if (hrs > 0) {
                ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
            }

            ret += "" + mins + ":" + (secs < 10 ? "0" : "");
            ret += "" + secs;
            return ret;
        }

        function updateCounter() {
            if (editor.opts.wordCounter) {
                let count = countWords();
                let text = count + " words - " + timeFormat(count/2.957) + " speak time";

                counter.text(text);
                editor.opts.toolbarBottom && counter.css("margin-bottom", editor.$tb.outerHeight(!0));
                let t = editor.$wp.get(0).offsetWidth - editor.$wp.get(0).clientWidth;
                0 <= t && ("rtl" == editor.opts.direction ? counter.css("margin-left", t) : counter.css("margin-right", t))
            }
        }

        function _init(){
            if(!!editor.opts.wordCounter && !!editor.$wp){
                counter = editor.$('<span class="fr-counter"></span>').css({
                    'bottom' : 1,
                    'margin-right' : 2
                });

                editor.$second_tb.append(counter);
                editor.events.on("paste.afterCleanup", updateCounter);
                editor.events.on("keyup contentChanged input", function() {
                    editor.events.trigger("charCounter.update")
                });
                editor.events.on("charCounter.update", updateCounter);
                editor.events.trigger("charCounter.update");
                void editor.events.on("destroy", function() {
                    editor.$(editor.o_win).off("resize.char" + editor.id);
                    counter.removeData().remove();
                    counter = null
                });
            }
        }

        return {
            _init: _init,
            count: countWords
        }
    };

})(FroalaEditor);
