<template>
    <default-field @keydown.native.stop :field="field" :errors="errors" :full-width-content="true">
        <template slot="field">
            <froala
                v-if="!loading"
                :id="field.name"
                :tag="'textarea'"
                :config="options"
                :placeholder="field.name"
                v-model="value"
            ></froala>
        </template>
    </default-field>
</template>

<script>
import { FormField, HandlesValidationErrors } from 'laravel-nova';

import MediaConfigurator from '../MediaConfigurator';
import PluginsLoader from '../PluginsLoader';

import FroalaEditor from 'froala-editor';

// Add the custom speak button
(function(FroalaEditor){

    if( ! Nova.config.voiceSynthesizeUri ) return;

    let audioLoading = false;
    let audioPlaying = false;
    let audio = null;

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
        },

        refresh: function () {
        }
    });

})(FroalaEditor);

export default {
    mixins: [HandlesValidationErrors, FormField],

    beforeDestroy() {
        this.mediaConfigurator.cleanUp();
    },

    mounted() {
        if (typeof window.froala !== 'undefined' && typeof window.froala.events !== 'undefined') {
            _.forEach(window.froala.events, value => {
                value.apply(this);
            });
        }

        new PluginsLoader(this.options, this.$toasted).registerPlugins().then((data) => {
            this.loading = false;
        })
    },

    data() {
        return {
            loading: true,
            mediaConfigurator: new MediaConfigurator(this.resourceName, this.field, this.$toasted),
        };
    },

    computed: {
        options() {
            return _.merge(this.field.options, this.defaultConfig(), window.froala || {});
        },
    },

    methods: {
        fill(formData) {
            formData.append(this.field.attribute, this.value || '');
            formData.append(this.field.attribute + 'DraftId', this.field.draftId);
        },

        /**
         * Additional configurations
         */
        defaultConfig() {
            return this.mediaConfigurator.getConfig();
        },
    },
};
</script>
